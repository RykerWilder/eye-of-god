import { useState } from "react";
import { Mail } from "lucide-react";

function buildLines(email, data) {
  const found = data.filter((item) => item.found);
  return [
    { text: "> HOLEHE — Email Footprint",                color: "text-[rgba(200,255,208,0.4)]" },
    { text: `> Target : ${email}`,                       color: "text-[rgba(200,255,208,0.7)]" },
    { text: `> Checked: ${data.length} sites`,           color: "text-[rgba(200,255,208,0.6)]" },
    {
      text:  `> Found  : ${found.length} registered accounts`,
      color: found.length > 0 ? "text-[#00ff41]" : "text-[rgba(200,255,208,0.4)]",
    },
    { text: "> " + "─".repeat(32), color: "text-[rgba(200,255,208,0.15)]" },
    ...(found.length === 0
      ? [{ text: "> No accounts found.", color: "text-[rgba(200,255,208,0.35)]" }]
      : found.map((item) => ({
          text:  `> [+] ${item.name.padEnd(22)} ${item.domain || ""}`,
          color: "text-[rgba(200,255,208,0.85)]",
        }))
    ),
  ];
}

export const holeheLoadingLines = [
  { text: "> scanning email footprint...", color: "text-[rgba(200,255,208,0.6)]" },
  { text: "> querying site modules...",    color: "text-[rgba(200,255,208,0.4)]" },
];

export function getHoleheLines(result) {
  if (result?.type !== "holehe") return null;
  return buildLines(result.email, result.data);
}

export default function Holehe({ onResult, onError, onLoading }) {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    onLoading(true);
    onError("");
    onResult(null);

    try {
      const res = await fetch("http://localhost:8000/api/holehe", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "API Error");
      onResult({ type: "holehe", email, data });
      setEmail("");
    } catch (err) {
      onError(err.message);
    } finally {
      onLoading(false);
    }
  };

  return (
    <section className="border border-[rgba(0,255,65,0.12)] bg-[#0d0d0d] p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Mail size={20} className="text-[#00ff41]" />
        <p className="font-['Share_Tech_Mono'] text-l uppercase tracking-[0.25em] text-[rgba(200,255,208,0.45)]">
          Holehe
        </p>
        <p className="font-['Share_Tech_Mono'] text-xs text-[rgba(200,255,208,0.3)] -mt-1">
          - Email to Registered Accounts
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 mt-1">
        <div className="relative flex-1 flex items-center">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="target@example.com"
            required
            className="w-full h-8.5 bg-black/60 border border-[rgba(0,255,65,0.15)] pl-9 pr-4 py-3 font-['Share_Tech_Mono'] text-sm text-[#c8ffd0] placeholder-[rgba(200,255,208,0.2)] outline-none focus:border-[rgba(0,255,65,0.45)] transition"
          />
        </div>
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