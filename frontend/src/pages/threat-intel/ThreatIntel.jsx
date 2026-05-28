import { useState } from "react";
import { AlertTriangle, Globe } from "lucide-react";

import OutputTerminal from "../../components/OutputTerminal";
import AbuseIPDB from "./tools/AbuseIPDB";

function buildAbuseIPDBLines(ip, data) {
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
    {
      text:  "> ABUSEIPDB — IP Reputation",
      color: "text-[rgba(200,255,208,0.4)]",
    },
    {
      text:  `> Target  : ${ip}`,
      color: "text-[rgba(200,255,208,0.7)]",
    },
    {
      text:  `> ISP     : ${data.isp ?? "N/A"}`,
      color: "text-[rgba(200,255,208,0.55)]",
    },
    {
      text:  `> Country : ${data.countryName ?? "N/A"} (${data.countryCode ?? "??"})`,
      color: "text-[rgba(200,255,208,0.55)]",
    },
    {
      text:  `> Usage   : ${data.usageType ?? "N/A"}`,
      color: "text-[rgba(200,255,208,0.5)]",
    },
    { text: "> " + "─".repeat(32), color: "text-[rgba(200,255,208,0.15)]" },
    {
      text:  `> Score   : ${data.abuseScore}%  [${scoreLabel}]`,
      color: scoreColor,
    },
    {
      text:  `> Reports : ${data.totalReports}  (${data.numDistinctUsers} distinct users)`,
      color: data.totalReports > 0
        ? "text-[rgba(200,255,208,0.75)]"
        : "text-[rgba(200,255,208,0.4)]",
    },
    {
      text:  `> Last    : ${data.lastReportedAt
        ? new Date(data.lastReportedAt).toLocaleString("it-IT")
        : "never"}`,
      color: "text-[rgba(200,255,208,0.5)]",
    },
    ...(flags.length > 0
      ? flags.map((f) => ({
          text:  `> FLAG    : ${f}`,
          color: f === "TOR EXIT NODE"
            ? "text-[#ff4d4d]"
            : "text-[#00ff41]",
        }))
      : []
    ),
    { text: "> " + "─".repeat(32), color: "text-[rgba(200,255,208,0.15)]" },
    ...(found.length === 0
      ? [{
          text:  "> No categorized reports in range.",
          color: "text-[rgba(200,255,208,0.35)]",
        }]
      : found.slice(0, 8).map((r) => ({
          text: `> [!] ${r.categories.join(", ").padEnd(30)} ${
            new Date(r.reportedAt).toLocaleDateString("it-IT")
          }`,
          color: "text-[rgba(200,255,208,0.75)]",
        }))
    ),
    ...(found.length > 8
      ? [{
          text:  `> ... and ${found.length - 8} more reports`,
          color: "text-[rgba(200,255,208,0.35)]",
        }]
      : []
    ),
  ];
}

const IDLE_LINES = [
  {
    text:  "> threat_intel module initialized.",
    color: "text-[rgba(200,255,208,0.3)]",
  },
  {
    text:  "> awaiting input.",
    color: "text-[rgba(200,255,208,0.3)]",
  },
  { text: "> " + "─".repeat(32), color: "text-[rgba(200,255,208,0.1)]" },
];

const LOADING_LINES = [
  ...IDLE_LINES,
  {
    text:  "> querying reputation databases...",
    color: "text-[rgba(200,255,208,0.6)]",
  },
  {
    text:  "> fetching abuse reports...",
    color: "text-[rgba(200,255,208,0.4)]",
  },
];

export default function ThreatIntelPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [result, setResult]   = useState(null);

  const terminalLines = (() => {
    if (loading && result === null) return LOADING_LINES;
    if (error) {
      return [
        ...IDLE_LINES,
        { text: `> ERROR: ${error}`, color: "text-red-400" },
      ];
    }
    if (result?.type === "abuseipdb") {
      return [
        ...IDLE_LINES,
        ...buildAbuseIPDBLines(result.ip, result.data),
      ];
    }
    return IDLE_LINES;
  })();

  return (
    <div className="h-full grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]">

      {/* ── Left column ── */}
      <div className="flex flex-col gap-5 min-h-0 overflow-auto">

        {/* Page header */}
        <div className="flex items-center justify-center gap-4 border border-[rgba(0,255,65,0.12)] bg-[#0d0d0d] px-5 py-4">
          <div className="flex-col justify-center items-center gap-2">
            <p className="font-['Share_Tech_Mono'] text-[10px] uppercase tracking-[0.3em] text-[rgba(200,255,208,0.4)]">
              Module
            </p>
            <div className="flex justify-center items-center gap-2">
              <Globe size={25} className="text-[#00ff41] shrink-0" />
              <h2 className="font-['Share_Tech_Mono'] text-3xl uppercase tracking-[0.1em] text-[#d8ffe0]">
                Threat Intel
              </h2>
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-3 border border-[rgba(255,60,60,0.2)] bg-[rgba(255,60,60,0.04)] p-4">
            <AlertTriangle
              size={15}
              className="text-red-400 shrink-0 mt-0.5"
            />
            <p className="font-['Share_Tech_Mono'] text-xs text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* Tools */}
        <AbuseIPDB
          onResult={setResult}
          onError={setError}
          onLoading={setLoading}
        />
      </div>

      {/* ── Right column — terminal ── */}
      <OutputTerminal lines={terminalLines} />
    </div>
  );
}