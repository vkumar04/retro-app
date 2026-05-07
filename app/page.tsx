import { LiveStats } from "./_components/dashboard/live-stats"
import { SleepAnalysis } from "./_components/dashboard/sleep-analysis"
import { ActivityLog, BodyStats, SystemStatus } from "./_components/dashboard/static-panels"
import { TerminalHeader } from "./_components/dashboard/terminal-header"
import { WeeklySteps } from "./_components/dashboard/weekly-steps"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background crt-curve">
      <TerminalHeader />

      <main className="p-4 md:p-6">
        <div className="mb-6 font-mono text-xs text-muted-foreground">
          <span className="text-terminal-green">root@biomonitor</span>
          <span className="text-muted-foreground">:</span>
          <span className="text-terminal-cyan">~/health</span>
          <span className="text-muted-foreground">$ </span>
          <span className="text-foreground">display --dashboard --user=OPERATOR_01</span>
          <span className="cursor-blink ml-1">█</span>
        </div>

        <LiveStats />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <WeeklySteps />
          <SleepAnalysis />
          <BodyStats />
          <SystemStatus />
          <div className="md:col-span-2">
            <ActivityLog />
          </div>
        </div>

        <footer className="mt-6 border-t border-border pt-4 text-center text-xs text-muted-foreground">
          <p>BIOMONITOR SYSTEM v2.4.1 // WEYLAND-YUTANI CORPORATION // ALL RIGHTS RESERVED 2179</p>
          <p className="mt-1">
            <span className="text-terminal-green">●</span> ENCRYPTED CONNECTION ESTABLISHED //
            <span className="text-terminal-amber"> DATA INTEGRITY: 100%</span>
          </p>
        </footer>
      </main>
    </div>
  )
}
