// Server components — pure presentation, static data.

const SYSTEMS = [
  { name: "CARDIO_SENSOR", status: "ONLINE", value: 98 },
  { name: "MOTION_TRACKER", status: "ONLINE", value: 100 },
  { name: "THERMAL_SCAN", status: "ONLINE", value: 95 },
  { name: "BIO_LINK", status: "ACTIVE", value: 87 },
  { name: "DATA_SYNC", status: "SYNCED", value: 100 },
] as const

const LOGS = [
  { time: "14:32:05", event: "HIGH_INTENSITY_DETECTED", type: "info" },
  { time: "14:28:17", event: "HEART_RATE_ELEVATED", type: "warning" },
  { time: "14:15:42", event: "WORKOUT_SESSION_START", type: "info" },
  { time: "13:45:00", event: "HYDRATION_REMINDER", type: "alert" },
  { time: "12:30:22", event: "CALORIE_GOAL_50%", type: "info" },
  { time: "11:00:00", event: "SYSTEM_SYNC_COMPLETE", type: "info" },
] as const

const LOG_COLOR: Record<(typeof LOGS)[number]["type"], string> = {
  info: "text-terminal-green",
  warning: "text-terminal-amber",
  alert: "text-terminal-red",
}

export function SystemStatus() {
  return (
    <div className="border border-border bg-card p-4 box-glow">
      <h3 className="mb-4 text-sm font-bold text-terminal-green glow-green uppercase tracking-wider">
        SYSTEM DIAGNOSTICS
      </h3>
      <div className="space-y-3">
        {SYSTEMS.map((system) => (
          <div key={system.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-terminal-green" />
              <span className="text-muted-foreground">{system.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-1 w-24 bg-secondary overflow-hidden">
                <div className="h-full bg-terminal-green" style={{ width: `${system.value}%` }} />
              </div>
              <span className="w-12 text-right text-terminal-green">{system.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ActivityLog() {
  return (
    <div className="border border-border bg-card p-4 box-glow">
      <h3 className="mb-4 text-sm font-bold text-terminal-green glow-green uppercase tracking-wider">
        ACTIVITY LOG
      </h3>
      <div className="space-y-2 font-mono text-xs">
        {LOGS.map((log) => (
          <div key={log.time} className="flex items-center gap-3">
            <span className="text-muted-foreground">[{log.time}]</span>
            <span className={LOG_COLOR[log.type]}>{log.event}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1 text-terminal-green">
        <span className="text-xs">{"> "}_</span>
        <span className="cursor-blink">█</span>
      </div>
    </div>
  )
}

export function BodyStats() {
  return (
    <div className="border border-border bg-card p-4 box-glow">
      <h3 className="mb-4 text-sm font-bold text-terminal-cyan uppercase tracking-wider">
        BIOMETRIC DATA
      </h3>
      <div className="grid grid-cols-2 gap-4 text-xs">
        <Stat label="BODY TEMP" value="36.8°C" />
        <Stat label="BLOOD O2" value="98%" />
        <Stat label="HYDRATION" value="72%" tone="amber" />
        <Stat label="STRESS LVL" value="LOW" />
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  tone = "green",
}: {
  label: string
  value: string
  tone?: "green" | "amber"
}) {
  return (
    <div>
      <span className="text-muted-foreground">{label}</span>
      <p className={`text-lg ${tone === "amber" ? "text-terminal-amber" : "text-terminal-green"}`}>
        {value}
      </p>
    </div>
  )
}
