"use client"

import { useEffect, useState } from "react"
import { useGertyActions, useGertyStore, type HomeStats } from "@/lib/gerty-store"

type FieldDef = {
  key: keyof HomeStats
  label: string
  type: "number" | "text"
  step?: string
}

// Removed currentWeightLbs, currentFatMassLbs, bodyFatPct — these will be
// sourced from Google Health once the health_metrics scope is added.
const HERO_FIELDS: FieldDef[] = [
  { key: "lbsLost", label: "TOTAL LBS LOST", type: "number" },
  { key: "bodyFatStartPct", label: "BODY FAT START % (WAS)", type: "number", step: "0.1" },
  { key: "weightDeltaPct", label: "WEIGHT Δ %", type: "number", step: "0.1" },
  { key: "fatMassDeltaPct", label: "FAT MASS Δ %", type: "number", step: "0.1" },
]

const COMPOSITION_FIELDS: FieldDef[] = [
  { key: "visceralFatLbs", label: "VISCERAL FAT (LBS)", type: "number" },
  { key: "subcutaneousFatLbs", label: "SUBCUTANEOUS FAT (LBS)", type: "number" },
  { key: "leanMassLbs", label: "LEAN MASS (LBS)", type: "number" },
]

// Removed weightKg — will come from Google Health weight data type.
const PROFILE_FIELDS: FieldDef[] = [
  { key: "patientName", label: "PATIENT NAME", type: "text" },
  { key: "patientId", label: "PATIENT ID", type: "text" },
  { key: "age", label: "AGE", type: "number" },
  { key: "heightCm", label: "HEIGHT (CM)", type: "number" },
  { key: "startWeightLbs", label: "START WEIGHT (LBS)", type: "number" },
  { key: "targetWeightLbs", label: "TARGET WEIGHT (LBS)", type: "number" },
  { key: "bodyFatGoalPct", label: "BODY FAT GOAL %", type: "number", step: "0.1" },
  { key: "daysActive", label: "DAYS ACTIVE", type: "number" },
  { key: "streakDays", label: "STREAK DAYS", type: "number" },
]

export function StatsPanel() {
  const stored = useGertyStore((st) => st.homeStats)
  const { setHomeStats } = useGertyActions()
  const [draft, setDraft] = useState<HomeStats>(stored)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!dirty) setDraft(stored)
  }, [stored, dirty])

  const update = (key: keyof HomeStats, raw: string, type: "number" | "text") => {
    setDirty(true)
    setDraft((d) => ({
      ...d,
      [key]: type === "number" ? (raw === "" ? 0 : Number(raw)) : raw,
    }))
  }

  const save = () => {
    setHomeStats(draft)
    setDirty(false)
  }

  const revert = () => {
    setDraft(stored)
    setDirty(false)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Section title="HERO METRICS">
        {HERO_FIELDS.map((f) => (
          <Field key={f.key} field={f} value={draft[f.key]} onChange={update} />
        ))}
      </Section>

      <Section title="BODY COMPOSITION">
        {COMPOSITION_FIELDS.map((f) => (
          <Field key={f.key} field={f} value={draft[f.key]} onChange={update} />
        ))}
      </Section>

      <div className="md:col-span-2">
        <Section title="PATIENT PROFILE">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PROFILE_FIELDS.map((f) => (
              <Field key={f.key} field={f} value={draft[f.key]} onChange={update} />
            ))}
          </div>
        </Section>
      </div>

      <div className="md:col-span-2 flex items-center gap-3">
        <button
          onClick={save}
          disabled={!dirty}
          className="px-4 py-2 border border-terminal-green bg-terminal-green/10 text-terminal-green hover:bg-terminal-green/20 disabled:opacity-40 disabled:cursor-not-allowed text-xs tracking-wider"
        >
          SAVE TO DASHBOARD
        </button>
        <button
          onClick={revert}
          disabled={!dirty}
          className="px-4 py-2 border border-border text-muted-foreground hover:border-destructive/60 hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed text-xs tracking-wider"
        >
          REVERT
        </button>
        {dirty && (
          <span className="text-xs text-terminal-amber tracking-wider">
            UNSAVED CHANGES
          </span>
        )}
      </div>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="border border-border bg-card">
      <div className="border-b border-border px-3 py-2 text-xs tracking-wider text-terminal-green">
        {title}
      </div>
      <div className="p-3 flex flex-col gap-3">{children}</div>
    </section>
  )
}

function Field({
  field,
  value,
  onChange,
}: {
  field: FieldDef
  value: string | number
  onChange: (key: keyof HomeStats, raw: string, type: "number" | "text") => void
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] tracking-[0.2em] text-muted-foreground">
        {field.label}
      </span>
      <input
        type={field.type}
        step={field.step}
        value={value as string | number}
        onChange={(e) => onChange(field.key, e.target.value, field.type)}
        className="bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-terminal-green"
      />
    </label>
  )
}
