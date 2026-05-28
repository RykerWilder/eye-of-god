import asyncio
import subprocess
import json
import sys

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class UsernameRequest(BaseModel):
    username: str


@router.post("")
async def check_username(request: UsernameRequest):
    username = request.username.strip()
    if not username:
        raise HTTPException(status_code=400, detail="Username non valido")

    try:
        import sherlock  # noqa: F401
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="sherlock non installato. Esegui: pip install sherlock-project",
        )

    try:
        proc = await asyncio.create_subprocess_exec(
            sys.executable, "-m", "sherlock", username, "--json", "--no-color",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=120)
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Sherlock timeout")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    try:
        raw: dict = json.loads(stdout.decode())
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Output sherlock non parsabile")

    results = [
        {
            "name":  site,
            "found": info.get("status") == "Claimed",
            "url":   info.get("url_user"),
        }
        for site, info in raw.items()
    ]

    results.sort(key=lambda x: (not x["found"], x["name"].lower()))
    return results