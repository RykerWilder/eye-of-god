import asyncio
from typing import Any, Optional

import dns.resolver
import dns.reversename
import dns.exception
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field


router = APIRouter()

# Record types esposti dal tool
RECORD_TYPES = ["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA", "SRV"]

DEFAULT_TIMEOUT = 5.0


class DnsRequest(BaseModel):
    domain: str = Field(..., description="Dominio da interrogare, es. example.com")
    record_types: Optional[list[str]] = Field(
        default=None,
        description="Sottoinsieme di record da interrogare (default: tutti i tipi supportati).",
    )
    resolver: Optional[str] = Field(
        default=None,
        description="IP di un DNS server custom da usare per la risoluzione (opzionale).",
    )


def _build_resolver(custom_ip: Optional[str]) -> dns.resolver.Resolver:
    resolver = dns.resolver.Resolver()
    resolver.timeout = DEFAULT_TIMEOUT
    resolver.lifetime = DEFAULT_TIMEOUT
    if custom_ip:
        resolver.nameservers = [custom_ip]
    return resolver


def _serialize_rdata(rtype: str, rdata: Any) -> Any:
    if rtype == "MX":
        return {"priority": rdata.preference, "exchange": str(rdata.exchange).rstrip(".")}
    if rtype == "SOA":
        return {
            "mname": str(rdata.mname).rstrip("."),
            "rname": str(rdata.rname).rstrip("."),
            "serial": rdata.serial,
            "refresh": rdata.refresh,
            "retry": rdata.retry,
            "expire": rdata.expire,
            "minimum": rdata.minimum,
        }
    if rtype == "SRV":
        return {
            "priority": rdata.priority,
            "weight": rdata.weight,
            "port": rdata.port,
            "target": str(rdata.target).rstrip("."),
        }
    if rtype == "TXT":
        return " ".join(part.decode(errors="replace") if isinstance(part, bytes) else str(part) for part in rdata.strings)
    # A, AAAA, NS, CNAME
    return str(rdata).rstrip(".")


def _query_one(resolver: dns.resolver.Resolver, domain: str, rtype: str) -> dict:
    try:
        answer = resolver.resolve(domain, rtype)
        return {
            "type": rtype,
            "status": "ok",
            "ttl": answer.rrset.ttl if answer.rrset else None,
            "records": [_serialize_rdata(rtype, r) for r in answer],
        }
    except dns.resolver.NXDOMAIN:
        return {"type": rtype, "status": "nxdomain", "ttl": None, "records": []}
    except dns.resolver.NoAnswer:
        return {"type": rtype, "status": "no_answer", "ttl": None, "records": []}
    except dns.resolver.NoNameservers:
        return {"type": rtype, "status": "no_nameservers", "ttl": None, "records": []}
    except dns.exception.Timeout:
        return {"type": rtype, "status": "timeout", "ttl": None, "records": []}
    except Exception as e:
        return {"type": rtype, "status": "error", "ttl": None, "records": [], "error": str(e)}


async def _reverse_lookup(resolver: dns.resolver.Resolver, domain: str) -> Optional[str]:
    """Se il dominio e' in realta' un IP, prova una PTR lookup."""
    try:
        rev_name = dns.reversename.from_address(domain)
    except dns.exception.SyntaxError:
        return None

    def _do():
        try:
            answer = resolver.resolve(rev_name, "PTR")
            return str(answer[0]).rstrip(".")
        except Exception:
            return None

    return await asyncio.to_thread(_do)


@router.post("")
async def inspect_dns(request: DnsRequest):
    domain = request.domain.strip().lower().rstrip(".")
    if not domain:
        raise HTTPException(status_code=400, detail="Dominio non valido.")

    resolver = _build_resolver(request.resolver)

    # Se e' un IP, fai reverse DNS lookup invece dei record standard
    ptr = await _reverse_lookup(resolver, domain)
    if ptr is not None:
        return {
            "domain": domain,
            "isIp": True,
            "ptr": ptr,
            "records": [],
            "resolverUsed": resolver.nameservers,
        }

    types_to_query = request.record_types or RECORD_TYPES
    invalid = [t for t in types_to_query if t.upper() not in RECORD_TYPES]
    if invalid:
        raise HTTPException(
            status_code=400,
            detail=f"Tipi di record non supportati: {', '.join(invalid)}. Validi: {', '.join(RECORD_TYPES)}",
        )

    tasks = [
        asyncio.to_thread(_query_one, resolver, domain, rtype.upper())
        for rtype in types_to_query
    ]
    results = await asyncio.gather(*tasks)

    if all(r["status"] in ("nxdomain",) for r in results):
        raise HTTPException(status_code=404, detail="Dominio non trovato (NXDOMAIN).")

    return {
        "domain": domain,
        "isIp": False,
        "ptr": None,
        "records": results,
        "resolverUsed": resolver.nameservers,
    }
