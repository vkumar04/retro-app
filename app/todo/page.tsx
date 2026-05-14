"use client"

import {
  Activity,
  BookOpen,
  Camera,
  CheckSquare,
  Dumbbell,
  Footprints,
  type LucideIcon,
  Moon,
  Phone,
  Pill,
  ShoppingCart,
  Sparkles,
  Sun,
  UtensilsCrossed,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useGertyActions, useGertyStore } from "@/lib/gerty-store"

// Vertical 4K display: shows the active todo list as big icon tiles, two
// per row. Tap toggles done. Completed tiles are bright + glowing; pending
// tiles are dim but still readable.
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
            DAILY TASKS
          </h1>
          <div className="text-muted-foreground text-[1.4vh] tracking-[0.3em] mt-[0.4vh]">
            {completed} / {todos.length} COMPLETE
          </div>
        </div>
        <div className="text-terminal-amber text-[1.6vh] tabular-nums tracking-[0.2em] glow-amber">
          {time}
        </div>
      </header>

      <main className="flex-1 p-[1vh] overflow-hidden">
        {todos.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-muted-foreground text-[3vh] tracking-[0.4em]">
                NO TASKS QUEUED
              </div>
              <div className="text-muted-foreground/60 text-[1.6vh] tracking-[0.3em] mt-[1vh]">
                ADD VIA ADMIN PANEL
              </div>
            </div>
          </div>
        ) : (
          <ul className="grid grid-cols-2 grid-rows-2 gap-[1vh] h-full">
            {todos.map((todo) => {
              const Icon = pickIcon(todo.text)
              return (
                <li key={todo.id} className="h-full">
                  <button
                    type="button"
                    onClick={() => toggleTodo(todo.id)}
                    className={`w-full h-full flex flex-col items-center justify-center gap-[2.5vh] border p-[2vh] transition-all ${
                      todo.done
                        ? "border-border/40 bg-card opacity-30 hover:opacity-60"
                        : "border-terminal-green bg-terminal-green/10 glow-green"
                    }`}
                  >
                    <Icon
                      className={
                        todo.done
                          ? "text-muted-foreground"
                          : "text-terminal-green"
                      }
                      style={{ width: "22vh", height: "22vh" }}
                      strokeWidth={1.4}
                    />
                    <span
                      className={`text-[3.4vh] tracking-[0.25em] uppercase text-center ${
                        todo.done
                          ? "text-muted-foreground"
                          : "text-terminal-green"
                      }`}
                    >
                      {todo.text}
                    </span>
                  </button>
                </li>
              )
            })}
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

// Map a task's text to a lucide icon by simple keyword sniffing.
// Falls back to a checkbox icon when nothing matches.
function pickIcon(text: string): LucideIcon {
  const t = text.toLowerCase()
  if (/eat|meal|food|nutrition|breakfast|lunch|dinner|snack/.test(t))
    return UtensilsCrossed
  if (/walk|step|stroll/.test(t)) return Footprints
  if (/lift|gym|weights?|dumbbell|press|squat|deadlift|workout/.test(t))
    return Dumbbell
  if (/run|cardio|exercis|train/.test(t)) return Activity
  if (/photo|camera|picture|selfie|shoot|film/.test(t)) return Camera
  if (/read|book|study/.test(t)) return BookOpen
  if (/sleep|nap|bed|rest/.test(t)) return Moon
  if (/sun|morning|wake/.test(t)) return Sun
  if (/pill|med|vitamin|supplement/.test(t)) return Pill
  if (/call|phone|ring/.test(t)) return Phone
  if (/shop|grocery|store|buy/.test(t)) return ShoppingCart
  if (/clean|tidy|wash/.test(t)) return Sparkles
  return CheckSquare
}
