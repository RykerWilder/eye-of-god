import asyncio
import importlib
import pkgutil

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class EmailRequest(BaseModel):
    email: str


@router.post("")
async def check_email(request: EmailRequest):
    email = request.email.strip()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Email non valida")

    try:
        from holehe import modules as holehe_modules
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="holehe non installato. Esegui: pip install holehe",
        )

    raw_out = []

    async with httpx.AsyncClient() as client:
        tasks = []
        for _, modname, _ in pkgutil.walk_packages(
            path=holehe_modules.__path__,
            prefix=holehe_modules.__name__ + ".",
            onerror=lambda x: None,
        ):
            try:
                mod = importlib.import_module(modname)
                fn_name = modname.split(".")[-1]
                if hasattr(mod, fn_name):
                    tasks.append(getattr(mod, fn_name)(email, client, raw_out))
            except Exception:
                continue

        await asyncio.gather(*tasks, return_exceptions=True)

    results = [
        {
            "name":      item.get("name", "Unknown"),
            "found":     item.get("exists", False),
            "domain":    item.get("domain"),
            "rateLimit": item.get("rateLimit", False),
        }
        for item in raw_out if isinstance(item, dict)
    ]

    results.sort(key=lambda x: (not x["found"], x["name"].lower()))
    return results