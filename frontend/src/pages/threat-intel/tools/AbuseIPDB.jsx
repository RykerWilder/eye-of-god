import { useState } from "react";
import { Shield } from "lucide-react";

function buildLines(ip, data) {
  const scoreLabel =
    data.abuseScore >= 75 ? "HIGH RISK" :
    data.abuseScore >= 30 ? "MEDIUM"    : "CLEAN";

  const scoreColor =
    data.abuseScore >= 75 ? "text-[#ff4d4d]" :
    data.abuseScore >= 30 ? "text-[#ffaa00]" : "text-[#00ff41]";

  const flags = [
    data.isTor         && "TOR EXIT NODE",
    data.isWhitelisted && "WHITELISTED",
  ].filter(Boolean);

  const found = data.reports?.filter((r) => r.categories?.length > 0) ?? [];

  return [
    { text: "> ABUSEIPDB — IP Reputation",          color: "text-[rgba(200,255,208,0.4)]" },
    { text: `> Target  : ${ip}`,                    color: "text-[rgba(200,255,208,0.7)]" },
    { text: `> ISP     : ${data.isp ?? "N/A"}`,     color: "text-[rgba(200,255,208,0.55)]" },
    { text: `> Country : ${data.countryName ?? "N/A"} (${data.countryCode ?? "??"})`, color: "text-[rgba(200,255,208,0.55)]" },
    { text: `> Usage   : ${data.usageType ?? "N/A"}`, color: "text-[rgba(200,255,208,0.5)]" },
    { text: "> " + "─".repeat(32),                  color: "text-[rgba(200,255,208,0.15)]" },
    { text: `> Score   : ${data.abuseScore}%  [${scoreLabel}]`, color: scoreColor },
    {
      text:  `> Reports : ${data.totalReports}  (${data.numDistinctUsers} distinct users)`,
      color: data.totalReports > 0 ? "text-[rgba(200,255,208,0.75)]" : "text-[rgba(200,255,208,0.4)]",
    },
    {
      text:  `> Last    : ${data.lastReportedAt ? new Date(data.lastReportedAt).toLocaleString("it-IT") : "never"}`,
      color: "text-[rgba(200,255,208,0.5)]",
    },
    ...flags.map((f) => ({
      text:  `> FLAG    : ${f}`,
      color: f === "TOR EXIT NODE" ? "text-[#ff4d4d]" : "text-[#00ff41]",
    })),
    { text: "> " + "─".repeat(32), color: "text-[rgba(200,255,208,0.15)]" },
    ...(found.length === 0
      ? [{ text: "> No categorized reports in range.", color: "text-[rgba(200,255,208,0.35)]" }]
      : found.slice(0, 8).map((r) => ({
          text:  `> [!] ${r.categories.join(", ").padEnd(30)} ${new Date(r.reportedAt).toLocaleDateString("it-IT")}`,
          color: "text-[rgba(200,255,208,0.75)]",
        }))
    ),
    ...(found.length > 8
      ? [{ text: `> ... and ${found.length - 8} more reports`, color: "text-[rgba(200,255,208,0.35)]" }]
      : []
    ),
  ];
}

export const abuseIPDBLoadingLines = [
  { text: "> querying reputation databases...", color: "text-[rgba(200,255,208,0.6)]" },
  { text: "> fetching abuse reports...",        color: "text-[rgba(200,255,208,0.4)]" },
];

export function getAbuseIPDBLines(result) {
  if (result?.type !== "abuseipdb") return null;
  return buildLines(result.ip, result.data);
}

export default function AbuseIPDB({ onResult, onError, onLoading }) {
  const [ip, setIp]         = useState("");
  const [maxAge, setMaxAge] = useState(90);

  const handleSubmit = async (e) => {
    e.preventDefault();
    onLoading(true);
    onError("");
    onResult(null);

    try {
      const res = await fetch("http://localhost:8000/api/abuseipdb", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ip, maxAgeInDays: maxAge, verbose: true }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "API Error");
      onResult({ type: "abuseipdb", ip, data });
    } catch (err) {
      onError(err.message);
    } finally {
      onLoading(false);
    }
  };

  return (
    <section className="border border-[rgba(0,255,65,0.12)] bg-[#0d0d0d] p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Shield size={20} className="text-[#00ff41]" />
        <p className="font-['Share_Tech_Mono'] text-l uppercase tracking-[0.25em] text-[rgba(200,255,208,0.45)]">
          AbuseIPDB
        </p>
        <p className="font-['Share_Tech_Mono'] text-xs text-[rgba(200,255,208,0.3)] -mt-1">
          - IP Reputation &amp; Abuse Reports
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 mt-1">
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="192.168.1.1 or 2001:db8::1"
            required
            className="w-full h-8.5 bg-black/60 border border-[rgba(0,255,65,0.15)] pl-4 pr-4 py-3 font-['Share_Tech_Mono'] text-sm text-[#c8ffd0] placeholder-[rgba(200,255,208,0.2)] outline-none focus:border-[rgba(0,255,65,0.45)] transition"
          />
        </div>

        <select
          value={maxAge}
          onChange={(e) => setMaxAge(Number(e.target.value))}
          className="bg-black/60 border border-[rgba(0,255,65,0.15)] px-2 font-['Share_Tech_Mono'] text-xs text-[rgba(200,255,208,0.55)] outline-none focus:border-[rgba(0,255,65,0.45)] transition cursor-pointer"
        >
          {[7, 30, 60, 90, 180, 365].map((d) => (
            <option key={d} value={d} className="bg-[#0d0d0d]">{d}d</option>
          ))}
        </select>

        <button
          type="submit"
          className="w-28 shrink-0 border border-[rgba(0,255,65,0.3)] bg-[rgba(0,255,65,0.06)] font-['Share_Tech_Mono'] text-xs uppercase tracking-[0.2em] text-[#00ff41] transition hover:bg-[rgba(0,255,65,0.12)] hover:border-[rgba(0,255,65,0.5)]"
        >
          Scan
        </button>
      </form>
    </section>
  );
}