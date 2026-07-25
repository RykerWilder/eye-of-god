from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import holehe, sherlock, abuseipdb, whois, dorks, theharvester, cve, iptracker, metadata, dns_inspector

app = FastAPI(title="CyberSec Dashboard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(holehe.router, prefix="/api/holehe", tags=["Recon"])
app.include_router(sherlock.router, prefix="/api/sherlock", tags=["Recon"])
app.include_router(whois.router, prefix="/api/whois", tags=["Recon"])
app.include_router(abuseipdb.router, prefix="/api/abuseipdb", tags=["Threat Intel"])
app.include_router(iptracker.router, prefix="/api/iptracker", tags=["Threat Intel"])
app.include_router(dorks.router, prefix="/api/dorks", tags=["Recon"])
app.include_router(theharvester.router, prefix="/api/theharvester", tags=["Recon"])
app.include_router(cve.router, prefix="/api", tags=["Threat Intel"])
app.include_router(metadata.router, prefix="/api/metadata", tags=["Recon"])
app.include_router(dns_inspector.router, prefix="/api/dns", tags=["Recon"])