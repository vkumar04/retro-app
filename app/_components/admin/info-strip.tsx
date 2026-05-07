"use client"

import { useGertyStore } from "@/lib/gerty-store"

export function InfoStrip() {
  const mood = useGertyStore((s) => s.mood)
  const systemStatus = useGertyStore((s) => s.systemStatus)
  const messageCount = useGertyStore((s) => s.messages.length)
  const responseCount = useGertyStore((s) => s.customResponses.length)

  const statusColor =
    systemStatus === "online"
      ? "text-primary glow-green"
      : systemStatus === "maintenance"
        ? "text-accent"
        : "text-destructive"

  return (
    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      <Cell label="SYSTEM" value={systemStatus.toUpperCase()} valueClassName={statusColor} />
      <Cell label="MOOD" value={mood.toUpperCase()} />
      <Cell label="MESSAGES" value={messageCount} />
      <Cell label="RESPONSES" value={responseCount} />
    </div>
  )
}

function Cell({
  label,
  value,
  valueClassName = "text-primary",
}: {
  label: string
  value: string | number
  valueClassName?: string
}) {
  return (
    <div className="border border-primary/30 p-4 text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-lg mt-1 ${valueClassName}`}>{value}</div>
    </div>
  )
}
