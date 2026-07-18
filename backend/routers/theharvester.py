import asyncio
import json
import os
import re
import shutil
import sys
import tempfile
from typing import List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

FREE_SOURCES = [
    "baidu",
    "crtsh",
    "dnsdumpster",
    "duckduckgo",
    "github-code",
    "hackertarget",
    "otx",
    "rapiddns",
    "subdomaincenter",
    "subdomainfinderc99",
    "thc",
    "threatminer",
    "urlscan",
    "yahoo",
]

KEY_REQUIRED_SOURCES = [
    "bevigil",
    "brave",
    "bufferoverun",
    "builtwith",
    "censys",
    "criminalip",
    "dehashed",
    "dymo",
    "fofa",
    "fullhunt",
    "haveibeenpwned",
    "hunter",
    "hunterhow",
    "intelx",
    "leakix",
    "leaklookup",
    "mojeek",
    "netlas",
    "onyphe",
    "pentesttools",
    "projecdiscovery",
    "rocketreach",
    "securityscorecard",
    "securityTrails",
    "sherlockeye",
    "shodan",
    "tomba",
    "venacus",
    "virustotal",
    "whoisxml",
    "windvane",
    "zoomeye",
]

ALLOWED_SOURCES = set(FREE_SOURCES) | set(KEY_REQUIRED_SOURCES)

DEFAULT_SOURCES = ["baidu", "crtsh", "hackertarget", "otx", "rapiddns", "urlscan"]

_DOMAIN_RE = re.compile(
    r"^(?=.{1,253}$)(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z0-9-]{1,63}(?<!-))+$"
)

MIN_LIMIT = 1
MAX_LIMIT = 1000
DEFAULT_LIMIT = 500

SUBPROCESS_TIMEOUT = 240


class HarvesterRequest(BaseModel):
    domain: str
    sources: List[str] = Field(default_factory=lambda: list(DEFAULT_SOURCES))
    limit: int = DEFAULT_LIMIT


def _sanitize_domain(domain: str) -> str:
    domain = (domain or "").strip().lower()
    if not domain or not _DOMAIN_RE.match(domain):
        raise HTTPException(status_code=400, detail="Dominio non valido.")
    return domain


def _sanitize_sources(sources: List[str]) -> List[str]:
    cleaned = []
    seen = set()
    for raw in sources or []:
        value = (raw or "").strip()
        if not value:
            continue
        if value not in ALLOWED_SOURCES:
            raise HTTPException(status_code=400, detail=f"Fonte non valida: {value}")
        if value not in seen:
            seen.add(value)
            cleaned.append(value)

    if not cleaned:
        raise HTTPException(status_code=400, detail="Seleziona almeno una fonte valida.")
    return cleaned


def _sanitize_limit(limit: int) -> int:
    try:
        limit = int(limit)
    except (TypeError, ValueError):
        return DEFAULT_LIMIT
    return max(MIN_LIMIT, min(limit, MAX_LIMIT))


def _dedupe_sorted(values) -> List[str]:
    if not values:
        return []
    cleaned = {str(v).strip() for v in values if str(v).strip()}
    return sorted(cleaned)


@router.post("")
async def run_theharvester(request: HarvesterRequest):
    domain = _sanitize_domain(request.domain)
    sources = _sanitize_sources(request.sources)
    limit = _sanitize_limit(request.limit)

    harvester_bin = (
        os.environ.get("THEHARVESTER_BIN")
        or shutil.which("theHarvester")
        or os.path.join(os.path.dirname(sys.executable), "theHarvester")
    )

    if not harvester_bin or not os.path.exists(harvester_bin):
        raise HTTPException(
            status_code=500,
            detail="theHarvester binary not found. Esegui: pip install theHarvester",
        )

    temp_dir = tempfile.mkdtemp()
    output_base = os.path.join(temp_dir, "result")
    json_path = output_base + ".json"

    try:
        proc = await asyncio.create_subprocess_exec(
            harvester_bin,
            "-d", domain,
            "-b", ",".join(sources),
            "-l", str(limit),
            "-f", output_base,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        stdout, stderr = await asyncio.wait_for(
            proc.communicate(), timeout=SUBPROCESS_TIMEOUT
        )

        if proc.returncode not in (0, 1):
            raise HTTPException(
                status_code=500,
                detail=(stderr.decode(errors="ignore") or stdout.decode(errors="ignore") or "Errore theHarvester").strip(),
            )

        if not os.path.exists(json_path):
            return {
                "domain": domain,
                "sources": sources,
                "hosts": [],
                "emails": [],
                "ips": [],
                "asns": [],
                "urls": [],
                "vhosts": [],
            }

        with open(json_path, "r", encoding="utf-8", errors="ignore") as f:
            raw = json.load(f)

        return {
            "domain": domain,
            "sources": sources,
            "hosts": _dedupe_sorted(raw.get("hosts")),
            "emails": _dedupe_sorted(raw.get("emails")),
            "ips": _dedupe_sorted(raw.get("ips")),
            "asns": _dedupe_sorted(raw.get("asns")),
            "urls": _dedupe_sorted(raw.get("interesting_urls") or raw.get("urls")),
            "vhosts": _dedupe_sorted(raw.get("vhosts")),
        }

    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="theHarvester timeout")
    except HTTPException:
        raise
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="Impossibile leggere l'output di theHarvester.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            shutil.rmtree(temp_dir, ignore_errors=True)
        except Exception:
            pass


@router.get("/sources")
async def list_sources():
    return {
        "free": FREE_SOURCES,
        "keyRequired": KEY_REQUIRED_SOURCES,
        "default": DEFAULT_SOURCES,
    }