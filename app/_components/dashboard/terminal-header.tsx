"use client"

import { useEffect, useState } from "react"

export function TerminalHeader() {
  const [time, setTime] = useState<string>("")

  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString("en-US", { hour12: false }))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="border-b border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-terminal-green pulse-glow" />
            <span className="text-terminal-green glow-green text-lg font-bold tracking-wider">
              BIOMONITOR v2.4
            </span>
          </div>
          <span className="text-muted-foreground text-xs">// WEYLAND-YUTANI CORP</span>
        </div>
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">STATUS:</span>
            <span className="text-terminal-green">ONLINE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">UPLINK:</span>
            <span className="text-terminal-green">ACTIVE</span>
          </div>
          <div className="text-terminal-amber glow-amber tabular-nums min-w-[8ch]">
            {time}
          </div>
        </div>
      </div>
    </header>
  )
}
