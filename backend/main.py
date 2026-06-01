from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import holehe, sherlock, abuseipdb, whois
from dotenv import load_dotenv


load_dotenv()


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