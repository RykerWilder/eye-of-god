import { Outlet, useNavigate } from "react-router-dom";
import { Activity, Globe, ChevronRight } from "lucide-react";
import Logo from "../../public/logo.svg";

const liveStats = [
  { label: "TOOLS ONLINE", value: "24", tone: "text-[#00ff41]" },
  { label: "ACTIVE MODULES", value: "08", tone: "text-[#5ac8fa]" },
  { label: "THREAT FEEDS", value: "13", tone: "text-[#ff9f0a]" },
  { label: "SYSTEM STATUS", value: "STABLE", tone: "text-[#00ff41]" },
];

export default function Layout() {
  const navigate = useNavigate();

  return (
    <main className="relative h-screen w-full overflow-hidden bg-[#080808] text-[#c8ffd0]">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,65,0.12),transparent_40%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.05)_1px,transparent_1px)] bg-[size:38px_38px]" />
        <div className="absolute left-0 right-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(0,255,65,0.08),transparent)] opacity-70 animate-[scanline-move_8s_linear_infinite]" />
      </div>

      <div className="relative grid h-full grid-cols-1 lg:grid-cols-[280px_1fr]">
        {/* ── SIDEBAR ── */}
        <aside className="border-b border-[rgba(0,255,65,0.12)] bg-[#0b0b0b]/90 backdrop-blur-md lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col p-4 sm:p-5">
            <div
              className="flex items-center justify-center border-[rgba(0,255,65,0.16)] bg-black/50 glow-border cursor-pointer"
              onClick={() => navigate("/")}
            >
              <img src={Logo} alt="eye-of-god" />
            </div>
            <div className="mt-5 border border-[rgba(0,255,65,0.12)] bg-[#101010] p-4">
              <p className="font-['Share_Tech_Mono'] text-xs uppercase tracking-[0.25em] text-[rgba(200,255,208,0.5)]">
                Core Access
              </p>
              <div className="mt-4 space-y-2">
                {[
                  ["Cyber Threat Dashboard", Activity, "/"],
                  ["Utility Links", Globe, "/utility-links"],
                ].map(([label, Icon, path]) => (
                  <button
                    key={label}
                    onClick={() => navigate(path)}
                    className="group flex min-h-11 w-full items-center justify-between border border-[rgba(0,255,65,0.08)] bg-black/30 px-3 py-2 text-left transition hover:border-[rgba(0,255,65,0.35)] hover:bg-[rgba(0,255,65,0.05)] active:scale-[0.99]"
                  >
                    <span className="flex items-center gap-3 text-sm text-[rgba(200,255,208,0.85)] group-hover:text-[#d8ffe0] transition-colors">
                      <Icon size={16} className="text-[#00ff41]" />
                      {label}
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-[rgba(200,255,208,0.35)] group-hover:text-[#00ff41] group-hover:translate-x-0.5 transition-all"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN AREA ── */}
        <section className="min-h-0 overflow-auto flex flex-col">
          <div className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
            {/* HEADER */}
            <header className="shrink-0 flex flex-col gap-4 border border-[rgba(0,255,65,0.15)] bg-[linear-gradient(180deg,rgba(0,255,65,0.06),rgba(0,0,0,0.35))] p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between glow-border">
              <div className="max-w-3xl">
                <p className="font-['Share_Tech_Mono'] text-xs uppercase tracking-[0.35em] text-[rgba(0,255,65,0.7)]">
                  Cybersecurity Control Surface
                </p>
                <h1 className="mt-3 font-['Share_Tech_Mono'] text-3xl uppercase tracking-[0.08em] text-[#d8ffe0] sm:text-4xl glow-text">
                  Eye of God
                </h1>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[480px]">
                {liveStats.map((item) => (
                  <div
                    key={item.label}
                    className="border border-[rgba(0,255,65,0.12)] bg-black/40 px-3 py-4 text-center"
                  >
                    <p className="text-[10px] uppercase tracking-[0.22em] text-[rgba(200,255,208,0.4)]">
                      {item.label}
                    </p>
                    <p
                      className={`mt-2 font-['Share_Tech_Mono'] text-lg ${item.tone}`}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </header>

            {/* ── OUTLET: contenuto della pagina corrente ── */}
            <div className="mt-5 flex-1 min-h-0">
              <Outlet />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
