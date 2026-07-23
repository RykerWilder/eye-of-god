import asyncio
import os
import tempfile
from typing import Any

from fastapi import APIRouter, File, HTTPException, UploadFile

router = APIRouter()

_tika = None
_tika_lock = asyncio.Lock()

MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 
CONTENT_PREVIEW_CHARS = 2000


async def _get_tika():
    global _tika
    if _tika is None:
        async with _tika_lock:
            if _tika is None:
                from tikara import Tika

                _tika = await asyncio.to_thread(Tika)
    return _tika


def _serialize_metadata(metadata: Any) -> dict:
    """Normalizes Tikara's (pydantic) metadata object into a plain JSON-safe dict."""
    if metadata is None:
        return {}

    if hasattr(metadata, "model_dump"):
        try:
            data = metadata.model_dump(mode="json", exclude_none=True)
        except TypeError:
            data = metadata.model_dump(exclude_none=True)
    elif isinstance(metadata, dict):
        data = metadata
    else:
        try:
            data = dict(metadata)
        except Exception:
            return {"raw": str(metadata)}

    clean = {}
    for key, value in data.items():
        if isinstance(value, (str, int, float, bool)) or value is None:
            clean[key] = value
        elif isinstance(value, (list, tuple)):
            clean[key] = [str(v) for v in value]
        else:
            clean[key] = str(value)
    return clean


@router.post("")
async def extract_metadata(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Nessun file fornito.")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Il file è vuoto.")
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="File troppo grande (limite 50MB).")

    suffix = os.path.splitext(file.filename)[1]
    tmp_path = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(contents)
            tmp_path = tmp.name

        tika = await _get_tika()

        try:
            content, metadata = await asyncio.to_thread(tika.parse, tmp_path)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Impossibile analizzare il file: {e}")

        metadata_dict = _serialize_metadata(metadata)

        content_preview = None
        if isinstance(content, str) and content.strip():
            stripped = content.strip()
            content_preview = stripped[:CONTENT_PREVIEW_CHARS]

        return {
            "filename": file.filename,
            "sizeBytes": len(contents),
            "mimeType": metadata_dict.get("Content-Type") or file.content_type,
            "metadata": metadata_dict,
            "contentPreview": content_preview,
            "contentTruncated": bool(content_preview) and len(content.strip()) > CONTENT_PREVIEW_CHARS,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore interno: {e}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)