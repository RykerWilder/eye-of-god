import { useState } from 'react'
import { Terminal, Copy, Check } from 'lucide-react'

export default function OsintTerminal({ lines = [] }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const text = lines.map((l) => l.text).join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="flex flex-col min-h-0 border border-[rgba(0,255,65,0.12)] bg-[#080808]">

      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[rgba(0,255,65,0.1)] bg-[#0b0b0b]">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-[#00ff41]" />
          <span className="font-['Share_Tech_Mono'] text-xs uppercase tracking-[0.22em] text-[rgba(200,255,208,0.5)]">
            Output
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 border border-[rgba(0,255,65,0.15)] px-2.5 py-1 font-['Share_Tech_Mono'] text-[10px] uppercase tracking-[0.18em] text-[rgba(200,255,208,0.5)] transition hover:border-[rgba(0,255,65,0.4)] hover:text-[#00ff41]"
        >
          {copied
            ? <><Check size={11} /> Copied</>
            : <><Copy size={11} /> Copy</>
          }
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-5 font-['Share_Tech_Mono'] text-sm leading-7">
        {lines.map((line, i) => (
          <p key={i} className={line.color ?? 'text-[rgba(200,255,208,0.6)]'}>
            {line.text}
          </p>
        ))}

        <p className="text-[#00ff41] mt-1">
          &gt;{' '}
          <span className="inline-block h-4 w-2 bg-[#00ff41] align-middle animate-[blink_1s_step-end_infinite]" />
        </p>
      </div>

    </div>
  )
}