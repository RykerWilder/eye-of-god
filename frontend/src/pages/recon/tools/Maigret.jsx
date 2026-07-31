import { useState } from "react";
import { Fingerprint } from "lucide-react";

function buildLines(username, checked, data) {
  return [
    { text: "> MAIGRET — Deep Username Footprint",     color: "text-[rgba(200,255,208,0.4)]" },
    { text: `> Target : ${username}`,                  color: "text-[rgba(200,255,208,0.7)]" },
    { text: `> Checked: ${checked} platforms`,         color: "text-[rgba(200,255,208,0.6)]" },
    {
      text:  `> Found  : ${data.length} registered accounts`,
      color: data.length > 0 ? "text-[#00ff41]" : "text-[rgba(200,255,208,0.4)]",
    },
    { text: "> " + "─".repeat(32), color: "text-[rgba(200,255,208,0.15)]" },
    ...(data.length === 0
      ? [{ text: "> No accounts found.", color: "text-[rgba(200,255,208,0.35)]" }]
      : data.map((item) => {
          const tags = item.tags && item.tags.length ? ` [${item.tags.join(", ")}]` : "";
          return {
            text:  `> [+] ${item.name.padEnd(22)} ${item.url || ""}${tags}`,
            color: "text-[rgba(200,255,208,0.85)]",
          };
        })
    ),
  ];
}

export const maigretLoadingLines = [
  { text: "> deep-scanning username across top platforms...", color: "text-[rgba(200,255,208,0.6)]" },
  { text: "> this may take a few minutes...",                  color: "text-[rgba(200,255,208,0.4)]" },
];

export function getMaigretLines(result) {
  if (result?.type !== "maigret") return null;
  return buildLines(result.username, result.checked, result.data);
}

export default function Maigret({ onResult, onError, onLoading }) {
  const [username, setUsername] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    onLoading(true);
    onError("");
    onResult(null);

    try {
      const res = await fetch("http://localhost:8000/api/maigret", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.detail || "API Error");
      onResult({
        type:     "maigret",
        username,
        checked:  payload.checked,
        data:     payload.results,
      });
      setUsername("");
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
          <Fingerprint size={18} className="text-[#00ff41]" />
        </div>
        <div className="min-w-0">
          <p className="font-['Share_Tech_Mono'] text-sm uppercase tracking-[0.22em] text-[#d8ffe0] truncate">
            Maigret
          </p>
          <p className="font-['Share_Tech_Mono'] text-[11px] text-[rgba(200,255,208,0.4)] truncate">
            Deep Username OSINT
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 mt-1">
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="target_username"
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