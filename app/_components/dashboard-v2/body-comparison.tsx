export function BodyComparison() {
  return (
    <div className="h-full border border-border bg-card font-mono p-[2vh] flex flex-col">
      <div className="flex items-center justify-between border-b border-border pb-[1vh]">
        <h2 className="text-terminal-green text-[2.2vh] tracking-[0.4em] font-bold glow-green">
          BODY PROFILE
        </h2>
        <span className="text-muted-foreground text-[1.4vh] tracking-wider">
          12 MO Δ
        </span>
      </div>

      <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-[1vh] mt-[1.5vh]">
        <Profile label="START" silhouette="heavy" />
        <div className="text-terminal-amber text-[5vh] glow-amber">›</div>
        <Profile label="CURRENT" silhouette="lean" highlight />
      </div>

      <div className="mt-[1.5vh] space-y-[1vh]">
        <ProgressRow label="FAT LOSS GOAL" progress={0.62} tone="green" />
        <ProgressRow label="MUSCLE GAIN" progress={0.38} tone="amber" />
      </div>
    </div>
  )
}

function Profile({
  label,
  silhouette,
  highlight,
}: {
  label: string
  silhouette: "heavy" | "lean"
  highlight?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-[0.6vh]">
      <BodySilhouette variant={silhouette} highlight={highlight} />
      <div
        className={`text-[1.6vh] tracking-[0.4em] font-bold ${
          highlight ? "text-terminal-green glow-green" : "text-muted-foreground"
        }`}
      >
        {label}
      </div>
    </div>
  )
}

function BodySilhouette({
  variant,
  highlight,
}: {
  variant: "heavy" | "lean"
  highlight?: boolean
}) {
  const bodyPath =
    variant === "heavy"
      ? "M100 8 a16 16 0 1 1 0 0.1 z M84 38 L116 38 L132 56 L150 130 L138 145 L134 90 L130 165 L116 175 L116 280 L106 295 L94 295 L84 280 L84 175 L70 165 L66 90 L62 145 L50 130 L68 56 Z"
      : "M100 8 a14 14 0 1 1 0 0.1 z M88 36 L112 36 L124 54 L140 130 L132 142 L128 88 L122 162 L112 172 L112 285 L104 298 L96 298 L88 285 L88 172 L78 162 L72 88 L68 142 L60 130 L76 54 Z"

  return (
    <svg viewBox="0 0 200 320" className="h-[22vh] w-auto">
      <path
        d={bodyPath}
        fill={highlight ? "oklch(0.75 0.22 245 / 0.85)" : "oklch(0.55 0.1 245 / 0.5)"}
        stroke={highlight ? "oklch(0.85 0.18 245)" : "oklch(0.45 0.08 245)"}
        strokeWidth="1.5"
      />
    </svg>
  )
}

function ProgressRow({
  label,
  progress,
  tone,
}: {
  label: string
  progress: number
  tone: "green" | "amber"
}) {
  const fill = tone === "green" ? "bg-terminal-green" : "bg-terminal-amber"
  const text = tone === "green" ? "text-terminal-green" : "text-terminal-amber"
  return (
    <div>
      <div className="flex justify-between items-baseline">
        <span className="text-muted-foreground text-[1.6vh] tracking-[0.2em]">
          {label}
        </span>
        <span className={`text-[1.7vh] tabular-nums ${text}`}>
          {Math.round(progress * 100)}%
        </span>
      </div>
      <div className="mt-[0.5vh] h-[1.1vh] border border-border bg-background">
        <div
          className={`h-full ${fill}`}
          style={{ width: `${Math.min(100, progress * 100)}%` }}
        />
      </div>
    </div>
  )
}
