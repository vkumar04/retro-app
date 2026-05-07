type Status = "normal" | "warning" | "critical"

const statusColor: Record<Status, string> = {
  normal: "text-terminal-green glow-green",
  warning: "text-terminal-amber glow-amber",
  critical: "text-terminal-red glow-red",
}

export function StatsCard({
  label,
  value,
  unit,
  status = "normal",
  subtitle,
}: {
  label: string
  value: string | number
  unit: string
  status?: Status
  subtitle?: string
}) {
  return (
    <div className="border border-border bg-card p-4 box-glow">
      <div className="flex items-start justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <div className="h-2 w-2 rounded-full bg-terminal-green animate-pulse" />
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={`text-3xl font-bold ${statusColor[status]}`}>
          {value}
        </span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  )
}
