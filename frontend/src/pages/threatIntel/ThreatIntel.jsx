import { useState } from 'react'
import { Radar, AlertTriangle } from 'lucide-react'

import OutputTerminal from '../../components/OutputTerminal'
import Holehe from './tools/Holehe'
import Sherlock from './tools/Sherlock'

function buildHoleheLines(email, data) {
  const found = data.filter((item) => item.found)
  return [
    { text: '> HOLEHE — Email Footprint', color: 'text-[rgba(200,255,208,0.4)]' },
    { text: `> Target : ${email}`, color: 'text-[rgba(200,255,208,0.7)]' },
    { text: `> Checked: ${data.length} sites`, color: 'text-[rgba(200,255,208,0.6)]' },
    {
      text: `> Found  : ${found.length} registered accounts`,
      color: found.length > 0 ? 'text-[#00ff41]' : 'text-[rgba(200,255,208,0.4)]',
    },
    { text: '> ' + '─'.repeat(32), color: 'text-[rgba(200,255,208,0.15)]' },
    ...(found.length === 0
      ? [{ text: '> No accounts found.', color: 'text-[rgba(200,255,208,0.35)]' }]
      : found.map((item) => ({
          text: `> [+] ${item.name.padEnd(22)} ${item.domain || ''}`,
          color: 'text-[rgba(200,255,208,0.85)]',
        }))),
  ]
}

function buildSherlockLines(username, data) {
  const found = data.filter((item) => item.found)
  return [
    { text: '> SHERLOCK — Username Footprint', color: 'text-[rgba(200,255,208,0.4)]' },
    { text: `> Target : ${username}`, color: 'text-[rgba(200,255,208,0.7)]' },
    { text: `> Checked: ${data.length} platforms`, color: 'text-[rgba(200,255,208,0.6)]' },
    {
      text: `> Found  : ${found.length} registered accounts`,
      color: found.length > 0 ? 'text-[#00ff41]' : 'text-[rgba(200,255,208,0.4)]',
    },
    { text: '> ' + '─'.repeat(32), color: 'text-[rgba(200,255,208,0.15)]' },
    ...(found.length === 0
      ? [{ text: '> No accounts found.', color: 'text-[rgba(200,255,208,0.35)]' }]
      : found.map((item) => ({
          text: `> [+] ${item.name.padEnd(22)} ${item.url || ''}`,
          color: 'text-[rgba(200,255,208,0.85)]',
        }))),
  ]
}

const IDLE_LINES = [
  { text: '> recon module initialized.', color: 'text-[rgba(200,255,208,0.3)]' },
  { text: '> awaiting input.', color: 'text-[rgba(200,255,208,0.3)]' },
  { text: '> ' + '─'.repeat(32), color: 'text-[rgba(200,255,208,0.1)]' },
]

const LOADING_LINES = (label = 'target') => [
  ...IDLE_LINES,
  { text: `> scanning ${label}...`, color: 'text-[rgba(200,255,208,0.6)]' },
  { text: '> querying modules...', color: 'text-[rgba(200,255,208,0.4)]' },
]

export default function OsintPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const terminalLines = (() => {
    if (loading && result === null) return LOADING_LINES()
    if (error) {
      return [...IDLE_LINES, { text: `> ERROR: ${error}`, color: 'text-red-400' }]
    }

    if (result?.type === 'holehe') {
      return [...IDLE_LINES, ...buildHoleheLines(result.email, result.data)]
    }

    if (result?.type === 'sherlock') {
      return [...IDLE_LINES, ...buildSherlockLines(result.username, result.data)]
    }

    return IDLE_LINES
  })()

  return (
    <div className="h-full grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]">
      <div className="flex flex-col gap-5 min-h-0 overflow-auto">
        <div className="flex items-center justify-center gap-4 border border-[rgba(0,255,65,0.12)] bg-[#0d0d0d] px-5 py-4">
          <Radar size={20} className="text-[#00ff41] shrink-0" />
          <div>
            <p className="font-['Share_Tech_Mono'] text-[10px] uppercase tracking-[0.3em] text-[rgba(200,255,208,0.4)]">
              Module
            </p>
            <h2 className="font-['Share_Tech_Mono'] text-3xl uppercase tracking-[0.1em] text-[#d8ffe0]">
              Recon
            </h2>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 border border-[rgba(255,60,60,0.2)] bg-[rgba(255,60,60,0.04)] p-4">
            <AlertTriangle size={15} className="text-red-400 shrink-0 mt-0.5" />
            <p className="font-['Share_Tech_Mono'] text-xs text-red-400">{error}</p>
          </div>
        )}

        <Holehe
          onResult={setResult}
          onError={setError}
          onLoading={setLoading}
        />

        <Sherlock
          onResult={setResult}
          onError={setError}
          onLoading={setLoading}
        />
      </div>

      <OutputTerminal lines={terminalLines} />
    </div>
  )
}