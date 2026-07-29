# Eye Of God

![License](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black&labelColor=61DAFB)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![OSINT](https://img.shields.io/badge/OSINT-00FF41?logo=shieldsdotio&logoColor=black&labelColor=00FF41&color=00FF41)

<img src="https://github.com/RykerWilder/static_files/blob/main/eye-of-god.webp" alt="Eye-Of-God">

**Eye of God** is a self-hosted **OSINT / cybersecurity dashboard**. It's a web application for running several well-known open-source reconnaissance and threat-intelligence tools, instead of using each one separately from the command line.

It's built as two separate services that talk to each other:

- **Frontend** — a React (Vite + Tailwind) single-page app. This is the dashboard you see and click around in.
- **Backend** — a Python FastAPI server that actually executes the security tools and calls external APIs, then returns clean JSON results to the frontend.

Both pieces are containerized with Docker and wired together with `docker-compose`.

## What can you do with it?

The dashboard is organized into tool categories, with the following currently implemented:

### Recon
- **Sherlock** — searches for a given username across many social networks/websites and reports where an account exists.
- **Maigret** — checks a given username across hundreds of sites (top 500 by default) and returns the matching profile URLs along with any site tags, powered by the Maigret OSINT tool.
- **Holehe** — checks whether an email address is registered on numerous online services.
- **WHOIS** — looks up domain registration details (registrar, creation/expiry dates, name servers, registrant info, etc.).
- **theHarvester** — passive OSINT gathering for a domain: subdomains, hosts, emails, IPs, ASNs, and URLs, pulled from many free public sources (crt.sh, DNSDumpster, HackerTarget, OTX, urlscan, and more).
- **Metadata Extractor** — upload any file (document, image, PDF, etc.) and extract its embedded metadata (author, software used, timestamps, GPS/EXIF data, and more) plus a short text content preview, powered by Apache Tika. Files up to 50MB are supported.
- **DNS Inspector** — resolves A, AAAA, MX, NS, TXT, CNAME, SOA, and SRV records for a domain in parallel, powered by `dnspython`. Also supports reverse DNS (PTR) lookups when you enter an IP address instead of a domain, and lets you optionally target a custom DNS resolver.

### Threat Intel
- **AbuseIPDB lookup** — checks an IP address's abuse reports and confidence score via the AbuseIPDB API.
- **IP Tracker** — looks up an IP address (v4/v6) and returns geolocation (country, region, city, coordinates, timezone), network provider details (ISP, organization, ASN, proxy/hosting/mobile flags) via ip-api.com, and network allocation data (CIDR block, address range, network name/type, parent handle, RIR registry, abuse contact emails) via RDAP/ipwhois. No API key required.
- **Google Dorks builder** — a form that helps you build advanced Google search queries (site:, filetype:, intitle:, exact phrases, date ranges, etc.) for OSINT research.
- **CVE feed** — pulls the latest published CVEs (with CVSS score/severity) from the NVD (National Vulnerability Database) API and shows them on the dashboard.

The homepage also lists placeholder categories (Scanner, Malware, Crypto, Terminal) that are shown in the UI but not yet implemented in the backend.

## Requirements

- **Docker** and **Docker Compose** (recommended — simplest way to run everything), **or**
- **Python 3.13** and **Node.js 20** if you want to run backend and frontend manually without Docker.
- An **AbuseIPDB API key** (free tier available at https://www.abuseipdb.com/) if you want to use the AbuseIPDB tool. Some other advanced theHarvester sources also need their own API keys, but the tool works out of the box with the free sources.

## Installation & Setup

1. Unzip/clone the project and move into its folder:
   ```bash
   cd eye-of-god
   ```

2. Create your environment file from the example:
   ```bash
   cp .env.example .env
   ```

3. Open `.env` and add your AbuseIPDB API key (and optionally an NVD API key for higher CVE-feed rate limits):
   ```
   ABUSEIPDB_API_KEY=your_key_here
   ```

4. Build and start both services:
   ```bash
   docker compose up -d --build
   ```

5. Once the containers are up:
   - **Frontend (dashboard):** http://localhost:5173
   - **Backend (API):** http://localhost:8000
   - You can check the backend is alive at http://localhost:8000/health

## Notes & Considerations

- This is an **OSINT/security research tool**. Only use it against domains, emails, usernames, and IPs you're authorized to investigate.
- Sherlock and theHarvester are run as external command-line tools by the backend, so the Docker image installs them (and their dependencies, like `whois` and `git`) automatically. If running manually, make sure these binaries are installed and discoverable in your `PATH` or virtual environment.
- The Metadata Extractor relies on `tikara` (a Tika wrapper), which needs a JVM under the hood. The Docker image installs a headless JDK automatically; if running manually, make sure a JDK is installed and `JAVA_HOME` is set.
- Some theHarvester sources and some planned dashboard categories (Scanner, Malware, Crypto) require additional API keys or are not yet implemented — check the source code in `backend/routers/` for the current list of supported data sources.