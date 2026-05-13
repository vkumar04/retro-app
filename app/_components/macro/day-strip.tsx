import { DAY_STRIP } from "./macro-data"

// Horizontal week strip. Past days = filled green circles (logged), today =
// highlighted ring, future = muted.
export function DayStrip() {
  return (
    <div className="flex items-center justify-between gap-[1vh] font-mono">
      {DAY_STRIP.map((d) => {
        const isToday = d.status === "today"
        const isPast = d.status === "past"
        return (
          <div
            key={`${d.label}-${d.date}`}
            className="flex-1 flex flex-col items-center gap-[0.6vh]"
          >
            <span
              className={`text-[1.4vh] tracking-[0.3em] ${
                isToday
                  ? "text-terminal-green glow-green"
                  : isPast
                    ? "text-muted-foreground"
                    : "text-muted-foreground/40"
              }`}
            >
              {d.label}
            </span>
            <div
              className={`size-[5vh] rounded-full border-2 flex items-center justify-center tabular-nums text-[2vh] font-bold ${
                isToday
                  ? "border-terminal-green bg-terminal-green/10 text-terminal-green glow-green box-glow"
                  : isPast
                    ? "border-terminal-green/70 bg-terminal-green/15 text-terminal-green"
                    : "border-border text-muted-foreground/40"
              }`}
            >
              {d.date}
            </div>
          </div>
        )
      })}
    </div>
  )
}
