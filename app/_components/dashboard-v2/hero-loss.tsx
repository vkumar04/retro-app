export function HeroLoss({ lbsLost = 45 }: { lbsLost?: number }) {
  return (
    <div className="h-full overflow-hidden border border-border bg-card font-mono p-[1.6vh] flex flex-col items-center justify-between text-center relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,128,0.08),transparent_70%)] pointer-events-none" />

      <h2 className="text-terminal-green text-[2vh] tracking-[0.3em] font-bold relative glow-green">
        TOTAL POUNDS LOST
      </h2>

      <div className="flex flex-col items-center justify-center relative">
        <div
          className="text-terminal-green font-bold leading-none glow-green"
          style={{ fontSize: "14vh" }}
        >
          {lbsLost}
        </div>
        <div className="text-foreground text-[2.4vh] tracking-[0.4em] mt-[0.6vh] glow-green">
          LBS LOST
        </div>
      </div>

      <div className="text-muted-foreground text-[1.3vh] tracking-[0.2em] flex items-center gap-2">
        <span className="size-1.5 rounded-full bg-terminal-green pulse-glow" />
        DEXA + SCALE DATA
      </div>
    </div>
  )
}
