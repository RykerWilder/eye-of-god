import { useState } from 'react'
import { Terminal, Copy, Check, Download } from 'lucide-react'

export default function OsintTerminal({ lines = [], fileName = 'output' }) {
  const [copied, setCopied] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const getText = () => lines.map((l) => l.text).join('\n')

  const handleCopy = () => {
    navigator.clipboard.writeText(getText()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleDownload = () => {
    const blob = new Blob([getText()], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName}_${timestamp}.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 2000)
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
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 border border-[rgba(0,255,65,0.15)] px-2.5 py-1.5 font-['Share_Tech_Mono'] text-[10px] uppercase tracking-[0.18em] text-[rgba(200,255,208,0.5)] transition hover:border-[rgba(0,255,65,0.4)] hover:text-[#00ff41]"
          >
            {copied
              ? <><Check size={16} /> Copied</>
              : <><Copy size={16} /> Copy</>
            }
          </button>
          <button
            onClick={handleDownload}
            disabled={lines.length === 0}
            className="flex items-center gap-1.5 border border-[rgba(0,255,65,0.15)] px-2.5 py-1.5 font-['Share_Tech_Mono'] text-[10px] uppercase tracking-[0.18em] text-[rgba(200,255,208,0.5)] transition hover:border-[rgba(0,255,65,0.4)] hover:text-[#00ff41] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[rgba(0,255,65,0.15)] disabled:hover:text-[rgba(200,255,208,0.5)]"
          >
            {downloaded
              ? <><Check size={16} /> Saved</>
              : <><Download size={16} /> .txt</>
            }
          </button>
        </div>
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