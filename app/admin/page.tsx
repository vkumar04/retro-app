"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { VOICE_OPTIONS } from "@/app/_components/admin/voice-options"
import { useGertyActions, useGertyStore, type Mood, type SystemStatus } from "@/lib/gerty-store"

const MOODS: Mood[] = ["happy", "neutral", "sad", "confused", "thinking", "angry", "sleeping"]
const STATUSES: SystemStatus[] = ["online", "maintenance", "offline"]

export default function AdminPage() {
  const mood = useGertyStore((s) => s.mood)
  const systemStatus = useGertyStore((s) => s.systemStatus)
  const voiceId = useGertyStore((s) => s.voiceId)
  const { setMood, setSystemStatus, setVoiceId, sendGertyMessage } = useGertyActions()

  const [message, setMessage] = useState("")
  const [time, setTime] = useState("")

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false }))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const send = () => {
    const text = message.trim()
    if (!text) return
    sendGertyMessage(text)
    setMessage("")
  }

  const statusTone =
    systemStatus === "online"
      ? "text-terminal-green"
      : systemStatus === "maintenance"
        ? "text-terminal-amber"
        : "text-destructive"

  return (
    <div className="min-h-screen bg-background crt-curve font-mono">
      <header className="border-b border-border bg-card p-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-terminal-green pulse-glow" />
              <span className="text-terminal-green glow-green text-lg font-bold tracking-wider">
                GERTY CONTROL
              </span>
            </div>
            <span className="text-muted-foreground text-xs">// LUNAR INDUSTRIES</span>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">STATUS:</span>
              <span className={statusTone}>{systemStatus.toUpperCase()}</span>
            </div>
            <div className="text-terminal-amber glow-amber tabular-nums min-w-[8ch]">{time}</div>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="mb-6 font-mono text-xs text-muted-foreground">
          <span className="text-terminal-green">root@gerty</span>
          <span className="text-muted-foreground">:</span>
          <span className="text-terminal-cyan">~/control</span>
          <span className="text-muted-foreground">$ </span>
          <span className="text-foreground">remote --target=GERTY_v3 --user=OPERATOR_01</span>
          <span className="cursor-blink ml-1">█</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Panel title="MOOD" right={mood.toUpperCase()}>
            <div className="grid grid-cols-2 gap-2">
              {MOODS.map((m) => (
                <TerminalButton key={m} active={mood === m} onClick={() => setMood(m)}>
                  {m.toUpperCase()}
                </TerminalButton>
              ))}
            </div>
          </Panel>

          <Panel title="SYSTEM" right={systemStatus.toUpperCase()}>
            <div className="grid grid-cols-1 gap-2">
              {STATUSES.map((s) => (
                <TerminalButton key={s} active={systemStatus === s} onClick={() => setSystemStatus(s)}>
                  {s.toUpperCase()}
                </TerminalButton>
              ))}
            </div>
          </Panel>

          <Panel title="VOICE">
            <select
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-terminal-green"
            >
              {VOICE_OPTIONS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </Panel>

          <Panel title="SPEAK">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Type for GERTY to say..."
                className="flex-1 bg-background border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-terminal-green"
              />
              <button
                onClick={send}
                disabled={!message.trim()}
                className="px-4 py-2 border border-terminal-green bg-terminal-green/10 text-terminal-green hover:bg-terminal-green/20 disabled:opacity-40 disabled:cursor-not-allowed text-xs tracking-wider"
              >
                SEND
              </button>
            </div>
          </Panel>
        </div>

        <footer className="mt-6 border-t border-border pt-4 text-center text-xs text-muted-foreground">
          <p>
            <Link href="/gerty" className="text-terminal-green hover:underline">
              {"<"} VIEW GERTY DISPLAY
            </Link>
            <span className="mx-3">//</span>
            <Link href="/" className="hover:text-terminal-green">
              DASHBOARD {">"}
            </Link>
          </p>
          <p className="mt-1">
            <span className="text-terminal-green">●</span> UPLINK ACTIVE //
            <span className="text-terminal-amber"> CONTROL SESSION OPEN</span>
          </p>
        </footer>
      </main>
    </div>
  )
}

function Panel({
  title,
  right,
  children,
}: {
  title: string
  right?: string
  children: React.ReactNode
}) {
  return (
    <section className="border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs tracking-wider text-terminal-green">{title}</span>
        {right && <span className="text-xs text-terminal-amber">{right}</span>}
      </div>
      <div className="p-3">{children}</div>
    </section>
  )
}

function TerminalButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-xs tracking-wider border transition-colors ${
        active
          ? "border-terminal-green bg-terminal-green/15 text-terminal-green glow-green"
          : "border-border text-muted-foreground hover:border-terminal-green/60 hover:text-terminal-green"
      }`}
    >
      {children}
    </button>
  )
}
