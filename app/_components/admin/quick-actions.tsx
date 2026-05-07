"use client"

import { useGertyActions, type Mood } from "@/lib/gerty-store"

interface Action {
  label: string
  mood?: Mood
  systemStatus?: "online" | "offline" | "maintenance"
  message?: string
  tone?: "primary" | "accent"
}

const ACTIONS: Action[] = [
  { label: "GREET USER", mood: "happy", message: "I hope you are having a wonderful day!" },
  {
    label: "SHOW EMPATHY",
    mood: "sad",
    message: "I am sorry to hear that. Is there anything I can do to help?",
  },
  {
    label: "THINKING MODE",
    mood: "thinking",
    message: "Let me process that information for a moment...",
  },
  {
    label: "MAINTENANCE MODE",
    mood: "sleeping",
    systemStatus: "maintenance",
    message: "Entering maintenance mode. I will be back shortly.",
    tone: "accent",
  },
]

export function QuickActions() {
  const { setMood, setSystemStatus, sendGertyMessage, reset } = useGertyActions()

  const run = (action: Action) => {
    if (action.mood) setMood(action.mood)
    if (action.systemStatus) setSystemStatus(action.systemStatus)
    if (action.message) sendGertyMessage(action.message)
  }

  return (
    <div className="mt-6 border border-primary/30 bg-muted/5">
      <div className="border-b border-primary/30 p-3">
        <span className="text-xs text-primary">QUICK ACTIONS</span>
      </div>
      <div className="p-4 flex flex-wrap gap-4">
        {ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => run(action)}
            className={`px-4 py-2 border text-xs ${
              action.tone === "accent"
                ? "border-accent/30 text-accent hover:bg-accent/10"
                : "border-primary/30 text-primary hover:bg-primary/10"
            }`}
          >
            {action.label}
          </button>
        ))}
        <button
          onClick={reset}
          className="px-4 py-2 border border-destructive/50 text-destructive hover:bg-destructive/10 text-xs"
        >
          FACTORY RESET
        </button>
      </div>
    </div>
  )
}
