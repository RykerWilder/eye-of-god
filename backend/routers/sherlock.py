import asyncio
import csv
import os
import sys
import tempfile
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class UsernameRequest(BaseModel):
    username: str


@router.post("")
async def check_username(request: UsernameRequest):
    username = request.username.strip()
    if not username:
        raise HTTPException(status_code=400, detail="Invalid username")

    temp_dir = tempfile.mkdtemp()
    csv_path = os.path.join(temp_dir, f"{username}.csv")

    try:
        sherlock_bin = os.path.join(os.path.dirname(sys.executable), "sherlock")

        if not os.path.exists(sherlock_bin):
            raise HTTPException(
                status_code=500,
                detail=f"Sherlock binary not found in: {sherlock_bin}",
            )

        proc = await asyncio.create_subprocess_exec(
            sherlock_bin,
            username,
            "--csv",
            "--folderoutput", temp_dir,
            "--no-color",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=180)

        if proc.returncode not in (0, 1):
            raise HTTPException(
                status_code=500,
                detail=(stderr.decode(errors="ignore") or stdout.decode(errors="ignore") or "Errore Sherlock").strip(),
            )

        if not os.path.exists(csv_path):
            return []

        results = []
        with open(csv_path, "r", encoding="utf-8", errors="ignore") as f:
            reader = csv.DictReader(f)
            for row in reader:
                url = (
                    row.get("url_user")
                    or row.get("url")
                    or row.get("profile_url")
                    or ""
                ).strip()

                site = (
                    row.get("site_name")
                    or row.get("site")
                    or row.get("name")
                    or "Unknown"
                ).strip()

                if url:
                    results.append({
                        "name": site,
                        "found": True,
                        "url": url,
                    })

        results.sort(key=lambda x: x["name"].lower())
        return results

    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Sherlock timeout")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            if os.path.exists(csv_path):
                os.remove(csv_path)
            if os.path.exists(temp_dir):
                os.rmdir(temp_dir)
        except Exception:
            pass