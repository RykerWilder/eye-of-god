import asyncio
import json
import os
import shutil
import sys
import tempfile

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# Numero di siti (ordinati per popolarità) che Maigret controllerà.
# Tenuto in sync con il flag "--top-sites" passato alla CLI qui sotto,
# cosi il frontend può mostrare un dato coerente con quanto realmente scansionato.
TOP_SITES_COUNT = 500


class UsernameRequest(BaseModel):
    username: str


@router.post("")
async def check_username(request: UsernameRequest):
    username = request.username.strip()
    if not username:
        raise HTTPException(status_code=400, detail="Invalid username")

    # Maigret sostituisce "/" con "_" nel nome del file di report.
    safe_username = username.replace("/", "_")

    temp_dir = tempfile.mkdtemp()
    json_path = os.path.join(temp_dir, f"report_{safe_username}_simple.json")

    try:
        maigret_bin = os.path.join(os.path.dirname(sys.executable), "maigret")

        if not os.path.exists(maigret_bin):
            raise HTTPException(
                status_code=500,
                detail=f"Maigret binary not found in: {maigret_bin}",
            )

        proc = await asyncio.create_subprocess_exec(
            maigret_bin,
            username,
            "--json", "simple",
            "--folderoutput", temp_dir,
            "--top-sites", str(TOP_SITES_COUNT),
            "--timeout", "15",
            "--no-recursion",
            "--no-autoupdate",
            "--no-color",
            "--no-progressbar",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=300)

        if proc.returncode not in (0, 1):
            raise HTTPException(
                status_code=500,
                detail=(stderr.decode(errors="ignore") or stdout.decode(errors="ignore") or "Errore Maigret").strip(),
            )

        if not os.path.exists(json_path):
            return {"checked": TOP_SITES_COUNT, "results": []}

        with open(json_path, "r", encoding="utf-8", errors="ignore") as f:
            raw = json.load(f)

        results = []
        for site_name, entry in raw.items():
            if not isinstance(entry, dict):
                continue

            status = entry.get("status") or {}
            url = entry.get("url_user") or status.get("url") or ""
            if not url:
                continue

            results.append({
                "name": site_name,
                "found": True,
                "url": url,
                "tags": status.get("tags") or [],
            })

        results.sort(key=lambda x: x["name"].lower())
        return {"checked": TOP_SITES_COUNT, "results": results}

    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Maigret timeout")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)