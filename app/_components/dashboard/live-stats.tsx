"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import { StatsCard } from "./stats-card"

type CaloriePoint = { hour: string; calories: number; active: number }
type HeartPoint = { time: number; bpm: number }

function generateCalories(): CaloriePoint[] {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, "0")}:00`,
    calories: Math.floor(Math.random() * 80 + 20),
    active: Math.floor(Math.random() * 50 + 10),
  }))
}

function generateHeart(): HeartPoint[] {
  return Array.from({ length: 60 }, (_, i) => ({
    time: i,
    bpm: Math.floor(Math.random() * 30 + 65),
  }))
}

export function LiveStats() {
  // Start empty so server and first client render match.
  const [calories, setCalories] = useState<CaloriePoint[]>([])
  const [heart, setHeart] = useState<HeartPoint[]>([])
  const [totalSteps, setTotalSteps] = useState(0)

  useEffect(() => {
    setCalories(generateCalories())
    setHeart(generateHeart())
    setTotalSteps(
      Array.from({ length: 7 }, () => Math.floor(Math.random() * 5000 + 5000)).reduce(
        (s, n) => s + n,
        0,
      ),
    )
  }, [])

  useEffect(() => {
    const id = setInterval(() => setCalories(generateCalories()), 30_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setHeart((prev) => {
        if (prev.length === 0) return prev
        const next = prev.slice(1)
        next.push({
          time: prev[prev.length - 1].time + 1,
          bpm: Math.floor(Math.random() * 30 + 65),
        })
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const { totalCalories, activeCalories } = useMemo(
    () => ({
      totalCalories: calories.reduce((s, d) => s + d.calories, 0),
      activeCalories: calories.reduce((s, d) => s + d.active, 0),
    }),
    [calories],
  )

  const currentBpm = heart.at(-1)?.bpm ?? 72

  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatsCard label="ACTIVE CALORIES" value={activeCalories} unit="KCAL" subtitle="TARGET: 500 KCAL" />
        <StatsCard label="TOTAL CALORIES" value={totalCalories} unit="KCAL" subtitle="BASAL + ACTIVE" />
        <StatsCard
          label="WEEKLY STEPS"
          value={(totalSteps / 1000).toFixed(1)}
          unit="K"
          subtitle={`AVG: ${Math.floor(totalSteps / 7).toLocaleString()}/DAY`}
        />
        <StatsCard label="ACTIVE MINUTES" value={127} unit="MIN" status="warning" subtitle="GOAL: 150 MIN" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
        <div className="md:col-span-2 border border-border bg-card p-4 box-glow">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-terminal-green glow-green uppercase tracking-wider">
                CALORIC EXPENDITURE
              </h3>
              <p className="text-xs text-muted-foreground">24-HOUR ANALYSIS</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-2 w-4 bg-terminal-green" />
                <span className="text-muted-foreground">TOTAL</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-4 bg-terminal-amber" />
                <span className="text-muted-foreground">ACTIVE</span>
              </div>
            </div>
          </div>
          <div className="h-48">
            {calories.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={calories}>
                <defs>
                  <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.75 0.22 145)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="oklch(0.75 0.22 145)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.85 0.2 85)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="oklch(0.85 0.2 85)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="hour"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "oklch(0.55 0.1 145)", fontSize: 10 }}
                  interval={5}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "oklch(0.55 0.1 145)", fontSize: 10 }}
                />
                <Area type="monotone" dataKey="calories" stroke="oklch(0.75 0.22 145)" strokeWidth={2} fill="url(#colorCalories)" />
                <Area type="monotone" dataKey="active" stroke="oklch(0.85 0.2 85)" strokeWidth={2} fill="url(#colorActive)" />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="border border-border bg-card p-4 box-glow">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-terminal-red glow-red uppercase tracking-wider">
                CARDIAC MONITOR
              </h3>
              <p className="text-xs text-muted-foreground">REAL-TIME ECG</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-terminal-red glow-red tabular-nums">{currentBpm}</span>
              <span className="text-xs text-muted-foreground">BPM</span>
            </div>
          </div>
          <div className="h-32">
            {heart.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={heart}>
                <Line type="monotone" dataKey="bpm" stroke="oklch(0.6 0.25 25)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
