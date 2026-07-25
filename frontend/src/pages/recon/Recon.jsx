import { useState } from "react";
import { Radar, AlertTriangle } from "lucide-react";

import OutputTerminal from "../../components/OutputTerminal";
import Holehe, { getHoleheLines, holeheLoadingLines } from "./tools/Holehe";
import Sherlock, { getSherlockLines, sherlockLoadingLines } from "./tools/Sherlock";
import Whois, { getWhoisLines, whoisLoadingLines } from "./tools/Whois";
import TheHarvester, { getTheHarvesterLines, theHarvesterLoadingLines } from "./tools/TheHarvester";
import MetadataExtractor, { getMetadataLines, metadataLoadingLines } from "./tools/MetadataExtractor";
import DnsInspector, { getDnsInspectorLines, dnsInspectorLoadingLines } from "./tools/DnsInspector";


const TOOL_REGISTRY = [
  { getLines: getHoleheLines, loadingLines: holeheLoadingLines },
  { getLines: getSherlockLines, loadingLines: sherlockLoadingLines },
  { getLines: getWhoisLines, loadingLines: whoisLoadingLines },
  { getLines: getTheHarvesterLines, loadingLines: theHarvesterLoadingLines },
  { getLines: getMetadataLines, loadingLines: metadataLoadingLines },
  { getLines: getDnsInspectorLines, loadingLines: dnsInspectorLoadingLines },
];


const IDLE_LINES = [
  { text: "> recon module initialized.", color: "text-[rgba(200,255,208,0.3)]" },
  { text: "> awaiting input.", color: "text-[rgba(200,255,208,0.3)]" },
  { text: "> " + "─".repeat(32), color: "text-[rgba(200,255,208,0.1)]" },
];


function getLoadingLines(result) {
  if (!result) {
    return [...IDLE_LINES, ...TOOL_REGISTRY.flatMap((t) => t.loadingLines)];
  }

  const match = TOOL_REGISTRY.find((t) => t.getLines(result) !== null);
  return match ? [...IDLE_LINES, ...match.loadingLines] : IDLE_LINES;
}


function getResultLines(result) {
  for (const tool of TOOL_REGISTRY) {
    const lines = tool.getLines(result);
    if (lines !== null) return lines;
  }
  return [];
}


export default function ReconPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const terminalLines = (() => {
    if (loading) return getLoadingLines(result);
    if (error) return [...IDLE_LINES, { text: `> ERROR: ${error}`, color: "text-red-400" }];
    if (result) return [...IDLE_LINES, ...getResultLines(result)];
    return IDLE_LINES;
  })();

  return (
    <div className="h-full grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]">
      <div className="flex flex-col gap-5 min-h-0 overflow-auto">

        <div className="flex items-center justify-center gap-4 border border-[rgba(0,255,65,0.12)] bg-[#0d0d0d] px-5 py-4">
          <div className="flex-col justify-center items-center gap-2">
            <p className="font-['Share_Tech_Mono'] text-[10px] uppercase tracking-[0.3em] text-[rgba(200,255,208,0.4)]">
              Module
            </p>
            <div className="flex justify-center items-center gap-2">
              <Radar size={25} className="text-[#00ff41] shrink-0" />
              <h2 className="font-['Share_Tech_Mono'] text-3xl uppercase tracking-[0.1em] text-[#d8ffe0]">
                Recon
              </h2>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 border border-[rgba(255,60,60,0.2)] bg-[rgba(255,60,60,0.04)] p-4">
            <AlertTriangle size={15} className="text-red-400 shrink-0 mt-0.5" />
            <p className="font-['Share_Tech_Mono'] text-xs text-red-400">{error}</p>
          </div>
        )}

        <Holehe onResult={setResult} onError={setError} onLoading={setLoading} />
        <Sherlock onResult={setResult} onError={setError} onLoading={setLoading} />
        <Whois onResult={setResult} onError={setError} onLoading={setLoading} />
        <TheHarvester onResult={setResult} onError={setError} onLoading={setLoading} />
        <MetadataExtractor onResult={setResult} onError={setError} onLoading={setLoading} />
        <DnsInspector onResult={setResult} onError={setError} onLoading={setLoading} />
      </div>

      <OutputTerminal lines={terminalLines} fileName="recon" />
    </div>
  );
}