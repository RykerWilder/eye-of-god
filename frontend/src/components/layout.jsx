import { Outlet, useNavigate } from "react-router-dom";
import { Activity, Globe, ChevronRight, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Logo from "../../public/logo.svg";

const tools = [
  { name: "WHOIS", path: "/recon/", section: "Recon" },
  { name: "Sherlock", path: "/recon/", section: "Recon" },
  { name: "Holehe", path: "/recon/", section: "Recon" },
  { name: "theHarvester", path: "/recon/", section: "Recon" },
  { name: "AbuseIPDB", path: "/threat-intel", section: "Threat Intel" },
  {
    name: "VirusTotal",
    path: "/threat-intel/virustotal",
    section: "Threat Intel",
  },
  {
    name: "AlienVault OTX",
    path: "/threat-intel/alienvault-otx",
    section: "Threat Intel",
  },
  {
    name: "Have I Been Pwned",
    path: "/threat-intel/have-i-been-pwned",
    section: "Threat Intel",
  },
];

export default function Layout() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const filteredTools = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return [];

    return tools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query) ||
        tool.section.toLowerCase().includes(query),
    );
  }, [search]);

  useEffect(() => {
    if (!search.trim()) {
      setHighlightedIndex(-1);
      return;
    }

    setHighlightedIndex(filteredTools.length > 0 ? 0 : -1);
  }, [search, filteredTools.length]);

  const handleToolClick = (path) => {
    setSearch("");
    setIsOpen(false);
    setHighlightedIndex(-1);
    navigate(path);
  };

  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setIsOpen(true);
    }

    if (!filteredTools.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex((prev) =>
          prev < filteredTools.length - 1 ? prev + 1 : 0,
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredTools.length - 1,
        );
        break;

      case "Enter":
        if (isOpen && highlightedIndex >= 0) {
          e.preventDefault();
          handleToolClick(filteredTools[highlightedIndex].path);
        }
        break;

      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;

      default:
        break;
    }
  };

  return (
    <main className="relative h-screen w-full overflow-hidden bg-[#080808] text-[#c8ffd0]">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,65,0.12),transparent_40%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.05)_1px,transparent_1px)] bg-[size:38px_38px]" />
        <div className="absolute left-0 right-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(0,255,65,0.08),transparent)] opacity-70 animate-[scanline-move_8s_linear_infinite]" />
      </div>

      <div className="relative grid h-full grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-[rgba(0,255,65,0.12)] bg-[#0b0b0b]/90 backdrop-blur-md lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col p-4 sm:p-5">
            <div
              className="glow-border flex cursor-pointer items-center justify-center border-[rgba(0,255,65,0.16)] bg-black/50"
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
                    <span className="flex items-center gap-3 text-sm text-[rgba(200,255,208,0.85)] transition-colors group-hover:text-[#d8ffe0]">
                      <Icon size={16} className="text-[#00ff41]" />
                      {label}
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-[rgba(200,255,208,0.35)] transition-all group-hover:translate-x-0.5 group-hover:text-[#00ff41]"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <section className="min-h-0 overflow-auto flex flex-col">
          <div className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
            <header className="glow-border shrink-0 flex flex-col gap-4 border border-[rgba(0,255,65,0.15)] bg-[linear-gradient(180deg,rgba(0,255,65,0.06),rgba(0,0,0,0.35))] p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="font-['Share_Tech_Mono'] text-xs uppercase tracking-[0.35em] text-[rgba(0,255,65,0.7)]">
                  Cybersecurity Control Surface
                </p>
                <h1 className="glow-text mt-3 font-['Share_Tech_Mono'] text-3xl uppercase tracking-[0.08em] text-[#d8ffe0] sm:text-4xl">
                  Eye of God
                </h1>
              </div>

              <div className="relative w-full lg:w-[360px]">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setIsOpen(true);
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsOpen(true)}
                  onBlur={() => {
                    setTimeout(() => setIsOpen(false), 150);
                  }}
                  placeholder="Search tools..."
                  className="h-14 w-full border border-[rgba(0,255,65,0.18)] bg-black/50 pl-11 pr-4 font-['Share_Tech_Mono'] text-sm text-[#d8ffe0] outline-none transition placeholder:text-[rgba(200,255,208,0.35)] focus:border-[rgba(0,255,65,0.45)]"
                />

                {isOpen && search.trim() !== "" && (
                  <div className="absolute right-0 top-full z-20 mt-2 max-h-72 w-full overflow-y-auto border border-[rgba(0,255,65,0.15)] bg-[#0b0b0b]/95 shadow-[0_0_25px_rgba(0,255,65,0.08)] backdrop-blur-md">
                    {filteredTools.length > 0 ? (
                      filteredTools.map((tool, index) => (
                        <button
                          key={`${tool.name}-${tool.path}`}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleToolClick(tool.path)}
                          className={`group flex w-full items-center justify-between border-b border-[rgba(0,255,65,0.08)] px-4 py-3 text-left transition last:border-b-0 ${
                            highlightedIndex === index
                              ? "bg-[rgba(0,255,65,0.10)]"
                              : "hover:bg-[rgba(0,255,65,0.06)]"
                          }`}
                        >
                          <div>
                            <p className="font-['Share_Tech_Mono'] text-sm text-[#d8ffe0] group-hover:text-[#ffffff]">
                              {tool.name}
                            </p>
                            <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[rgba(200,255,208,0.45)]">
                              {tool.section} · {tool.path}
                            </p>
                          </div>

                          <ChevronRight
                            size={14}
                            className={`transition-all ${
                              highlightedIndex === index
                                ? "translate-x-0.5 text-[#00ff41]"
                                : "text-[rgba(200,255,208,0.35)] group-hover:translate-x-0.5 group-hover:text-[#00ff41]"
                            }`}
                          />
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-sm text-[rgba(200,255,208,0.55)]">
                        No matching tools found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </header>

            <div className="mt-5 min-h-0 flex-1">
              <Outlet />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}