import { CaloriesHero } from "../_components/macro/calories-hero"
import { DayStrip } from "../_components/macro/day-strip"
import { MacroMiniCard } from "../_components/macro/macro-mini-card"
import { RecentLog } from "../_components/macro/recent-log"

// /macro — pure macronutrient view, structurally inspired by Cal AI:
//   1. Day strip (week at a glance)
//   2. Big calories-left hero card with ring
//   3. Three macro mini-cards (protein/carbs/fat) each with small ring + icon
//   4. Recently logged feed
// Restyled CRT/terminal — kept the layout pattern, ditched the white-iOS look.
export default function MacroDashboard() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-background crt-curve font-mono flex flex-col">
      {/* Terminal command-line strip */}
      <div className="px-[1.6vh] pt-[1vh] pb-[0.6vh] text-[1.3vh] text-muted-foreground tracking-[0.15em] border-b border-border/40 flex items-center justify-between">
        <span>
          <span className="text-terminal-green">root@biomonitor</span>
          <span>:</span>
          <span className="text-terminal-cyan">~/macros</span>
          <span>$ </span>
          <span className="text-foreground">cal-ai --kiosk --4k</span>
          <span className="cursor-blink ml-1">█</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-terminal-green pulse-glow" />
          NUTRITION FEED ACTIVE
        </span>
      </div>

      <main className="flex-1 min-h-0 grid grid-rows-[auto_auto_auto_minmax(0,1fr)] gap-[1.6vh] p-[1.6vh]">
        <DayStrip />

        <div className="h-[28vh]">
          <CaloriesHero />
        </div>

        <div className="grid grid-cols-3 gap-[1.6vh] h-[28vh]">
          <MacroMiniCard macro="protein" />
          <MacroMiniCard macro="carbs" />
          <MacroMiniCard macro="fat" />
        </div>

        <RecentLog />
      </main>

      <div className="px-[1.6vh] py-[1vh] border-t border-border/40 flex items-center justify-between text-[1.2vh] text-muted-foreground tracking-[0.15em]">
        <span className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-terminal-green pulse-glow" />
          LIVE FOOD-LOG · {new Date().toISOString().slice(0, 10)}
        </span>
        <span>BIOMONITOR v2.4 · NUTRITION MODULE · ENCRYPTED</span>
      </div>
    </div>
  )
}
