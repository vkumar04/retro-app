import { COLORS, RECENT_LOG, calorieFor } from "./macro-data"

export function RecentLog() {
  return (
    <div className="h-full border border-border bg-card font-mono p-[1.6vh] flex flex-col overflow-hidden">
      <div className="flex items-baseline justify-between border-b border-border pb-[0.8vh] mb-[1vh]">
        <h2 className="text-terminal-green text-[2vh] tracking-[0.4em] font-bold glow-green">
          RECENTLY LOGGED
        </h2>
        <span className="text-muted-foreground text-[1.3vh] tracking-[0.3em]">
          {RECENT_LOG.length} ITEMS
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-[0.8vh] pr-1">
        {RECENT_LOG.map((m, i) => {
          const cal = calorieFor(m.protein, m.carbs, m.fat)
          return (
            <div
              key={`${m.time}-${i}`}
              className="border border-border p-[1vh] flex items-center gap-[1.6vh]"
            >
              <span className="text-terminal-amber text-[1.5vh] tabular-nums tracking-wider w-[6vh] shrink-0">
                {m.time}
              </span>
              <div className="flex-1 min-w-0 flex flex-col gap-[0.3vh]">
                <span className="text-foreground text-[1.6vh] tracking-[0.05em] truncate">
                  {m.name}
                </span>
                <div className="flex items-center gap-[1.4vh] text-[1.2vh] tabular-nums tracking-wider">
                  <span className="text-terminal-green flex items-center gap-1">
                    <Flame size={11} color="oklch(0.78 0.22 245)" />
                    {cal} KCAL
                  </span>
                  <span style={{ color: COLORS.protein }}>P {m.protein}G</span>
                  <span style={{ color: COLORS.carbs }}>C {m.carbs}G</span>
                  <span style={{ color: COLORS.fat }}>F {m.fat}G</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Flame({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2c0 4-4 5-4 9a4 4 0 0 0 8 0c0-1-.5-2-1-2.5 0 1.5-1 2-1.5 2 0-3 1-5-1.5-8.5z" />
    </svg>
  )
}
