import { Radar, ScanSearch, Bug, Globe, Lock, TerminalSquare, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const toolCategories = [
  { name: 'Recon',        icon: Radar,          desc: 'Subdomain discovery, OSINT, Olehe, WHOIS.' },
  { name: 'Scanner',      icon: ScanSearch,     desc: 'Port scan, vulnerability check, headers audit.' },
  { name: 'Malware',      icon: Bug,            desc: 'Hash lookup, IOC parsing, sample triage entrypoint.' },
  { name: 'Threat Intel', icon: Globe,          desc: 'Feeds, CVE watchlists, actor tracking, IoC search.' },
  { name: 'Crypto',       icon: Lock,           desc: 'Hashing, encoding, JWT parser, cert inspection.' },
  { name: 'Terminal',     icon: TerminalSquare, desc: 'Command snippets, shell helpers, payload lab.' },
]

const toolRoutes = {
  'Recon': '/recon',
}

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="h-full grid grid-cols-1 gap-5 xl:grid-cols-[1.3fr_0.7fr]">

      <div className="grid gap-5 content-start">

        {/* Terminal */}
        <section className="relative overflow-hidden border border-[rgba(0,255,65,0.12)] bg-[#0d0d0d]/95 p-5 sm:p-6">
          <div className="absolute right-4 top-4 h-3 w-3 rounded-full bg-[#00ff41] shadow-[0_0_12px_#00ff41]" />
          <p className="font-['Share_Tech_Mono'] text-xs uppercase tracking-[0.25em] text-[rgba(200,255,208,0.45)]">
            Main Terminal
          </p>
          <div className="mt-5 space-y-3 font-['Share_Tech_Mono'] text-sm text-[rgba(200,255,208,0.88)]">
            <p>&gt; boot sequence initialized...</p>
            <p>&gt; loading reconnaissance modules...</p>
            <p>&gt; syncing IOC feeds... complete</p>
            <p>&gt; vulnerability engine... standby</p>
            <p className="text-[#00ff41]">
              &gt; system ready{' '}
              <span className="inline-block h-4 w-2 bg-[#00ff41] align-middle animate-[blink_1s_step-end_infinite]" />
            </p>
          </div>
        </section>

        {/* Tool cards */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {toolCategories.map(({ name, icon: Icon, desc }) => {
            const route = toolRoutes[name]
            return (
              <article
                key={name}
                className="group border border-[rgba(0,255,65,0.1)] bg-[linear-gradient(180deg,rgba(0,255,65,0.03),rgba(0,0,0,0.45))] p-5 transition hover:-translate-y-0.5 hover:border-[rgba(0,255,65,0.32)]"
              >
                <div className="flex items-center justify-between">
                  <Icon size={18} className="text-[#00ff41]" />
                  <span className="font-['Share_Tech_Mono'] text-[10px] uppercase tracking-[0.24em] text-[rgba(200,255,208,0.45)] group-hover:text-[#00ff41]">
                    module
                  </span>
                </div>
                <h3 className="mt-5 font-['Share_Tech_Mono'] text-lg text-[#d8ffe0]">{name}</h3>
                <p className="mt-3 text-sm leading-6 text-[rgba(200,255,208,0.56)]">{desc}</p>
                <button
                  onClick={() => route && navigate(route)}
                  disabled={!route}
                  className={`mt-5 inline-flex min-h-11 items-center gap-2 border px-3 py-2 text-xs uppercase tracking-[0.18em] transition
                    ${route
                      ? 'border-[rgba(0,255,65,0.14)] text-[#00ff41] hover:bg-[rgba(0,255,65,0.06)] cursor-pointer'
                      : 'border-[rgba(0,255,65,0.05)] text-[rgba(200,255,208,0.25)] cursor-not-allowed'
                    }`}
                >
                  {route ? 'Open tool' : 'Coming soon'} <ChevronRight size={14} />
                </button>
              </article>
            )
          })}
        </section>

      </div>

      {/* Right sidebar */}
      <aside className="grid gap-5 content-start">

        <section className="border border-[rgba(0,255,65,0.12)] bg-[#0d0d0d] p-5">
          <p className="font-['Share_Tech_Mono'] text-xs uppercase tracking-[0.25em] text-[rgba(200,255,208,0.45)]">
            Mission Feed
          </p>
          <div className="mt-4 space-y-4 text-sm">
            {[
              ['CVE watcher ready',     'Critical feeds linked to future dashboard widgets.'],
              ['OSINT hub prepared',    'Space reserved for external APIs and data ingestion.'],
              ['Utilities layer online','JWT parser, hash tools, cert decode, base64 tools.'],
            ].map(([title, copy]) => (
              <div key={title} className="border-l border-[rgba(0,255,65,0.25)] pl-4">
                <h3 className="font-['Share_Tech_Mono'] text-[#d8ffe0]">{title}</h3>
                <p className="mt-2 text-[rgba(200,255,208,0.56)]">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-[rgba(0,255,65,0.12)] bg-black/35 p-5">
          <p className="font-['Share_Tech_Mono'] text-xs uppercase tracking-[0.25em] text-[rgba(200,255,208,0.45)]">
            System Notes
          </p>
          <div className="mt-4 space-y-3 text-xs leading-6 text-[rgba(200,255,208,0.58)]">
            <p>[01] Full-height shell ready for routing and modular expansion.</p>
            <p>[02] Visual language optimized for SOC, red team, and terminal-inspired tooling.</p>
            <p>[03] Layout split between navigation, operations, and future widgets.</p>
            <p>[04] Only one main component: Homepage.</p>
          </div>
        </section>

      </aside>

    </div>
  )
}