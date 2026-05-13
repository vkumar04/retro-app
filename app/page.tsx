import { BodyComposition } from "./_components/dashboard-v2/body-composition"
import { CompositionTrend } from "./_components/dashboard-v2/composition-trend"
import { HeroRow } from "./_components/dashboard-v2/hero-row"
import { ProfileCard } from "./_components/dashboard-v2/profile-card"

// Single-screen fat-loss command center for a 90" 4K wall display.
//
// Hierarchy (top → bottom of focal weight):
//   1. The "45 LBS LOST" hero number in the top metrics row.
//   2. The DEXA composition silhouette (large central visual).
//   3. The 24-month composition trend chart.
//   4. Profile + progress + live vitals (full-height left panel).
export default function DashboardPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-background crt-curve font-mono flex flex-col">
      {/* Terminal command-line strip */}
      <div className="px-[1.6vh] pt-[1vh] pb-[0.6vh] text-[1.3vh] text-muted-foreground tracking-[0.15em] border-b border-border/40 flex items-center justify-between">
        <span>
          <span className="text-terminal-green">root@biomonitor</span>
          <span>:</span>
          <span className="text-terminal-cyan">~/health</span>
          <span>$ </span>
          <span className="text-foreground">
            display --dashboard --user=ADAM_RABY --4k
          </span>
          <span className="cursor-blink ml-1">█</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-terminal-green pulse-glow" />
          UPLINK ACTIVE
        </span>
      </div>

      <main className="flex-1 min-h-0 grid grid-cols-[26%_1fr] gap-[1.6vh] p-[1.6vh]">
        {/* Left: full-height patient panel (identity + progress + vitals) */}
        <ProfileCard />

        {/* Right: hero row on top, two big visualizations below */}
        <div className="grid grid-rows-[auto_minmax(0,1fr)] gap-[1.6vh] min-h-0">
          <HeroRow />
          <div className="grid grid-cols-[1fr_1.2fr] gap-[1.6vh] min-h-0">
            <BodyComposition />
            <CompositionTrend />
          </div>
        </div>
      </main>

      {/* Footer status bar */}
      <div className="px-[1.6vh] py-[1vh] border-t border-border/40 flex items-center justify-between text-[1.2vh] text-muted-foreground tracking-[0.15em]">
        <span className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-terminal-green pulse-glow" />
          LIVE COMPOSITE DATA · LATEST SYNC 2026-05-08
        </span>
        <span>BIOMONITOR v2.4 · WEYLAND-YUTANI CORP · ENCRYPTED</span>
      </div>
    </div>
  )
}
