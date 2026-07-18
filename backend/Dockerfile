FROM python:3.13-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    whois \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN python -m venv /opt/theharvester-venv && \
    /opt/theharvester-venv/bin/pip install --no-cache-dir \
        "theHarvester @ git+https://github.com/laramies/theHarvester.git@master" && \
    chmod -R a+rX /opt/theharvester-venv
ENV THEHARVESTER_BIN="/opt/theharvester-venv/bin/theHarvester"

COPY . .


RUN useradd --create-home --shell /bin/bash appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]