import { useState } from "react";
import { Waves } from "lucide-react";

const SOURCE_OPTIONS = [
  { id: "baidu", label: "Baidu" },
  { id: "crtsh", label: "crt.sh" },
  { id: "dnsdumpster", label: "DNSdumpster" },
  { id: "duckduckgo", label: "DuckDuckGo" },
  { id: "github-code", label: "GitHub Code" },
  { id: "hackertarget", label: "HackerTarget" },
  { id: "otx", label: "AlienVault OTX" },
  { id: "rapiddns", label: "RapidDNS" },
  { id: "subdomaincenter", label: "Subdomain Center" },
  { id: "subdomainfinderc99", label: "SubdomainFinder C99" },
  { id: "thc", label: "THC" },
  { id: "threatminer", label: "ThreatMiner" },
  { id: "urlscan", label: "urlscan.io" },
  { id: "yahoo", label: "Yahoo" },
];

const DEFAULT_SOURCES = ["baidu", "crtsh", "hackertarget", "otx", "rapiddns", "urlscan"];

const SECTIONS = [
  { key: "hosts", label: "Hosts" },
  { key: "emails", label: "Emails" },
  { key: "ips", label: "IPs" },
  { key: "asns", label: "ASNs" },
  { key: "urls", label: "Urls" },
  { key: "vhosts", label: "Vhosts" },
];

function buildLines(domain, data) {
  const counts = SECTIONS.map((s) => ({ ...s, items: data?.[s.key] ?? [] }));
  const total = counts.reduce((sum, s) => sum + s.items.length, 0);

  const lines = [
    { text: "> THEHARVESTER — OSINT Recon",         color: "text-[rgba(200,255,208,0.4)]" },
    { text: `> Target : ${domain}`,                 color: "text-[rgba(200,255,208,0.7)]" },
    { text: `> Sources: ${(data?.sources ?? []).join(", ") || "n/a"}`, color: "text-[rgba(200,255,208,0.5)]" },
    {
      text:  `> Found  : ${total} artifacts`,
      color: total > 0 ? "text-[#00ff41]" : "text-[rgba(200,255,208,0.4)]",
    },
    { text: "> " + "─".repeat(32), color: "text-[rgba(200,255,208,0.15)]" },
  ];

  if (total === 0) {
    lines.push({ text: "> No artifacts found.", color: "text-[rgba(200,255,208,0.35)]" });
    return lines;
  }

  counts.forEach(({ label, items }) => {
    if (items.length === 0) return;
    lines.push({ text: `> [${label}] (${items.length})`, color: "text-[rgba(200,255,208,0.6)]" });
    items.slice(0, 10).forEach((item) => {
      lines.push({ text: `>   ${item}`, color: "text-[rgba(200,255,208,0.85)]" });
    });
    if (items.length > 10) {
      lines.push({ text: `>   ... and ${items.length - 10} more`, color: "text-[rgba(200,255,208,0.35)]" });
    }
  });

  return lines;
}

export const theHarvesterLoadingLines = [
  { text: "> dispatching queries to selected sources...", color: "text-[rgba(200,255,208,0.6)]" },
  { text: "> aggregating hosts, emails, ips...",           color: "text-[rgba(200,255,208,0.4)]" },
];

export function getTheHarvesterLines(result) {
  if (result?.type !== "theharvester") return null;
  return buildLines(result.domain, result.data);
}

export default function TheHarvester({ onResult, onError, onLoading }) {
  const [domain, setDomain] = useState("");
  const [sources, setSources] = useState(DEFAULT_SOURCES);
  const [limit, setLimit] = useState(500);

  const toggleSource = (id) => {
    setSources((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onLoading(true);
    onError("");
    onResult(null);

    try {
      const res = await fetch("http://localhost:8000/api/theharvester", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ domain, sources, limit }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "API Error");
      onResult({ type: "theharvester", domain, data });
      setDomain("");
    } catch (err) {
      onError(err.message);
    } finally {
      onLoading(false);
    }
  };

  return (
    <section className="group border border-[rgba(0,255,65,0.12)] bg-[linear-gradient(160deg,rgba(0,255,65,0.05),rgba(13,13,13,0.97)_65%)] p-4 flex flex-col gap-4 transition duration-200 hover:border-[rgba(0,255,65,0.32)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[rgba(0,255,65,0.25)] bg-[rgba(0,255,65,0.07)] transition duration-200 group-hover:border-[rgba(0,255,65,0.45)] group-hover:bg-[rgba(0,255,65,0.12)]">
          <Waves size={18} className="text-[#00ff41]" />
        </div>
        <div className="min-w-0">
          <p className="font-['Share_Tech_Mono'] text-sm uppercase tracking-[0.22em] text-[#d8ffe0] truncate">
            theHarvester
          </p>
          <p className="font-['Share_Tech_Mono'] text-[11px] text-[rgba(200,255,208,0.4)] truncate">
            Domain OSINT Aggregator
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-1">
        <div className="flex gap-3">
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              required
              className="w-full h-8.5 bg-black/60 border border-[rgba(0,255,65,0.15)] pl-4 pr-4 py-3 font-['Share_Tech_Mono'] text-sm text-[#c8ffd0] placeholder-[rgba(200,255,208,0.2)] outline-none focus:border-[rgba(0,255,65,0.45)] transition"
            />
          </div>

          <input
            type="number"
            min={1}
            max={1000}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            title="Limit results per source"
            className="w-24 bg-black/60 border border-[rgba(0,255,65,0.15)] px-2 font-['Share_Tech_Mono'] text-xs text-[rgba(200,255,208,0.55)] outline-none focus:border-[rgba(0,255,65,0.45)] transition"
          />

          <button
            type="submit"
            className="w-28 shrink-0 border border-[rgba(0,255,65,0.3)] bg-[rgba(0,255,65,0.06)] font-['Share_Tech_Mono'] text-xs uppercase tracking-[0.2em] text-[#00ff41] transition hover:bg-[rgba(0,255,65,0.12)] hover:border-[rgba(0,255,65,0.5)]"
          >
            Scan
          </button>
        </div>

        <div className="flex flex-wrap gap-2 border border-[rgba(0,255,65,0.08)] bg-black/20 p-3">
          {SOURCE_OPTIONS.map(({ id, label }) => (
            <label
              key={id}
              className={`flex items-center gap-1.5 border px-2.5 py-1.5 font-['Share_Tech_Mono'] text-[10px] uppercase tracking-[0.15em] cursor-pointer transition ${
                sources.includes(id)
                  ? "border-[rgba(0,255,65,0.45)] bg-[rgba(0,255,65,0.08)] text-[#00ff41]"
                  : "border-[rgba(0,255,65,0.12)] text-[rgba(200,255,208,0.45)] hover:border-[rgba(0,255,65,0.3)]"
              }`}
            >
              <input
                type="checkbox"
                checked={sources.includes(id)}
                onChange={() => toggleSource(id)}
                className="hidden"
              />
              {label}
            </label>
          ))}
        </div>
      </form>
    </section>
  );
}