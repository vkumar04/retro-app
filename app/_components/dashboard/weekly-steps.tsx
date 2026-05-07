"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const

type Point = { day: string; steps: number; goal: number }

function generate(): Point[] {
  return DAYS.map((day) => ({
    day,
    steps: Math.floor(Math.random() * 5000 + 5000),
    goal: 10000,
  }))
}

export function WeeklySteps() {
  const [data, setData] = useState<Point[]>([])
  useEffect(() => setData(generate()), [])

  return (
    <div className="border border-border bg-card p-4 box-glow">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-terminal-cyan uppercase tracking-wider">
          LOCOMOTION ANALYSIS
        </h3>
        <p className="text-xs text-muted-foreground">WEEKLY STEP COUNT</p>
      </div>
      <div className="h-40">
        {data.length > 0 && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.55 0.1 145)", fontSize: 10 }}
            />
            <YAxis hide />
            <Bar dataKey="steps" fill="oklch(0.65 0.2 200)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
