"use client"

import { useGertyActions, useGertyStore, type Mood } from "@/lib/gerty-store"

const STATUS_OPTIONS = ["online", "maintenance", "offline"] as const
const MOODS: Mood[] = ["happy", "neutral", "sad", "confused", "angry", "sleeping", "thinking"]

export function SystemPanel() {
  const mood = useGertyStore((s) => s.mood)
  const brightness = useGertyStore((s) => s.brightness)
  const systemStatus = useGertyStore((s) => s.systemStatus)
  const showScanlines = useGertyStore((s) => s.showScanlines)
  const idleAnimation = useGertyStore((s) => s.idleAnimation)
  const { setMood, setBrightness, setSystemStatus, setShowScanlines, setIdleAnimation } =
    useGertyActions()

  return (
    <div className="border border-primary/30 bg-muted/5">
      <div className="border-b border-primary/30 p-3 flex items-center justify-between">
        <span className="text-xs text-primary">SYSTEM STATUS</span>
        <span
          className={`text-xs px-2 py-0.5 border ${
            systemStatus === "online"
              ? "border-primary text-primary"
              : systemStatus === "maintenance"
                ? "border-accent text-accent"
                : "border-destructive text-destructive"
          }`}
        >
          {systemStatus.toUpperCase()}
        </span>
      </div>
      <div className="p-4 space-y-4">
        <Field label="SYSTEM MODE">
          <div className="flex gap-2">
            {STATUS_OPTIONS.map((status) => {
              const active = systemStatus === status
              const tone =
                status === "online"
                  ? active
                    ? "border-primary bg-primary/20 text-primary"
                    : ""
                  : status === "maintenance"
                    ? active
                      ? "border-accent bg-accent/20 text-accent"
                      : ""
                    : active
                      ? "border-destructive bg-destructive/20 text-destructive"
                      : ""
              return (
                <button
                  key={status}
                  onClick={() => setSystemStatus(status)}
                  className={`flex-1 py-2 text-xs border transition-all ${tone || "border-primary/30 text-muted-foreground hover:border-primary/50"}`}
                >
                  {status.toUpperCase()}
                </button>
              )
            })}
          </div>
        </Field>

        <Field label="CURRENT MOOD">
          <div className="grid grid-cols-3 gap-2">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`py-2 text-xs border transition-all ${
                  mood === m
                    ? "border-accent bg-accent/20 text-accent"
                    : "border-primary/30 text-muted-foreground hover:border-primary/50"
                }`}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>
        </Field>

        <Field
          label="DISPLAY BRIGHTNESS"
          rightLabel={<span className="text-xs text-primary">{brightness}%</span>}
        >
          <input
            type="range"
            min={20}
            max={100}
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </Field>

        <Toggle label="SCANLINES EFFECT" value={showScanlines} onChange={setShowScanlines} />
        <Toggle label="IDLE ANIMATION" value={idleAnimation} onChange={setIdleAnimation} />
      </div>
    </div>
  )
}

function Field({
  label,
  children,
  rightLabel,
}: {
  label: string
  children: React.ReactNode
  rightLabel?: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-xs text-muted-foreground">{label}</label>
        {rightLabel}
      </div>
      {children}
    </div>
  )
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-2 border-t border-primary/20">
      <span className="text-xs text-muted-foreground">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`px-3 py-1 text-xs border ${value ? "border-primary bg-primary/20 text-primary" : "border-primary/30 text-muted-foreground"}`}
      >
        {value ? "ON" : "OFF"}
      </button>
    </div>
  )
}
