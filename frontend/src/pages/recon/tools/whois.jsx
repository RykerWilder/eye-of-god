import { useState } from "react";
import { Globe } from "lucide-react";


function short(value, fallback = "n/a") {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string" && value.trim() === "") return fallback;
  return String(value);
}


function buildLines(domain, data) {
  const nameServers = Array.isArray(data?.nameServers) ? data.nameServers.filter(Boolean) : [];
  const statuses = Array.isArray(data?.status) ? data.status.filter(Boolean) : [];

  return [
    { text: "> WHOIS — Domain Registration Lookup", color: "text-[rgba(200,255,208,0.4)]" },
    { text: `> Target    : ${domain}`, color: "text-[rgba(200,255,208,0.7)]" },
    { text: `> Registrar : ${short(data?.registrar)}`, color: "text-[rgba(200,255,208,0.85)]" },
    { text: `> WHOIS Srv : ${short(data?.whoisServer)}`, color: "text-[rgba(200,255,208,0.6)]" },
    { text: `> Created   : ${short(data?.createdAt)}`, color: "text-[rgba(200,255,208,0.6)]" },
    { text: `> Updated   : ${short(data?.updatedAt)}`, color: "text-[rgba(200,255,208,0.6)]" },
    {
      text: `> Expires   : ${short(data?.expiresAt)}`,
      color: data?.expiresAt ? "text-[#00ff41]" : "text-[rgba(200,255,208,0.4)]",
    },
    { text: `> DNSSEC    : ${short(data?.dnssec)}`, color: "text-[rgba(200,255,208,0.55)]" },
    { text: `> Statuses  : ${statuses.length}`, color: "text-[rgba(200,255,208,0.55)]" },
    { text: `> NS Count  : ${nameServers.length}`, color: "text-[rgba(200,255,208,0.55)]" },
    { text: "> " + "─".repeat(32), color: "text-[rgba(200,255,208,0.15)]" },

    ...(nameServers.length === 0
      ? [{ text: "> No name servers found.", color: "text-[rgba(200,255,208,0.35)]" }]
      : nameServers.map((ns) => ({
          text: `> [NS] ${ns}`,
          color: "text-[rgba(200,255,208,0.85)]",
        }))),

    ...(statuses.length === 0
      ? []
      : [
          { text: "> " + "─".repeat(32), color: "text-[rgba(200,255,208,0.15)]" },
          ...statuses.map((status) => ({
            text: `> [ST] ${status}`,
            color: "text-[rgba(200,255,208,0.55)]",
          })),
        ]),
  ];
}


export const whoisLoadingLines = [
  { text: "> resolving domain whois...", color: "text-[rgba(200,255,208,0.6)]" },
  { text: "> querying registration records...", color: "text-[rgba(200,255,208,0.4)]" },
];


export function getWhoisLines(result) {
  if (result?.type !== "whois") return null;
  return buildLines(result.domain, result.data);
}


export default function Whois({ onResult, onError, onLoading }) {
  const [domain, setDomain] = useState("");


  const handleSubmit = async (e) => {
    e.preventDefault();
    onLoading(true);
    onError("");
    onResult(null);

    try {
      const res = await fetch("http://localhost:8000/api/whois", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          verbose: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "API Error");

      onResult({
        type: "whois",
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
    <section className="group border border-[rgba(0,255,65,0.12)] bg-[linear-gradient(160deg,rgba(0,255,65,0.05),rgba(13,13,13,0.97)_65%)] p-4 flex flex-col gap-4 transition duration-200 hover:border-[rgba(0,255,65,0.32)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[rgba(0,255,65,0.25)] bg-[rgba(0,255,65,0.07)] transition duration-200 group-hover:border-[rgba(0,255,65,0.45)] group-hover:bg-[rgba(0,255,65,0.12)]">
          <Globe size={18} className="text-[#00ff41]" />
        </div>
        <div className="min-w-0">
          <p className="font-['Share_Tech_Mono'] text-sm uppercase tracking-[0.22em] text-[#d8ffe0] truncate">
            Whois
          </p>
          <p className="font-['Share_Tech_Mono'] text-[11px] text-[rgba(200,255,208,0.4)] truncate">
            Domain Registration Lookup
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 mt-1">
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

        <button
          type="submit"
          className="w-28 shrink-0 border border-[rgba(0,255,65,0.3)] bg-[rgba(0,255,65,0.06)] font-['Share_Tech_Mono'] text-xs uppercase tracking-[0.2em] text-[#00ff41] transition hover:bg-[rgba(0,255,65,0.12)] hover:border-[rgba(0,255,65,0.5)]"
        >
          Lookup
        </button>
      </form>
    </section>
  );
}