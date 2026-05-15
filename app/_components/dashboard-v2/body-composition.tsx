"use client"

import Image from "next/image"
import { useGertyStore } from "@/lib/gerty-store"

export function BodyComposition() {
  const s = useGertyStore((st) => st.homeStats)
  const visceral = s.visceralFatLbs
  const subcutaneous = s.subcutaneousFatLbs
  const lean = s.leanMassLbs
  const total = visceral + subcutaneous + lean
  return (
    <div className="h-full border border-border bg-card font-mono p-[1.6vh] relative overflow-hidden">
      <BracketCorners />

      <div className="flex items-baseline justify-between border-b border-border pb-[0.8vh]">
        <h2 className="text-terminal-green text-[2vh] tracking-[0.3em] font-bold glow-green">
          BODY COMPOSITION
        </h2>
        <span className="text-muted-foreground text-[1.3vh] tracking-[0.3em]">
          DEXA · 2026-04-30
        </span>
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-[1.6vh] mt-[1.2vh] h-[calc(100%-5vh)]">
        <div className="relative flex items-center justify-center bg-black">
          <DexaSilhouette />
        </div>

        <div className="flex flex-col justify-center gap-[1.4vh] text-[1.8vh]">
          <Callout
            color="bg-yellow-300"
            label="VISCERAL FAT"
            value={`${visceral} LBS`}
            note="(yellow)"
          />
          <Callout
            color="bg-orange-400"
            label="SUBCUTANEOUS FAT"
            value={`${subcutaneous} LBS`}
            note="(orange)"
          />
          <Callout color="bg-foreground" label="LEAN MASS" value={`${lean} LBS`} note="(white)" />
          <div className="mt-[0.6vh] pt-[1vh] border-t border-border text-muted-foreground text-[1.5vh] flex justify-between tracking-[0.3em]">
            <span>TOTAL</span>
            <span className="text-terminal-green tabular-nums glow-green">{total} LBS</span>
          </div>
          <div className="text-muted-foreground text-[1.2vh] tracking-[0.2em] flex justify-between">
            <span>FAT %</span>
            <span className="text-terminal-amber">{s.bodyFatPct}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Callout({
  color,
  label,
  value,
  note,
}: {
  color: string
  label: string
  value: string
  note: string
}) {
  return (
    <div className="flex items-center gap-[1.2vh]">
      <div className={`size-[1.2vh] ${color}`} />
      <div className="flex-1">
        <div className="text-foreground text-[1.7vh] font-bold tracking-[0.2em]">
          {label}
        </div>
        <div className="text-muted-foreground text-[1.2vh] uppercase tracking-[0.3em]">
          {note}
        </div>
      </div>
      <div className="text-terminal-green text-[2vh] font-bold tabular-nums glow-green">
        {value}
      </div>
    </div>
  )
}

function BracketCorners() {
  const cls = "absolute size-[2vh] border-terminal-green pointer-events-none"
  return (
    <>
      <div className={`${cls} top-[0.6vh] left-[0.6vh] border-l-2 border-t-2`} />
      <div className={`${cls} top-[0.6vh] right-[0.6vh] border-r-2 border-t-2`} />
      <div className={`${cls} bottom-[0.6vh] left-[0.6vh] border-l-2 border-b-2`} />
      <div className={`${cls} bottom-[0.6vh] right-[0.6vh] border-r-2 border-b-2`} />
    </>
  )
}

function DexaSilhouette() {
  return (
    <Image
      src="/dexa-scan-v2.png"
      alt="DEXA body composition scan"
      width={108}
      height={346}
      priority
      className="h-full w-auto max-h-[44vh] object-contain"
    />
  )
}
