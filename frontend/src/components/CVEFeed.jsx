// CVEFeed.jsx
import React, { useEffect, useState } from "react";
import { ExternalLink, RefreshCw, ShieldAlert } from "lucide-react";

function getSeverityColor(severity) {
  const colors = {
    "None": "text-[#00ff41] border-[rgba(0,255,65,0.35)]",
    "Low": "text-[#ffaa00] border-[rgba(255,170,0,0.4)]",
    "Medium": "text-[#ff8a3d] border-[rgba(255,138,61,0.4)]",
    "High": "text-[#ff4d4d] border-[rgba(255,77,77,0.4)]",
    "Critical": "text-[#ff0000] border-[rgba(255,0,0,0.4)]"
  };
  return colors[severity] || "text-[rgba(200,255,208,0.45)] border-[rgba(200,255,208,0.2)]";
}

const CVEFeed = () => {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);

    fetch("/api/nvd-severity")
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || `HTTP error ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setVulnerabilities(data || []))
      .catch((err) => {
        console.error("Data fetch error:", err);
        setError(err.message || "Error downloading data");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <section className="border border-[rgba(0,255,65,0.12)] bg-[#0d0d0d] p-5 h-[500px] flex flex-col">
        <div className="flex items-center justify-between">
          <p className="font-['Share_Tech_Mono'] text-xs uppercase tracking-[0.25em] text-[rgba(200,255,208,0.45)]">
            Latest CVEs - NIST NVD
          </p>
          <RefreshCw size={14} className="animate-spin text-[rgba(200,255,208,0.45)]" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="font-['Share_Tech_Mono'] text-xs text-[rgba(200,255,208,0.4)]">
            &gt; querying NVD in progress...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="border border-[rgba(0,255,65,0.12)] bg-[#0d0d0d] p-5 h-[500px] flex flex-col">
        <div className="flex items-center justify-between">
          <p className="font-['Share_Tech_Mono'] text-xs uppercase tracking-[0.25em] text-[rgba(200,255,208,0.45)]">
            Latest CVEs - NIST NVD
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-start gap-2 border-l border-[rgba(255,77,77,0.4)] pl-4">
            <ShieldAlert size={14} className="mt-0.5 shrink-0 text-[#ff4d4d]" />
            <p className="text-[rgba(200,255,208,0.6)] text-sm">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border border-[rgba(0,255,65,0.12)] bg-[#0d0d0d] p-5 h-[500px] flex flex-col">
      <div className="flex items-center justify-between">
        <p className="font-['Share_Tech_Mono'] text-xs uppercase tracking-[0.25em] text-[rgba(200,255,208,0.45)]">
          Latest CVEs - NIST NVD
        </p>
        <button
          onClick={load}
          disabled={loading}
          aria-label="Refresh CVE feed"
          className="text-[rgba(200,255,208,0.45)] hover:text-[#00ff41] transition disabled:opacity-40"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="mt-4 space-y-3 flex-1 overflow-y-auto pr-1">
        {vulnerabilities.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="font-['Share_Tech_Mono'] text-xs text-[rgba(200,255,208,0.4)]">
              &gt; no CVEs found in the selected period
            </p>
          </div>
        ) : (
          vulnerabilities.map((vulnerability, index) => (
            <div
              key={`${vulnerability.cveId}-${index}`}
              className="border border-[rgba(0,255,65,0.08)] bg-[rgba(0,255,65,0.02)] hover:bg-[rgba(0,255,65,0.05)] transition-colors p-3 rounded"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {/* Severity color indicator dot */}
                  <div 
                    className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" 
                    style={{ 
                      backgroundColor: vulnerability.color || '#94a3b8',
                      boxShadow: `0 0 8px ${vulnerability.color || '#94a3b8'}40`
                    }}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <a
                      href={`https://nvd.nist.gov/vuln/detail/${vulnerability.cveId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-['Share_Tech_Mono'] text-[#d8ffe0] text-[13px] hover:text-[#00ff41] transition inline-flex items-center gap-1"
                    >
                      {vulnerability.cveId}
                      <ExternalLink size={11} className="text-[rgba(200,255,208,0.3)]" />
                    </a>
                    
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className={`border px-2 py-0.5 font-['Share_Tech_Mono'] text-[11px] ${getSeverityColor(vulnerability.severity)}`}>
                        {vulnerability.severity || 'Unknown'}
                      </span>
                      <span className="text-[rgba(200,255,208,0.45)] font-['Share_Tech_Mono'] text-[11px]">
                        CVSS {vulnerability.cvssScore?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default CVEFeed;