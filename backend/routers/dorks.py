from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()


class DorkBuildRequest(BaseModel):
    query: Optional[str] = None
    terms: List[str] = Field(default_factory=list)
    exact_phrases: List[str] = Field(default_factory=list)
    exclude_terms: List[str] = Field(default_factory=list)
    site: List[str] = Field(default_factory=list)
    filetype: List[str] = Field(default_factory=list)
    ext: List[str] = Field(default_factory=list)
    inurl: List[str] = Field(default_factory=list)
    intitle: List[str] = Field(default_factory=list)
    intext: List[str] = Field(default_factory=list)
    allinurl: List[str] = Field(default_factory=list)
    allintitle: List[str] = Field(default_factory=list)
    allintext: List[str] = Field(default_factory=list)
    after: Optional[str] = None
    before: Optional[str] = None


_ALLOWED_TOKEN_CHARS = set(
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._:/@"
)


def _sanitize_free_text(value: str) -> str:
    value = (value or "").strip()
    if not value:
        return ""
    return " ".join(value.split())


def _sanitize_token(value: str) -> str:
    value = (value or "").strip()
    if not value:
        return ""
    if any(ch not in _ALLOWED_TOKEN_CHARS for ch in value):
        raise HTTPException(status_code=400, detail=f"Invalid token: {value}")
    return value


def _validate_date(value: Optional[str], field_name: str) -> str:
    value = (value or "").strip()
    if not value:
        return ""
    try:
        datetime.strptime(value, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid {field_name} date format, expected YYYY-MM-DD"
        )
    return value


def _quote(value: str) -> str:
    value = _sanitize_free_text(value)
    if not value:
        return ""
    value = value.replace('"', "")
    return f'"{value}"'


def _quote_if_needed(value: str) -> str:
    value = _sanitize_free_text(value)
    if not value:
        return ""
    return _quote(value) if " " in value else value.replace('"', "")


def _build_or_group(values: List[str], formatter) -> str:
    cleaned = [formatter(v) for v in values if formatter(v)]
    if not cleaned:
        return ""
    if len(cleaned) == 1:
        return cleaned[0]
    return "(" + " OR ".join(cleaned) + ")"


def build_dork(request: DorkBuildRequest) -> str:
    parts: List[str] = []

    query = _sanitize_free_text(request.query or "")
    if query:
        parts.append(query)

    terms = [_quote_if_needed(t) for t in request.terms if _sanitize_free_text(t)]
    if terms:
        parts.append(_build_or_group(terms, lambda x: x))

    exact_phrases = [_quote(p) for p in request.exact_phrases if _sanitize_free_text(p)]
    if exact_phrases:
        parts.extend(exact_phrases)

    exclude_terms = [_quote_if_needed(t) for t in request.exclude_terms if _sanitize_free_text(t)]
    if exclude_terms:
        parts.extend(f"-{term}" for term in exclude_terms)

    sites = [_sanitize_token(v) for v in request.site if _sanitize_token(v)]
    if sites:
        parts.append(_build_or_group(sites, lambda v: f"site:{v}"))

    filetypes = [_sanitize_token(v) for v in request.filetype if _sanitize_token(v)]
    if filetypes:
        parts.append(_build_or_group(filetypes, lambda v: f"filetype:{v}"))

    exts = [_sanitize_token(v) for v in request.ext if _sanitize_token(v)]
    if exts:
        parts.append(_build_or_group(exts, lambda v: f"ext:{v}"))

    inurl_values = [_sanitize_free_text(v) for v in request.inurl if _sanitize_free_text(v)]
    if inurl_values:
        parts.extend(f"inurl:{_quote_if_needed(v)}" for v in inurl_values)

    intitle_values = [_sanitize_free_text(v) for v in request.intitle if _sanitize_free_text(v)]
    if intitle_values:
        parts.extend(f"intitle:{_quote_if_needed(v)}" for v in intitle_values)

    intext_values = [_sanitize_free_text(v) for v in request.intext if _sanitize_free_text(v)]
    if intext_values:
        parts.extend(f"intext:{_quote_if_needed(v)}" for v in intext_values)

    if request.allinurl:
        values = [_sanitize_free_text(v) for v in request.allinurl if _sanitize_free_text(v)]
        if values:
            parts.append("allinurl:" + " ".join(v.replace('"', "") for v in values))

    if request.allintitle:
        values = [_sanitize_free_text(v) for v in request.allintitle if _sanitize_free_text(v)]
        if values:
            parts.append("allintitle:" + " ".join(_quote_if_needed(v) for v in values))

    if request.allintext:
        values = [_sanitize_free_text(v) for v in request.allintext if _sanitize_free_text(v)]
        if values:
            parts.append("allintext:" + " ".join(_quote_if_needed(v) for v in values))

    after = _validate_date(request.after, "after")
    if after:
        parts.append(f"after:{after}")

    before = _validate_date(request.before, "before")
    if before:
        parts.append(f"before:{before}")

    dork = " ".join(part for part in parts if part).strip()
    if not dork:
        raise HTTPException(status_code=400, detail="Empty query")

    return dork


@router.post("")
async def build_google_dork(request: DorkBuildRequest):
    dork = build_dork(request)

    return {
        "query": dork,
        "copy_ready": True,
        "executed": False,
        "parts": {
            "terms": request.terms,
            "exact_phrases": request.exact_phrases,
            "exclude_terms": request.exclude_terms,
            "site": request.site,
            "filetype": request.filetype,
            "ext": request.ext,
            "inurl": request.inurl,
            "intitle": request.intitle,
            "intext": request.intext,
            "allinurl": request.allinurl,
            "allintitle": request.allintitle,
            "allintext": request.allintext,
            "after": request.after,
            "before": request.before,
        },
    }