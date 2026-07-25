import { useState } from "react";
import { Network } from "lucide-react";


function short(value, fallback = "n/a") {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string" && value.trim() === "") return fallback;
  return String(value);
}


const STATUS_LABEL = {
  ok: "OK",
  no_answer: "NO ANSWER",
  nxdomain: "NXDOMAIN",
  no_nameservers: "NO NAMESERVERS",
  timeout: "TIMEOUT",
  error: "ERROR",
};


function formatRecord(rtype, record) {
  if (rtype === "MX") return `${record.priority} ${record.exchange}`;
  if (rtype === "SRV") return `${record.priority} ${record.weight} ${record.port} ${record.target}`;
  if (rtype === "SOA")
    return `mname=${record.mname} rname=${record.rname} serial=${record.serial} refresh=${record.refresh} retry=${record.retry} expire=${record.expire} minimum=${record.minimum}`;
  return String(record);
}


function buildLines(domain, data) {
  if (data?.isIp) {
    return [
      { text: "> DNS INSPECTOR — Reverse Lookup", color: "text-[rgba(200,255,208,0.4)]" },
      { text: `> Target    : ${domain}`, color: "text-[rgba(200,255,208,0.7)]" },
      {
        text: `> PTR       : ${short(data?.ptr)}`,
        color: data?.ptr ? "text-[#00ff41]" : "text-[rgba(200,255,208,0.4)]",
      },
    ];
  }

  const records = Array.isArray(data?.records) ? data.records : [];

  return [
    { text: "> DNS INSPECTOR — Zone Record Lookup", color: "text-[rgba(200,255,208,0.4)]" },
    { text: `> Target    : ${domain}`, color: "text-[rgba(200,255,208,0.7)]" },
    { text: `> Resolver  : ${short((data?.resolverUsed || []).join(", "))}`, color: "text-[rgba(200,255,208,0.55)]" },
    { text: "> " + "─".repeat(32), color: "text-[rgba(200,255,208,0.15)]" },

    ...records.flatMap((entry) => {
      const header = {
        text: `> [${entry.type}] ${STATUS_LABEL[entry.status] || entry.status}${
          entry.ttl !== null && entry.ttl !== undefined ? ` (ttl ${entry.ttl}s)` : ""
        }`,
        color: entry.status === "ok" ? "text-[#00ff41]" : "text-[rgba(200,255,208,0.35)]",
      };

      if (entry.status !== "ok" || entry.records.length === 0) return [header];

      return [
        header,
        ...entry.records.map((r) => ({
          text: `>   ${formatRecord(entry.type, r)}`,
          color: "text-[rgba(200,255,208,0.85)]",
        })),
      ];
    }),
  ];
}


export const dnsInspectorLoadingLines = [
  { text: "> resolving DNS records...", color: "text-[rgba(200,255,208,0.6)]" },
  { text: "> querying A / AAAA / MX / NS / TXT / CNAME / SOA / SRV...", color: "text-[rgba(200,255,208,0.4)]" },
];


export function getDnsInspectorLines(result) {
  if (result?.type !== "dns") return null;
  return buildLines(result.domain, result.data);
}


export default function DnsInspector({ onResult, onError, onLoading }) {
  const [domain, setDomain] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    onLoading(true);
    onError("");
    onResult(null);

    try {
      const res = await fetch("http://localhost:8000/api/dns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "API Error");

      onResult({
        type: "dns",
        domain,
        data,
      });
      setDomain("");
    } catch (err) {
      onError(err.message);
    } finally {
      onLoading(false);
    }
  };

  return (
    <section className="border border-[rgba(0,255,65,0.12)] bg-[#0d0d0d] p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Network size={20} className="text-[#00ff41]" />
        <p className="font-['Share_Tech_Mono'] text-l uppercase tracking-[0.25em] text-[rgba(200,255,208,0.45)]">
          DNS Inspector
        </p>
        <p className="font-['Share_Tech_Mono'] text-xs text-[rgba(200,255,208,0.3)] -mt-1">
          - Zone Record & Reverse Lookup
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 mt-1">
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com o 8.8.8.8"
            required
            className="w-full h-8.5 bg-black/60 border border-[rgba(0,255,65,0.15)] pl-4 pr-4 py-3 font-['Share_Tech_Mono'] text-sm text-[#c8ffd0] placeholder-[rgba(200,255,208,0.2)] outline-none focus:border-[rgba(0,255,65,0.45)] transition"
          />
        </div>

        <button
          type="submit"
          className="w-28 shrink-0 border border-[rgba(0,255,65,0.3)] bg-[rgba(0,255,65,0.06)] font-['Share_Tech_Mono'] text-xs uppercase tracking-[0.2em] text-[#00ff41] transition hover:bg-[rgba(0,255,65,0.12)] hover:border-[rgba(0,255,65,0.5)]"
        >
          Inspect
        </button>
      </form>
    </section>
  );
}
