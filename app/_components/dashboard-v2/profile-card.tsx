"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useGertyStore } from "@/lib/gerty-store"

export function ProfileCard() {
  const s = useGertyStore((st) => st.homeStats)
  const PATIENT = {
    name: s.patientName,
    id: s.patientId,
    age: s.age,
    heightCm: s.heightCm,
    weightKg: s.weightKg,
    startWeightLbs: s.startWeightLbs,
    currentWeightLbs: s.currentWeightLbs,
    targetWeightLbs: s.targetWeightLbs,
    bodyFatStart: s.bodyFatStartPct,
    bodyFatNow: s.bodyFatPct,
    bodyFatGoal: s.bodyFatGoalPct,
    daysActive: s.daysActive,
    streakDays: s.streakDays,
  }
  const lostLbs = PATIENT.startWeightLbs - PATIENT.currentWeightLbs
  const goalLbs = PATIENT.startWeightLbs - PATIENT.targetWeightLbs
  const goalProgress = Math.min(1, lostLbs / goalLbs)
  const fatProgress =
    (PATIENT.bodyFatStart - PATIENT.bodyFatNow) /
    (PATIENT.bodyFatStart - PATIENT.bodyFatGoal)

  return (
    <div className="h-full border border-border bg-card font-mono p-[1.6vh] flex flex-col gap-[1.6vh] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-[0.8vh]">
        <div className="flex items-center gap-2">
          <div className="size-2.5 rounded-full bg-terminal-green pulse-glow" />
          <h2 className="text-terminal-green text-[1.8vh] tracking-[0.3em] font-bold glow-green">
            FAT LOSS TRACKER
          </h2>
        </div>
        <span className="text-muted-foreground text-[1.3vh] tracking-[0.3em]">
          {PATIENT.id}
        </span>
      </div>

      {/* Identity block */}
      <div className="flex flex-col items-center gap-[1.2vh]">
        <div className="relative">
          <div className="size-[20vh] p-[0.4vh] border-2 border-terminal-green box-glow">
            <div className="size-full bg-background overflow-hidden">
              <Image
                src="/adam.jpg"
                alt={PATIENT.name}
                width={400}
                height={400}
                className="object-cover w-full h-full grayscale contrast-125"
              />
            </div>
          </div>
          <div className="absolute -top-1.5 -right-1.5 size-2.5 bg-terminal-amber" />
          <div className="absolute -bottom-1.5 -left-1.5 size-2.5 bg-terminal-green pulse-glow" />
        </div>
        <h3 className="text-foreground text-[3.4vh] font-bold tracking-[0.3em] glow-green">
          {PATIENT.name}
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-1">
        <Stat label="AGE" value={`${PATIENT.age}`} />
        <Stat label="HEIGHT" value={`${PATIENT.heightCm}`} unit="CM" divided />
        <Stat label="WEIGHT" value={`${PATIENT.weightKg}`} unit="KG" divided />
      </div>

      {/* Progress section */}
      <Section
        title="PROGRESS"
        right={<span className="text-muted-foreground text-[1.2vh] tracking-[0.3em]">[ ACTIVE ]</span>}
        accent="amber"
      >
        <ProgressRow
          label="GOAL PROGRESS"
          metric={`${lostLbs} / ${goalLbs} LBS`}
          progress={goalProgress}
          tone="green"
        />
        <ProgressRow
          label="BODY FAT"
          metric={`${PATIENT.bodyFatStart}% → ${PATIENT.bodyFatNow}%`}
          progress={fatProgress}
          tone="amber"
        />

        <div className="grid grid-cols-2 gap-[0.8vh] mt-[0.4vh]">
          <MiniStat label="DAYS ACTIVE" value={PATIENT.daysActive.toString()} />
          <MiniStat label="STREAK" value={PATIENT.streakDays.toString()} unit="D" />
        </div>
      </Section>

      {/* Vitals section — fills remaining space */}
      <Section
        title="LIVE VITALS"
        right={
          <span className="text-muted-foreground text-[1.2vh] tracking-[0.3em] flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-terminal-green pulse-glow" />
            STREAMING
          </span>
        }
        accent="cyan"
        className="flex-1 min-h-0"
      >
        <VitalsGrid />
      </Section>
    </div>
  )
}

function Section({
  title,
  right,
  accent,
  children,
  className,
}: {
  title: string
  right?: React.ReactNode
  accent: "green" | "amber" | "cyan"
  children: React.ReactNode
  className?: string
}) {
  const titleClass =
    accent === "amber"
      ? "text-terminal-amber glow-amber"
      : accent === "cyan"
        ? "text-terminal-cyan"
        : "text-terminal-green glow-green"
  return (
    <div className={`flex flex-col gap-[0.8vh] ${className ?? ""}`}>
      <div className="flex items-center justify-between border-b border-border pb-[0.5vh]">
        <h4 className={`text-[1.7vh] tracking-[0.3em] font-bold ${titleClass}`}>{title}</h4>
        {right}
      </div>
      <div className="flex flex-col gap-[0.8vh]">{children}</div>
    </div>
  )
}

