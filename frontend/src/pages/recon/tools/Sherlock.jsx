import { useState } from "react";
import { User } from "lucide-react";

function buildLines(username, data) {
  const found = data.filter((item) => item.found);
  return [
    { text: "> SHERLOCK — Username Footprint",           color: "text-[rgba(200,255,208,0.4)]" },
    { text: `> Target : ${username}`,                    color: "text-[rgba(200,255,208,0.7)]" },
    { text: `> Checked: ${data.length} platforms`,       color: "text-[rgba(200,255,208,0.6)]" },
    {
      text:  `> Found  : ${found.length} registered accounts`,
      color: found.length > 0 ? "text-[#00ff41]" : "text-[rgba(200,255,208,0.4)]",
    },
    { text: "> " + "─".repeat(32), color: "text-[rgba(200,255,208,0.15)]" },
    ...(found.length === 0
      ? [{ text: "> No accounts found.", color: "text-[rgba(200,255,208,0.35)]" }]
      : found.map((item) => ({
          text:  `> [+] ${item.name.padEnd(22)} ${item.url || ""}`,
          color: "text-[rgba(200,255,208,0.85)]",
        }))
    ),
  ];
}

export const sherlockLoadingLines = [
  { text: "> scanning username across platforms...", color: "text-[rgba(200,255,208,0.6)]" },
  { text: "> querying social modules...",            color: "text-[rgba(200,255,208,0.4)]" },
];

export function getSherlockLines(result) {
  if (result?.type !== "sherlock") return null;
  return buildLines(result.username, result.data);
}

export default function Sherlock({ onResult, onError, onLoading }) {
  const [username, setUsername] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    onLoading(true);
    onError("");
    onResult(null);

    try {
      const res = await fetch("http://localhost:8000/api/sherlock", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "API Error");
      onResult({ type: "sherlock", username, data });
    } catch (err) {
      onError(err.message);
    } finally {
      onLoading(false);
    }
  };

  return (
    <section className="border border-[rgba(0,255,65,0.12)] bg-[#0d0d0d] p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <User size={20} className="text-[#00ff41]" />
        <p className="font-['Share_Tech_Mono'] text-l uppercase tracking-[0.25em] text-[rgba(200,255,208,0.45)]">
          Sherlock
        </p>
        <p className="font-['Share_Tech_Mono'] text-xs text-[rgba(200,255,208,0.3)] -mt-1">
          - Username to Social Accounts
        </p>
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