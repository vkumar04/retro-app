"use client"

import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts"
import { COLORS, CONSUMED, LEFT, MACRO_GOALS, STREAK } from "./macro-data"

// Large hero card: "Calories left" big number on the left, ring on the right.
// Cribbed structurally from the Cal AI screenshot, restyled CRT/terminal.
export function CaloriesHero() {
  const consumed = CONSUMED.calories
  const goal = MACRO_GOALS.calories
  const left = LEFT.calories
  const pct = Math.min(100, Math.round((consumed / goal) * 100))
  const color = COLORS.calories

  return (
    <div
      className="h-full border bg-card font-mono flex overflow-hidden"
      style={{ borderColor: color }}
    >
      {/* Left: copy block */}
      <div className="flex-1 flex flex-col justify-center px-[3vh] py-[2vh] gap-[1vh]">
        <div
          className="font-bold tabular-nums leading-none"
          style={{
            fontSize: "11vh",
            color,
            textShadow: `0 0 30px ${color}`,
          }}
        >
          {Math.abs(left).toLocaleString()}
        </div>
        <div className="flex items-center gap-[1.2vh]">
          <span
            className="text-[2vh] tracking-[0.4em]"
            style={{ color }}
          >
            {left >= 0 ? "KCAL LEFT" : "KCAL OVER"}
          </span>
          <span
            className="px-[1vh] py-[0.4vh] border text-[1.4vh] tracking-[0.3em] flex items-center gap-[0.6vh]"
            style={{
              borderColor: color,
              color,
              background: `${color}1a`,
            }}
          >
            <Flame color={color} size={14} />
            <span className="tabular-nums">{STREAK}D STREAK</span>
          </span>
        </div>
        <div className="text-muted-foreground text-[1.4vh] tracking-[0.3em] tabular-nums mt-[0.4vh]">
          {consumed.toLocaleString()} / {goal.toLocaleString()} CONSUMED · {pct}% OF GOAL
        </div>
      </div>

      {/* Right: ring */}
      <div className="relative w-[34vh] shrink-0 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            data={[{ value: pct }]}
            startAngle={90}
            endAngle={-270}
            innerRadius="78%"
            outerRadius="100%"
            barSize={18}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <RadialBar
              dataKey="value"
              cornerRadius={12}
              fill={color}
              background={{ fill: "oklch(0.18 0.04 145 / 0.6)" }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Flame color={color} size={64} glow />
        </div>
      </div>
    </div>
  )
}

function Flame({
  color,
  size,
  glow,
}: {
  color: string
  size: number
  glow?: boolean
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={glow ? { filter: `drop-shadow(0 0 16px ${color})` } : undefined}
    >
      <path
        d="M12 2c0 4-4 5-4 9a4 4 0 0 0 8 0c0-1-.5-2-1-2.5 0 1.5-1 2-1.5 2 0-3 1-5-1.5-8.5zM7 14c-1 1.5-1 3-1 4a6 6 0 0 0 12 0c0-1-.2-2-.7-3-.5 2-2 3-3.3 3 0-2 .5-3-.5-4-1 2-3 2-4 3-1 .5-2 0-2.5-.5C7 16 7 15 7 14z"
        fill={color}
      />
    </svg>
  )
}
