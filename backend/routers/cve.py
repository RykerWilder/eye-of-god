import os
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any

import httpx
from fastapi import APIRouter, HTTPException, Query

router = APIRouter()

NVD_BASE_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0"


def _extract_score(metrics: dict) -> dict:
    """
    Extracts the most recent CVSS score available (v3.1 > v3.0 > v2)
    and returns score, severity, and version used.
    """
    for key, version in (
        ("cvssMetricV31", "3.1"),
        ("cvssMetricV30", "3.0"),
        ("cvssMetricV2", "2.0"),
    ):
        entries = metrics.get(key)
        if entries:
            entry = entries[0]
            cvss_data = entry.get("cvssData", {})
            return {
                "score": cvss_data.get("baseScore"),
                "severity": entry.get("baseSeverity") or cvss_data.get("baseSeverity"),
                "version": version,
            }
    return {"score": None, "severity": None, "version": None}


def _extract_description(descriptions: list) -> str:
    for d in descriptions:
        if d.get("lang") == "en":
            return d.get("value", "")
    return descriptions[0].get("value", "") if descriptions else ""


def get_severity(cvss_score: float) -> str:
    """Returns severity label based on CVSS score."""
    if cvss_score == 0:
        return "None"
    elif cvss_score < 4.0:
        return "Low"
    elif cvss_score < 7.0:
        return "Medium"
    elif cvss_score < 9.0:
        return "High"
    else:
        return "Critical"


def get_severity_color(severity: str) -> str:
    """Returns color hex code for severity level."""
    colors = {
        "None": "#00ff41",
        "Low": "#ffaa00",
        "Medium": "#ff8a3d",
        "High": "#ff4d4d",
        "Critical": "#ff0000",
    }
    return colors.get(severity, "#888888")


@router.get("/latest")
async def latest_cves(limit: int = Query(10, ge=1, le=50)):
    now = datetime.now(timezone.utc)
    start = now - timedelta(days=7)

    params = {
        "pubStartDate": start.strftime("%Y-%m-%dT%H:%M:%S.000"),
        "pubEndDate": now.strftime("%Y-%m-%dT%H:%M:%S.000"),
        "resultsPerPage": 5,
    }

    headers = {"Accept": "application/json"}

    # Optional API key support (higher rate limits)
    api_key = os.getenv("NVD_API_KEY", "").strip()
    if api_key:
        headers["apiKey"] = api_key

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                NVD_BASE_URL, params=params, headers=headers, timeout=20.0
            )
            
            # Handle specific NVD errors
            if resp.status_code == 429:
                raise HTTPException(
                    status_code=429, 
                    detail="NVD rate limit reached. Please wait a few seconds and try again."
                )
            if resp.status_code == 403:
                raise HTTPException(
                    status_code=403,
                    detail="Access denied by NVD. Please verify the URL is correct."
                )
            resp.raise_for_status()
            data = resp.json()
            
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504, 
            detail="Timeout while requesting NVD. Please try again later."
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=502, 
            detail=f"NVD connection error: {str(e)}"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error parsing NVD response: {str(e)}"
        )

    vulnerabilities = data.get("vulnerabilities", [])

    items = []
    for entry in vulnerabilities:
        cve = entry.get("cve", {})
        cve_id = cve.get("id")
        if not cve_id:
            continue

        metrics = cve.get("metrics", {})
        score_info = _extract_score(metrics)
        description = _extract_description(cve.get("descriptions", []))

        items.append({
            "id": cve_id,
            "published": cve.get("published"),
            "lastModified": cve.get("lastModified"),
            "score": score_info["score"],
            "severity": score_info["severity"],
            "cvssVersion": score_info["version"],
            "description": description[:220],
            "nvdUrl": f"https://nvd.nist.gov/vuln/detail/{cve_id}",
        })

    # Sort by publication date, most recent first
    items.sort(key=lambda x: x["published"] or "", reverse=True)

    return {"total": len(items), "results": items[:limit]}


@router.get("/nvd-severity")
async def get_nvd_severity() -> List[Dict[str, Any]]:
    """
    Returns a list of recent CVEs with their severity information.
    This endpoint matches the original script's logic.
    """
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=7)

    params = {
        "resultsPerPage": 10,
        "pubStartDate": start_date.strftime("%Y-%m-%dT%H:%M:%S.000"),
        "pubEndDate": end_date.strftime("%Y-%m-%dT%H:%M:%S.000"),
    }

    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            resp = await client.get(NVD_BASE_URL, params=params)
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"NVD API error: {exc}")

    if resp.status_code != 200:
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"NVD API {resp.status_code}: {resp.text[:200]}"
        )

    data = resp.json()
    vulnerabilities = data.get("vulnerabilities", [])

    if not vulnerabilities:
        return []

    normalized = []
    for vuln in vulnerabilities[:10]:
        cve = vuln.get("cve", {})
        cvss_v31 = cve.get("metrics", {}).get("cvssMetricV31", [{}])[0]
        cvss_v2 = cve.get("metrics", {}).get("cvssMetricV2", [{}])[0]
        cvss_v3_score = cvss_v31.get("cvssData", {}).get("baseScore", 0)
        cvss_v2_score = cvss_v2.get("cvssData", {}).get("baseScore", 0)
        cvss_score = cvss_v3_score or cvss_v2_score or 0
        severity = get_severity(cvss_score)
        color = get_severity_color(severity)
        normalized.append({
            "cveId": cve.get("id", "Unknown"),
            "cvssScore": float(cvss_score),
            "severity": severity,
            "color": color,
            "borderColor": color.replace("#", "#aa") if "#" in color else color,
        })

    return normalized