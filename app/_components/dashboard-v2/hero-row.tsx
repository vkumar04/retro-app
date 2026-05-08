// Top hero strip — four equal-width key metrics. Designed to read from
// across a room on a 90" 4K display. Numbers are the focal point.
const METRICS: {
  label: string
  value: string
  unit?: string
  delta?: string
  tone: "green" | "amber" | "muted"
  /** Whether this metric should be visually dominant (the headline). */
  hero?: boolean
}[] = [
  {
    label: "TOTAL POUNDS LOST",
    value: "45",
    unit: "LBS",
    tone: "green",
    hero: true,
  },
  {
    label: "CURRENT WEIGHT",
    value: "320",
    unit: "LBS",
    delta: "-12.3%",
    tone: "green",
  },
  {
    label: "CURRENT FAT MASS",
    value: "180",
    unit: "LBS",
    delta: "-20.1%",
    tone: "green",
  },
  {
    label: "BODY FAT",
    value: "31.2",
    unit: "%",
    delta: "WAS 42%",
    tone: "amber",
  },
]

export function HeroRow() {
  return (
    <div className="grid grid-cols-4 gap-[1.6vh] font-mono">
      {METRICS.map((m) => (
        <Cell key={m.label} {...m} />
      ))}
    </div>
  )
}

function Cell({
  label,
  value,
  unit,
  delta,
  tone,
  hero,
}: {
  label: string
  value: string
  unit?: string
  delta?: string
  tone: "green" | "amber" | "muted"
  hero?: boolean
}) {
  const valueClass =
    tone === "amber"
      ? "text-terminal-amber glow-amber"
      : tone === "muted"
        ? "text-foreground"
        : "text-terminal-green glow-green"
  const deltaClass = tone === "amber" ? "text-terminal-green" : "text-terminal-amber"

  return (
    <div
      className={`relative h-full border border-border bg-card p-[1.6vh] flex flex-col justify-between overflow-hidden ${
        hero ? "ring-1 ring-terminal-green/40" : ""
      }`}
    >
      {hero && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,128,0.07),transparent_70%)] pointer-events-none" />
      )}
      <div className="flex items-baseline justify-between">
        <span className="text-muted-foreground text-[1.5vh] tracking-[0.3em]">
          {label}
        </span>
        {delta && (
          <span className={`text-[1.5vh] ${deltaClass}`}>{delta}</span>
        )}
      </div>
      <div className="flex items-baseline gap-[1vh] relative">
        <span
          className={`font-bold leading-none tabular-nums ${valueClass}`}
          style={{ fontSize: hero ? "11vh" : "7vh" }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-muted-foreground text-[2.4vh] tracking-wider">
            {unit}
          </span>
        )}
        {hero && (
          <span className="ml-auto text-foreground text-[2vh] tracking-[0.4em] glow-green pb-[1vh]">
            LOST
          </span>
        )}
      </div>
    </div>
  )
}
