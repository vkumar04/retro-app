"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useGertyActions, useGertyStore } from "@/lib/gerty-store"

// Vertical 4K display: shows the active todo list with large, readable
// rows. Tapping a row toggles its done state. Admin manages add/remove.
export default function TodoPage() {
  const todos = useGertyStore((s) => s.todos)
  const { toggleTodo } = useGertyActions()

  const [time, setTime] = useState("")
  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString("en-US", { hour12: false }))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const completed = todos.filter((t) => t.done).length

  return (
    <div className="min-h-screen w-full bg-background crt-curve font-mono flex flex-col">
      <header className="border-b border-border p-[1.6vh] flex items-center justify-between">
        <Link
          href="/admin"
          className="text-terminal-green hover:underline text-[1.6vh] tracking-[0.3em]"
        >
          {"<"} ADMIN
        </Link>
        <div className="text-center">
          <h1 className="text-terminal-green text-[3vh] tracking-[0.5em] font-bold glow-green">
            TASK QUEUE
          </h1>
          <div className="text-muted-foreground text-[1.4vh] tracking-[0.3em] mt-[0.4vh]">
            {completed} / {todos.length} COMPLETE
          </div>
        </div>
        <div className="text-terminal-amber text-[1.6vh] tabular-nums tracking-[0.2em] glow-amber">
          {time}
        </div>
      </header>

      <main className="flex-1 p-[2vh] overflow-y-auto">
        {todos.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-muted-foreground text-[3vh] tracking-[0.4em]">
                NO TASKS QUEUED
              </div>
              <div className="text-muted-foreground/60 text-[1.6vh] tracking-[0.3em] mt-[1vh]">
                ADD VIA ADMIN PANEL
              </div>
              <div className="mt-[3vh] text-terminal-green text-[1.4vh]">
                <span>{"> "}</span>
                <span className="cursor-blink">█</span>
              </div>
            </div>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-[2vh]">
            {todos.map((todo, i) => (
              <li key={todo.id}>
                <button
                  type="button"
                  onClick={() => toggleTodo(todo.id)}
                  className={`w-full h-full min-h-[18vh] text-left flex flex-col justify-between gap-[1.6vh] border p-[2.4vh] transition-colors ${
                    todo.done
                      ? "border-border/30 bg-card/30 opacity-50 grayscale"
                      : "border-border bg-card hover:border-terminal-green/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[1.3vh] tabular-nums tracking-[0.3em] ${
                        todo.done ? "text-muted-foreground/60" : "text-muted-foreground"
                      }`}
                    >
                      TASK {(i + 1).toString().padStart(2, "0")}
                    </span>
                    <span
                      className={`text-[1.2vh] tracking-[0.3em] ${
                        todo.done ? "text-muted-foreground/60" : "text-terminal-green"
                      }`}
                    >
                      {todo.done ? "DONE" : "PENDING"}
                    </span>
                  </div>
                  <span
                    className={`text-[3.4vh] tracking-[0.05em] leading-tight transition-all ${
                      todo.done
                        ? "text-muted-foreground line-through"
                        : "text-foreground glow-green"
                    }`}
                  >
                    {todo.text}
                  </span>
                  <Checkbox done={todo.done} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="border-t border-border p-[1.4vh] flex items-center justify-between text-[1.3vh] text-muted-foreground tracking-[0.2em]">
        <span className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-terminal-green pulse-glow" />
          LIVE TASK FEED
        </span>
        <span>WEYLAND-YUTANI · TASK CTRL v1.0</span>
      </footer>
    </div>
  )
}

function Checkbox({ done }: { done: boolean }) {
  return (
    <span
      className={`size-[3vh] shrink-0 border-2 flex items-center justify-center transition-colors ${
        done
          ? "border-terminal-amber bg-terminal-amber/10"
          : "border-terminal-green"
      }`}
    >
      {done && (
        <svg viewBox="0 0 24 24" className="size-[2vh] text-terminal-amber" fill="none">
          <path
            d="M4 12 L10 18 L20 6"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  )
}
