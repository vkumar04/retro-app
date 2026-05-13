"use client"

import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts"
import { COLORS, CONSUMED, LEFT, MACRO_GOALS, type MacroKey } from "./macro-data"

const LABEL: Record<Exclude<MacroKey, "calories">, string> = {
  protein: "PROTEIN",
  carbs: "CARBS",
  fat: "FAT",
}

export function MacroMiniCard({
  macro,
}: {
  macro: Exclude<MacroKey, "calories">
}) {
  const consumed = CONSUMED[macro]
  const goal = MACRO_GOALS[macro]
  const left = LEFT[macro]
  const pct = Math.min(100, Math.round((consumed / goal) * 100))
  const color = COLORS[macro]

  return (
    <div
      className="h-full border bg-card font-mono p-[2vh] flex flex-col justify-between"
      style={{ borderColor: color }}
    >
      <div className="flex flex-col gap-[0.4vh]">
        <div className="flex items-baseline gap-[0.8vh]">
          <span
            className="text-[5.5vh] font-bold tabular-nums leading-none"
            style={{ color, textShadow: `0 0 18px ${color}` }}
          >
            {Math.abs(left)}
          </span>
          <span className="text-muted-foreground text-[2vh]">G</span>
        </div>
        <span
          className="text-[1.6vh] tracking-[0.4em]"
          style={{ color }}
        >
          {LABEL[macro]} {left >= 0 ? "LEFT" : "OVER"}
        </span>
        <span className="text-muted-foreground text-[1.3vh] tracking-[0.3em] tabular-nums">
          {consumed} / {goal} G
        </span>
      </div>

      <div className="relative h-[14vh] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            data={[{ value: pct }]}
            startAngle={90}
            endAngle={-270}
            innerRadius="72%"
            outerRadius="100%"
            barSize={10}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <RadialBar
              dataKey="value"
              cornerRadius={6}
              fill={color}
              background={{ fill: "oklch(0.18 0.04 145 / 0.6)" }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <MacroIcon macro={macro} color={color} />
        </div>
      </div>
    </div>
  )
}

function MacroIcon({
  macro,
  color,
}: {
  macro: "protein" | "carbs" | "fat"
  color: string
}) {
  const size = 48
  const style = { filter: `drop-shadow(0 0 8px ${color})` }
  if (macro === "protein") {
    // chicken leg
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
        <path d="M14 4a5 5 0 0 0-4.6 6.9l-5.7 5.7a2 2 0 1 0 2.8 2.8l5.7-5.7A5 5 0 1 0 14 4zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
      </svg>
    )
  }
  if (macro === "carbs") {
    // wheat stalk
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
        <path d="M12 2v20M8 5l4 2 4-2M6 9l6 3 6-3M5 13l7 3.5 7-3.5M6 17l6 3 6-3" stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
    )
  }
  // fat — droplet
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
      <path d="M12 2.5c4 5 7 8.5 7 12.5a7 7 0 0 1-14 0c0-4 3-7.5 7-12.5z" />
    </svg>
  )
}
