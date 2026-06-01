import os
import asyncio
from datetime import datetime, timezone
from typing import Any, Optional

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from whois import whois as whois_query


router = APIRouter()


class WhoisRequest(BaseModel):
    domain: str = Field(..., description="Domain to lookup, es. example.com")
    verbose: bool = True


def _get_api_key() -> str:
    key = os.getenv("WHOIS_API_KEY", "").strip()
    if not key:
        raise HTTPException(
            status_code=500,
            detail="WHOIS_API_KEY non configurata. Imposta la variabile d'ambiente.",
        )
    return key


def _ts_to_iso(value: Any) -> Optional[str]:
    if value in (None, "", 0):
        return None
    try:
        if isinstance(value, str):
            return value
        dt: datetime
        if isinstance(value, datetime):
            dt = value
        else:
            dt = datetime.fromtimestamp(int(value), tz=timezone.utc)
        return dt.isoformat()
    except (TypeError, ValueError, OSError):
        return None


def _normalize_dates(dates: Any) -> Optional[str]:
    if dates is None:
        return None
    if isinstance(dates, list):
        if not dates:
            return None
        dates = dates[0]
    return _ts_to_iso(dates)


async def _whois_lookup(domain: str) -> dict:
    try:
        w = await asyncio.to_thread(whois_query, domain)
        if w is None or not w.domain_name:
            raise HTTPException(status_code=404, detail="WHOIS non trovato per il dominio richiesto.")
        return w
    except HTTPException:
        raise
    except Exception as e:
        if "NOT FOUND" in str(e) or "no match" in str(e).lower():
            raise HTTPException(status_code=404, detail="WHOIS non trovato per il dominio richiesto.")
        raise HTTPException(status_code=502, detail=f"WHOIS error: {e}")


@router.post("")
async def check_whois(request: WhoisRequest):
    domain = request.domain.strip().lower()
    if not domain:
        raise HTTPException(status_code=400, detail="Dominio non valido.")

    w = await _whois_lookup(domain)

    result = {
        "domain": w.domain_name[0] if isinstance(w.domain_name, list) else w.domain_name,
        "registrar": w.registrar,
        "whoisServer": w.whois_server,
        "createdAt": _normalize_dates(w.creation_date),
        "updatedAt": _normalize_dates(w.updated_date),
        "expiresAt": _normalize_dates(w.expiration_date),
        "nameServers": w.name_servers if isinstance(w.name_servers, list) else [w.name_servers],
        "dnssec": w.dnssec,
        "status": w.status if isinstance(w.status, list) else [w.status] if w.status else [],
        "registrant": {
            "name": w.registrant_name,
            "organization": w.registrant_organization,
            "street": w.registrant_street,
            "city": w.registrant_city,
            "state": w.registrant_state,
            "postalCode": w.registrant_postal_code,
            "country": w.registrant_country,
            "email": w.registrant_email,
            "phone": w.registrant_phone,
        },
        "admin": {
            "name": w.admin_name,
            "organization": w.admin_organization,
            "email": w.admin_email,
            "phone": w.admin_phone,
        },
        "tech": {
            "name": w.tech_name,
            "organization": w.tech_organization,
            "email": w.tech_email,
            "phone": w.tech_phone,
        },
    }

    if request.verbose:
        result["raw"] = {
            "text": w.text,
            "_dict": dict(w),
        }

    return result