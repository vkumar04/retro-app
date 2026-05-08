export function CurrentStats() {
  return (
    <div className="h-full flex flex-col gap-[1.5vh] font-mono">
      <StatCard label="CURRENT WEIGHT" value="320" unit="LBS" delta="-12.3%" />
      <StatCard label="CURRENT FAT MASS" value="180" unit="LBS" delta="-20.1%" />
    </div>
  )
}

function StatCard({
  label,
  value,
  unit,
  delta,
}: {
  label: string
  value: string
  unit: string
  delta: string
}) {
  return (
    <div className="flex-1 border border-border bg-card p-[2vh] flex flex-col justify-center">
      <h3 className="text-terminal-green text-[1.9vh] tracking-[0.4em] font-bold glow-green">
        {label}
      </h3>
      <div className="mt-[1vh] flex items-baseline gap-[1.2vh]">
        <span
          className="text-foreground font-bold leading-none glow-green"
          style={{ fontSize: "9vh" }}
        >
          {value}
        </span>
        <span className="text-muted-foreground text-[2.6vh] tracking-wider">
          {unit}
        </span>
        <span className="ml-auto text-terminal-amber text-[2.4vh] glow-amber">
          {delta}
        </span>
      </div>
    </div>
  )
}