function Stat({
  label,
  value,
  unit,
  divided,
}: {
  label: string
  value: string
  unit?: string
  divided?: boolean
}) {
  return (
    <div className={`text-center ${divided ? "border-l border-border" : ""}`}>
      <div className="text-muted-foreground text-[1.3vh] tracking-[0.3em]">
        {label}
      </div>
      <div className="mt-[0.3vh] leading-none">
        <span className="text-foreground text-[2.4vh] font-bold glow-green">
          {value}
        </span>
        {unit && (
          <span className="text-muted-foreground text-[1.2vh] ml-1 tracking-wider">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}

function ProgressRow({
  label,
  metric,
  progress,
  tone,
}: {
  label: string
  metric: string
  progress: number
  tone: "green" | "amber"
}) {
  const fill = tone === "green" ? "bg-terminal-green" : "bg-terminal-amber"
  return (
    <div>
      <div className="flex justify-between items-baseline">
        <span className="text-muted-foreground text-[1.3vh] tracking-[0.2em]">
          {label}
        </span>
        <span
          className={`text-[1.5vh] tabular-nums ${
            tone === "amber" ? "text-terminal-amber" : "text-terminal-green"
          }`}
        >
          {metric}
        </span>
      </div>
      <div className="mt-[0.4vh] h-[1vh] border border-border bg-background overflow-hidden">
        <div
          className={`h-full ${fill}`}
          style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
        />
      </div>
    </div>
  )
}

function MiniStat({
  label,
  value,
  unit,
}: {
  label: string
  value: string
  unit?: string
}) {
  return (
    <div className="border border-border p-[0.7vh]">
      <div className="text-muted-foreground text-[1.1vh] tracking-[0.3em]">
        {label}
      </div>
      <div className="text-terminal-green text-[2vh] font-bold mt-[0.2vh] glow-green">
        {value}
        {unit && (
          <span className="text-muted-foreground text-[1.2vh] ml-1 tracking-wider">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}

type TodayMetrics = {
  steps: number
  calories: number
  activeMinutes: number
  activeZoneMinutes: number
  distanceMeters: number
  floors: number
}

type Tone = "red" | "amber" | "green" | "cyan"
type Tile = { label: string; value: number; unit: string; tone: Tone }

const INITIAL: Tile[] = [
  { label: "STEPS", value: 0, unit: "", tone: "green" },
  { label: "CALORIES", value: 0, unit: "KCAL", tone: "amber" },
  { label: "ACTIVE", value: 0, unit: "MIN", tone: "amber" },
  { label: "AZM", value: 0, unit: "MIN", tone: "red" },
  { label: "DISTANCE", value: 0, unit: "M", tone: "cyan" },
  { label: "FLOORS", value: 0, unit: "", tone: "cyan" },
]

function VitalsGrid() {
  const [vals, setVals] = useState(INITIAL)
  const [flash, setFlash] = useState<Record<string, number>>({})

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch("/api/health/today", { cache: "no-store" })
        if (!res.ok) return
        const d = (await res.json()) as TodayMetrics
        if (cancelled) return
        const next: Record<string, number> = {
          STEPS: d.steps,
          CALORIES: d.calories,
          ACTIVE: d.activeMinutes,
          AZM: d.activeZoneMinutes,
          DISTANCE: d.distanceMeters,
          FLOORS: d.floors,
        }
        setVals((prev) =>
          prev.map((v) => {
            const n = next[v.label] ?? v.value
            if (n !== v.value) setFlash((f) => ({ ...f, [v.label]: Date.now() }))
            return { ...v, value: n }
          }),
        )
      } catch {
        // keep prior values
      }
    }
    load()
    const id = setInterval(load, 30 * 1000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  const flashActive = (label: string) =>
    flash[label] && Date.now() - flash[label] < 1200

  return (
    <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-3 gap-[0.8vh]">
      {vals.map((v) => {
        const toneClass =
          v.tone === "red"
            ? "text-terminal-red glow-red"
            : v.tone === "amber"
              ? "text-terminal-amber glow-amber"
              : v.tone === "cyan"
                ? "text-terminal-cyan"
                : "text-terminal-green glow-green"
        return (
          <div
            key={v.label}
            className="border border-border p-[0.8vh] flex flex-col justify-center"
          >
            <div className="text-muted-foreground text-[1.1vh] tracking-[0.3em]">
              {v.label}
            </div>
            <div className="mt-[0.2vh] flex items-baseline gap-2">
              <span
                className={`text-[2.4vh] font-bold tabular-nums leading-none transition-all duration-500 ${toneClass} ${flashActive(v.label) ? "scale-110 brightness-150" : ""}`}
              >
                {v.value.toLocaleString()}
              </span>
              {v.unit && (
                <span className="text-muted-foreground text-[1.1vh] tracking-wider">
                  {v.unit}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
