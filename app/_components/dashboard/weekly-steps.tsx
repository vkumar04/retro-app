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
    <div className="h-full border border-border bg-card p-[1.6vh] flex flex-col font-mono">
      <div className="border-b border-border pb-[0.8vh]">
        <h3 className="text-[2vh] font-bold text-terminal-cyan tracking-[0.3em]">
          LOCOMOTION ANALYSIS
        </h3>
        <p className="text-[1.3vh] text-muted-foreground tracking-[0.2em]">
          WEEKLY STEP COUNT
        </p>
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
              <Bar dataKey="steps" fill="oklch(0.65 0.2 200)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
