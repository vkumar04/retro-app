"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const

type Point = { day: string; deep: number; light: number; rem: number }

function generate(): Point[] {
  return DAY_LABELS.map((day) => ({
    day,
    deep: Math.floor(Math.random() * 2 + 1),
    light: Math.floor(Math.random() * 3 + 2),
    rem: Math.floor(Math.random() * 2 + 1),
  }))
}

export function SleepAnalysis() {
  const [data, setData] = useState<Point[]>([])
  useEffect(() => setData(generate()), [])

  return (
    <div className="h-full border border-border bg-card p-[1.6vh] flex flex-col font-mono">
      <div className="border-b border-border pb-[0.8vh] flex items-center justify-between">
        <div>
          <h3 className="text-[2vh] font-bold text-terminal-amber glow-amber tracking-[0.3em]">
            SLEEP CYCLE ANALYSIS
          </h3>
          <p className="text-[1.3vh] text-muted-foreground tracking-[0.2em]">
            7-DAY OVERVIEW
          </p>
        </div>
        <div className="flex items-center gap-[1.4vh] text-[1.3vh]">
          <Legend color="bg-terminal-green" label="DEEP" />
          <Legend color="bg-terminal-cyan" label="LIGHT" />
          <Legend color="bg-terminal-amber" label="REM" />
        </div>
      </div>
      <div className="flex-1 min-h-0 mt-[1vh]">
        {data.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.55 0.1 245)", fontSize: 12 }}
              />
              <YAxis hide />
              <Bar dataKey="deep" stackId="a" fill="oklch(0.75 0.22 245)" />
              <Bar dataKey="light" stackId="a" fill="oklch(0.65 0.2 200)" />
              <Bar dataKey="rem" stackId="a" fill="oklch(0.85 0.2 85)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`h-[1vh] w-[1vh] rounded-full ${color}`} />
      <span className="text-muted-foreground tracking-[0.2em]">{label}</span>
    </div>
  )
}
