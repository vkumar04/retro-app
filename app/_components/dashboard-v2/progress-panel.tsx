const PATIENT = {
  startWeightLbs: 365,
  currentWeightLbs: 320,
  targetWeightLbs: 200,
  bodyFatStart: 42,
  bodyFatNow: 31,
  bodyFatGoal: 18,
  daysActive: 218,
  streakDays: 42,
}

export function ProgressPanel() {
  const lostLbs = PATIENT.startWeightLbs - PATIENT.currentWeightLbs
  const goalLbs = PATIENT.startWeightLbs - PATIENT.targetWeightLbs
  const goalProgress = Math.min(1, lostLbs / goalLbs)
  const fatProgress =
    (PATIENT.bodyFatStart - PATIENT.bodyFatNow) /
    (PATIENT.bodyFatStart - PATIENT.bodyFatGoal)

  return (
    <div className="border border-border bg-card font-mono p-[1.4vh] flex flex-col gap-[1vh]">
      <div className="flex items-center justify-between border-b border-border pb-[0.6vh]">
        <h4 className="text-terminal-amber text-[1.7vh] tracking-[0.3em] font-bold glow-amber">
          PROGRESS
        </h4>
        <span className="text-muted-foreground text-[1.2vh] tracking-[0.3em]">
          [ ACTIVE ]
        </span>
      </div>

      <ProgressRow
        label="GOAL PROGRESS"
        metric={`${lostLbs} / ${goalLbs} LBS`}
        progress={goalProgress}
        tone="green"
      />
      <ProgressRow
        label="BODY FAT"
        metric={`${PATIENT.bodyFatStart}% → ${PATIENT.bodyFatNow}%`}
        progress={fatProgress}
        tone="amber"
      />

      <div className="grid grid-cols-2 gap-[0.8vh] mt-[0.4vh]">
        <MiniStat label="DAYS ACTIVE" value={PATIENT.daysActive.toString()} />
        <MiniStat label="STREAK" value={PATIENT.streakDays.toString()} unit="D" />
      </div>
    </div>
  )
}

function ProgressRow({
  label,
  metric,
  progress,
  tone,
}: {
  label: string
  metric: string
  progress: number
  tone: "green" | "amber"
}) {
  const fill = tone === "green" ? "bg-terminal-green" : "bg-terminal-amber"
  return (
    <div>
      <div className="flex justify-between items-baseline">
        <span className="text-muted-foreground text-[1.3vh] tracking-[0.2em]">
          {label}
        </span>
        <span
          className={`text-[1.5vh] tabular-nums ${
            tone === "amber" ? "text-terminal-amber" : "text-terminal-green"
          }`}
        >
          {metric}
        </span>
      </div>
      <div className="mt-[0.4vh] h-[0.9vh] border border-border bg-background overflow-hidden">
        <div
          className={`h-full ${fill}`}
          style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
        />
      </div>
    </div>
  )
}

function MiniStat({
  label,
  value,
  unit,
}: {
  label: string
  value: string
  unit?: string
}) {
  return (
    <div className="border border-border p-[0.7vh]">
      <div className="text-muted-foreground text-[1.1vh] tracking-[0.3em]">
        {label}
      </div>
      <div className="text-terminal-green text-[2vh] font-bold mt-0.5 glow-green">
        {value}
        {unit && (
          <span className="text-muted-foreground text-[1.2vh] ml-1 tracking-wider">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}
