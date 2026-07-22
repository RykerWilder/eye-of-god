import asyncio
import ipaddress
from typing import Any, Optional

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

IP_API_URL = "http://ip-api.com/json/{ip}"
IP_API_FIELDS = (
    "status,message,continent,continentCode,country,countryCode,region,"
    "regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,"
    "as,asname,reverse,mobile,proxy,hosting,query"
)


class IPTrackerRequest(BaseModel):
    ip: str = Field(..., description="Indirizzo IP da analizzare, es. 8.8.8.8")


def _validate_ip(raw: str) -> ipaddress._BaseAddress:
    try:
        return ipaddress.ip_address(raw.strip())
    except ValueError:
        raise HTTPException(status_code=400, detail="Indirizzo IP non valido.")


def _private_flags(addr: ipaddress._BaseAddress) -> dict:
    return {
        "isPrivate": addr.is_private,
        "isLoopback": addr.is_loopback,
        "isLinkLocal": addr.is_link_local,
        "isMulticast": addr.is_multicast,
        "isReserved": addr.is_reserved,
        "isGlobal": addr.is_global,
    }


async def _geo_lookup(client: httpx.AsyncClient, ip: str) -> Optional[dict]:
    try:
        resp = await client.get(
            IP_API_URL.format(ip=ip),
            params={"fields": IP_API_FIELDS},
            timeout=10.0,
        )
        resp.raise_for_status()
        data = resp.json()
        if data.get("status") != "success":
            return {"error": data.get("message", "Lookup non riuscito.")}
        return data
    except httpx.TimeoutException:
        return {"error": "Timeout durante la richiesta al servizio di geolocalizzazione."}
    except httpx.RequestError as e:
        return {"error": f"Errore geolocalizzazione: {e}"}


def _rdap_lookup_sync(ip: str) -> dict:
    from ipwhois import IPWhois
    from ipwhois.exceptions import IPDefinedError, ASNRegistryError, HTTPLookupError

    try:
        obj = IPWhois(ip)
        result = obj.lookup_rdap(depth=1, inc_raw=False)
    except IPDefinedError:
        return {"error": "IP privato/riservato: nessun dato RDAP disponibile."}
    except (ASNRegistryError, HTTPLookupError) as e:
        return {"error": f"Errore RDAP: {e}"}
    except Exception as e:
        return {"error": f"Errore RDAP: {e}"}

    network = result.get("network") or {}
    entities = result.get("entities") or []
    objects = result.get("objects") or {}

    abuse_emails = []
    for handle in entities:
        ent = objects.get(handle) or {}
        roles = ent.get("roles") or []
        if "abuse" in roles:
            contact = ent.get("contact") or {}
            for email in contact.get("email") or []:
                addr = email.get("value") if isinstance(email, dict) else email
                if addr:
                    abuse_emails.append(addr)

    return {
        "asn": result.get("asn"),
        "asnCidr": result.get("asn_cidr"),
        "asnCountry": result.get("asn_country_code"),
        "asnDescription": result.get("asn_description"),
        "asnRegistry": result.get("asn_registry"),
        "asnDate": result.get("asn_date"),
        "networkCidr": network.get("cidr"),
        "networkName": network.get("name"),
        "networkHandle": network.get("handle"),
        "networkStartAddress": network.get("start_address"),
        "networkEndAddress": network.get("end_address"),
        "networkCountry": network.get("country"),
        "networkType": network.get("type"),
        "networkParentHandle": network.get("parent_handle"),
        "abuseEmails": sorted(set(abuse_emails)),
    }


async def _rdap_lookup(ip: str) -> dict:
    return await asyncio.to_thread(_rdap_lookup_sync, ip)


@router.post("")
async def track_ip(request: IPTrackerRequest):
    raw_ip = request.ip.strip()
    if not raw_ip:
        raise HTTPException(status_code=400, detail="Indirizzo IP non valido.")

    addr = _validate_ip(raw_ip)
    ip = str(addr)
    flags = _private_flags(addr)

    if not addr.is_global:
        # Niente da chiedere ai servizi esterni per IP privati/riservati.
        return {
            "ip": ip,
            "version": addr.version,
            **flags,
            "geo": {"error": "IP non instradabile su internet (privato/riservato)."},
            "network": {"error": "IP non instradabile su internet (privato/riservato)."},
        }

    async with httpx.AsyncClient() as client:
        geo_task = _geo_lookup(client, ip)
        rdap_task = _rdap_lookup(ip)
        geo, network = await asyncio.gather(geo_task, rdap_task)

    return {
        "ip": ip,
        "version": addr.version,
        **flags,
        "geo": geo,
        "network": network,
    }