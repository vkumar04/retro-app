"use client"

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const TREND = [
  { month: 1, total: 365, fat: 230, lean: 105 },
  { month: 3, total: 340, fat: 200, lean: 112 },
  { month: 6, total: 305, fat: 175, lean: 122 },
  { month: 9, total: 285, fat: 155, lean: 128 },
  { month: 12, total: 265, fat: 135, lean: 132 },
  { month: 15, total: 245, fat: 120, lean: 135 },
  { month: 18, total: 230, fat: 110, lean: 138 },
  { month: 21, total: 220, fat: 100, lean: 140 },
  { month: 24, total: 175, fat: 95, lean: 140 },
]

const GREEN = "oklch(0.75 0.22 145)"
const AMBER = "oklch(0.85 0.2 85)"
const CYAN = "oklch(0.65 0.2 200)"

export function CompositionTrend() {
  return (
    <div className="h-full border border-border bg-card font-mono p-[2vh] flex flex-col">
      <div className="flex items-center justify-between border-b border-border pb-[1vh]">
        <h2 className="text-terminal-green text-[2.2vh] tracking-[0.4em] font-bold glow-green">
          WEIGHT &amp; COMPOSITION TREND
        </h2>
        <div className="flex gap-[2vh] text-[1.6vh]">
          <Legend color={CYAN} label="TOTAL" />
          <Legend color={AMBER} label="FAT" />
          <Legend color={GREEN} label="LEAN" />
        </div>
      </div>

      <div className="flex-1 mt-[1.5vh] min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={TREND} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid stroke="oklch(0.25 0.08 145 / 0.4)" strokeDasharray="2 4" />
            <XAxis
              dataKey="month"
              stroke="oklch(0.55 0.1 145)"
              tick={{ fontSize: 14, fill: "oklch(0.55 0.1 145)" }}
              tickFormatter={(v) => `${v}M`}
            />
            <YAxis
              stroke="oklch(0.55 0.1 145)"
              tick={{ fontSize: 14, fill: "oklch(0.55 0.1 145)" }}
              domain={[0, 400]}
              ticks={[0, 100, 200, 300, 400]}
            />
            <Tooltip
              contentStyle={{
                background: "oklch(0.1 0.015 150)",
                border: "1px solid oklch(0.25 0.08 145)",
                borderRadius: 0,
                color: "oklch(0.85 0.18 145)",
                fontFamily: "monospace",
              }}
              labelFormatter={(v) => `MONTH ${v}`}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke={CYAN}
              strokeWidth={2}
              dot={{ fill: CYAN, r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="fat"
              stroke={AMBER}
              strokeWidth={2}
              dot={{ fill: AMBER, r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="lean"
              stroke={GREEN}
              strokeWidth={2}
              dot={{ fill: GREEN, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-[1vh] text-muted-foreground text-[1.4vh] flex items-center justify-end gap-2 tracking-wider">
        <span className="size-2 rounded-full bg-terminal-green pulse-glow" />
        <span>LIVE · LATEST SYNC 2026-05-08</span>
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2 tracking-[0.2em]">
      <span className="size-[1vh]" style={{ background: color }} />
      <span className="text-muted-foreground">{label}</span>
    </span>
  )
}
