import os
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

router = APIRouter()

ABUSEIPDB_BASE_URL = "https://api.abuseipdb.com/api/v2"

CATEGORY_MAP = {
    "1": "DNS Compromise", "2": "DNS Poisoning", "3": "Fraud Orders",
    "4": "DDoS Attack", "5": "FTP Brute-Force", "6": "Ping of Death",
    "7": "Phishing", "8": "Fraud VoIP", "9": "Open Proxy",
    "10": "Web Spam", "11": "Email Spam", "12": "Blog Spam",
    "13": "VPN IP", "14": "Port Scan", "15": "Hacking",
    "16": "SQL Injection", "17": "Spoofing", "18": "Brute-Force",
    "19": "Bad Web Bot", "20": "Exploited Host", "21": "Web App Attack",
    "22": "SSH", "23": "IoT Targeted",
}


class IPRequest(BaseModel):
    ip: str
    maxAgeInDays: int = 90
    verbose: bool = True


def _get_api_key() -> str:
    key = os.getenv("ABUSEIPDB_API_KEY", "").strip()
    if not key:
        raise HTTPException(
            status_code=500,
            detail="ABUSEIPDB_API_KEY non configurata. Imposta la variabile d'ambiente.",
        )
    return key


def _headers(key: str) -> dict:
    return {"Key": key, "Accept": "application/json"}


async def _abuseipdb_get(
    client: httpx.AsyncClient, path: str, params: dict, key: str
) -> dict:
    try:
        resp = await client.get(
            f"{ABUSEIPDB_BASE_URL}{path}",
            params=params,
            headers=_headers(key),
            timeout=15.0,
        )
        if resp.status_code == 401:
            raise HTTPException(status_code=401, detail="Invalid AbuseIPDB API key.")
        if resp.status_code == 422:
            raise HTTPException(status_code=422, detail="Invalid IP.")
        if resp.status_code == 429:
            raise HTTPException(status_code=429, detail="Rate limit AbuseIPDB")
        resp.raise_for_status()
        return resp.json()
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Timeout during request AbuseIPDB.")
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"AbuseIPDB error: {e}")


@router.post("")
async def check_ip(request: IPRequest):
    ip = request.ip.strip()
    if not ip:
        raise HTTPException(status_code=400, detail="IP non valido.")

    key = _get_api_key()
    params = {
        "ipAddress":    ip,
        "maxAgeInDays": request.maxAgeInDays,
    }
    if request.verbose:
        params["verbose"] = "" 

    async with httpx.AsyncClient() as client:
        data = await _abuseipdb_get(client, "/check", params, key)

    d = data.get("data", {})

    reports = []
    for r in d.get("reports", []):
        reports.append({
            "reportedAt":      r.get("reportedAt"),
            "comment":         r.get("comment", ""),
            "categories":      [
                CATEGORY_MAP.get(str(c), str(c)) for c in r.get("categories", [])
            ],
            "reporterCountry": r.get("reporterCountryCode"),
        })

    # Output normalizzato — stessa filosofia di holehe
    result = {
        "ip":                   d.get("ipAddress"),
        "isPublic":             d.get("isPublic"),
        "version":              d.get("ipVersion"),
        "isWhitelisted":        d.get("isWhitelisted", False),
        "abuseScore":           d.get("abuseConfidenceScore", 0),   # 0-100
        "countryCode":          d.get("countryCode"),
        "countryName":          d.get("countryName"),
        "usageType":            d.get("usageType"),
        "isp":                  d.get("isp"),
        "domain":               d.get("domain"),
        "isTor":                d.get("isTor", False),
        "totalReports":         d.get("totalReports", 0),
        "numDistinctUsers":     d.get("numDistinctUsers", 0),
        "lastReportedAt":       d.get("lastReportedAt"),
        "reports":              reports,
    }

    return result