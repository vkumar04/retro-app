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
  const skeletonWalking = useGertyStore((s) => s.skeletonWalking)
  const todos = useGertyStore((s) => s.todos)
  const {
    setMood,
    setSystemStatus,
    setVoiceId,
    sendGertyMessage,
    setSkeletonWalking,
    addTodo,
    toggleTodo,
    removeTodo,
    clearCompletedTodos,
  } = useGertyActions()

  const [message, setMessage] = useState("")
  const [todoInput, setTodoInput] = useState("")
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

  const addNewTodo = () => {
    const text = todoInput.trim()
    if (!text) return
    addTodo(text)
    setTodoInput("")
  }

  const completedCount = todos.filter((t) => t.done).length

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

          <Panel title="SKELETON" right={skeletonWalking ? "WALKING" : "IDLE"}>
            <div className="grid grid-cols-2 gap-2">
              <TerminalButton active={skeletonWalking} onClick={() => setSkeletonWalking(true)}>
                WALK
              </TerminalButton>
              <TerminalButton active={!skeletonWalking} onClick={() => setSkeletonWalking(false)}>
                STOP
              </TerminalButton>
            </div>
            <Link
              href="/skeleton"
              className="mt-3 block text-center text-xs text-terminal-green hover:underline"
            >
              VIEW SKELETON {">"}
            </Link>
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

          <div className="md:col-span-2">
            <Panel
              title="TASKS"
              right={`${completedCount} / ${todos.length} DONE`}
            >
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={todoInput}
                  onChange={(e) => setTodoInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addNewTodo()}
                  placeholder="New task..."
                  className="flex-1 bg-background border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-terminal-green"
                />
                <button
                  onClick={addNewTodo}
                  disabled={!todoInput.trim()}
                  className="px-4 py-2 border border-terminal-green bg-terminal-green/10 text-terminal-green hover:bg-terminal-green/20 disabled:opacity-40 disabled:cursor-not-allowed text-xs tracking-wider"
                >
                  ADD
                </button>
                <button
                  onClick={clearCompletedTodos}
                  disabled={completedCount === 0}
                  className="px-4 py-2 border border-border text-muted-foreground hover:border-destructive/60 hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed text-xs tracking-wider"
                >
                  CLEAR DONE
                </button>
              </div>

              {todos.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">
                  No tasks queued. Add one above.
                </p>
              ) : (
                <ul className="flex flex-col gap-1.5 max-h-72 overflow-y-auto">
                  {todos.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center gap-3 border border-border px-3 py-2"
                    >
                      <button
                        onClick={() => toggleTodo(t.id)}
                        aria-label={t.done ? "Mark incomplete" : "Mark complete"}
                        className={`size-4 shrink-0 border-2 flex items-center justify-center ${
                          t.done
                            ? "border-terminal-amber bg-terminal-amber/10"
                            : "border-terminal-green hover:bg-terminal-green/10"
                        }`}
                      >
                        {t.done && (
                          <svg viewBox="0 0 24 24" className="size-3 text-terminal-amber" fill="none">
                            <path
                              d="M4 12 L10 18 L20 6"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                      <span
                        className={`flex-1 text-sm ${
                          t.done ? "text-muted-foreground line-through" : "text-foreground"
                        }`}
                      >
                        {t.text}
                      </span>
                      <button
                        onClick={() => removeTodo(t.id)}
                        aria-label="Delete task"
                        className="text-xs text-muted-foreground hover:text-destructive tracking-wider"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <Link
                href="/todo"
                className="mt-3 block text-center text-xs text-terminal-green hover:underline"
              >
                VIEW TASK QUEUE {">"}
              </Link>
            </Panel>
          </div>
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
