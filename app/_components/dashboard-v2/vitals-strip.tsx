"use client"

import { useEffect, useState } from "react"

const INITIAL = [
  { label: "HEART RATE", value: 72, unit: "BPM", tone: "red" as const },
  { label: "BLOOD OX", value: 98, unit: "%", tone: "green" as const },
  { label: "STEPS TODAY", value: 8421, unit: "", tone: "green" as const },
  { label: "ACTIVE MIN", value: 127, unit: "MIN", tone: "amber" as const },
]

export function VitalsStrip() {
  const [vals, setVals] = useState(INITIAL)

  useEffect(() => {
    const id = setInterval(() => {
      setVals((prev) =>
        prev.map((v, i) =>
          i === 0
            ? { ...v, value: 65 + Math.floor(Math.random() * 20) }
            : i === 1
              ? { ...v, value: 96 + Math.floor(Math.random() * 4) }
              : v,
        ),
      )
    }, 1500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="h-full border border-border bg-card font-mono p-[1.4vh] flex flex-col">
      <div className="flex items-center justify-between border-b border-border pb-[0.6vh]">
        <h4 className="text-terminal-cyan text-[1.7vh] tracking-[0.3em] font-bold">
          LIVE VITALS
        </h4>
        <span className="text-muted-foreground text-[1.2vh] tracking-[0.3em] flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-terminal-green pulse-glow" />
          STREAMING
        </span>
      </div>

      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-[1vh] mt-[1vh] min-h-0">
        {vals.map((v) => (
          <div
            key={v.label}
            className="border border-border p-[1vh] flex flex-col justify-center"
          >
            <div className="text-muted-foreground text-[1.2vh] tracking-[0.3em]">
              {v.label}
            </div>
            <div className="mt-[0.3vh] flex items-baseline gap-2">
              <span
                className={`text-[3vh] font-bold tabular-nums leading-none ${
                  v.tone === "red"
                    ? "text-terminal-red glow-red"
                    : v.tone === "amber"
                      ? "text-terminal-amber glow-amber"
                      : "text-terminal-green glow-green"
                }`}
              >
                {v.value.toLocaleString()}
              </span>
              {v.unit && (
                <span className="text-muted-foreground text-[1.3vh] tracking-wider">
                  {v.unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
