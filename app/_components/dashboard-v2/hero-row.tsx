"use client"

import { useGertyStore } from "@/lib/gerty-store"

export function HeroRow() {
  const s = useGertyStore((st) => st.homeStats)

  const metrics: {
    label: string
    value: string
    unit?: string
    delta?: string
    tone: "green" | "amber" | "muted"
    hero?: boolean
  }[] = [
    {
      label: "TOTAL POUNDS LOST",
      value: s.lbsLost.toString(),
      unit: "LBS",
      tone: "green",
      hero: true,
    },
    {
      label: "CURRENT WEIGHT",
      value: s.currentWeightLbs.toString(),
      unit: "LBS",
      delta: `${s.weightDeltaPct > 0 ? "+" : ""}${s.weightDeltaPct}%`,
      tone: "green",
    },
    {
      label: "CURRENT FAT MASS",
      value: s.currentFatMassLbs.toString(),
      unit: "LBS",
      delta: `${s.fatMassDeltaPct > 0 ? "+" : ""}${s.fatMassDeltaPct}%`,
      tone: "green",
    },
    {
      label: "BODY FAT",
      value: s.bodyFatPct.toString(),
      unit: "%",
      delta: `WAS ${s.bodyFatStartPct}%`,
      tone: "amber",
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-[1.6vh] font-mono">
      {metrics.map((m) => (
        <Cell key={m.label} {...m} />
      ))}
    </div>
  )
}

function Cell({
  label,
  value,
  unit,
  delta,
  tone,
  hero,
}: {
  label: string
  value: string
  unit?: string
  delta?: string
  tone: "green" | "amber" | "muted"
  hero?: boolean
}) {
  const valueClass =
    tone === "amber"
      ? "text-terminal-amber glow-amber"
      : tone === "muted"
        ? "text-foreground"
        : "text-terminal-green glow-green"
  const deltaClass = tone === "amber" ? "text-terminal-green" : "text-terminal-amber"

  return (
    <div
      className={`relative h-full border border-border bg-card p-[1.6vh] flex flex-col justify-between overflow-hidden ${
        hero ? "ring-1 ring-terminal-green/40" : ""
      }`}
    >
      {hero && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,128,0.07),transparent_70%)] pointer-events-none" />
      )}
      <div className="flex items-baseline justify-between">
        <span className="text-muted-foreground text-[1.5vh] tracking-[0.3em]">
          {label}
        </span>
        {delta && (
          <span className={`text-[1.5vh] ${deltaClass}`}>{delta}</span>
        )}
      </div>
      <div className="flex items-baseline gap-[1vh] relative">
        <span
          className={`font-bold leading-none tabular-nums ${valueClass}`}
          style={{ fontSize: hero ? "11vh" : "7vh" }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-muted-foreground text-[2.4vh] tracking-wider">
            {unit}
          </span>
        )}
        {hero && (
          <span className="ml-auto text-foreground text-[2vh] tracking-[0.4em] glow-green pb-[1vh]">
            LOST
          </span>
        )}
      </div>
    </div>
  )
}
