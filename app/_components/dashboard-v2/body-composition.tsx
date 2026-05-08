// DEXA-style body composition card with anatomically detailed SVG silhouette.
//
// Color convention follows the standard DEXA report look:
//   - bone / lean mass:    white skeleton drawn on top
//   - muscle / soft tissue:  orange/red body fill
//   - subcutaneous fat:    yellow gradient hugging the contour
//   - visceral fat:        bright saturated yellow in the abdomen
export function BodyComposition() {
  const total = 56 + 124 + 140
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
        <div className="relative flex items-center justify-center">
          <DexaSilhouette />
        </div>

        <div className="flex flex-col justify-center gap-[1.4vh] text-[1.8vh]">
          <Callout
            color="bg-yellow-300"
            label="VISCERAL FAT"
            value="56 LBS"
            note="(yellow)"
          />
          <Callout
            color="bg-orange-400"
            label="SUBCUTANEOUS FAT"
            value="124 LBS"
            note="(orange)"
          />
          <Callout color="bg-foreground" label="LEAN MASS" value="140 LBS" note="(white)" />
          <div className="mt-[0.6vh] pt-[1vh] border-t border-border text-muted-foreground text-[1.5vh] flex justify-between tracking-[0.3em]">
            <span>TOTAL</span>
            <span className="text-terminal-green tabular-nums glow-green">{total} LBS</span>
          </div>
          <div className="text-muted-foreground text-[1.2vh] tracking-[0.2em] flex justify-between">
            <span>FAT %</span>
            <span className="text-terminal-amber">31.2%</span>
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
    <svg
      viewBox="0 0 220 480"
      className="h-full w-auto max-h-[44vh]"
      aria-label="DEXA body composition scan"
    >
      <defs>
        {/* Subcutaneous orange halo — slightly larger silhouette */}
        <linearGradient id="dexaSubcutaneous" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        {/* Yellow body fill — dominant tissue color */}
        <linearGradient id="dexaYellow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
        {/* Visceral fat — saturated bright yellow in abdomen */}
        <radialGradient id="dexaVisceral" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
          <stop offset="60%" stopColor="#fde047" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer subcutaneous fat layer (orange) — slightly enlarged contour */}
      <BodyShape fill="url(#dexaSubcutaneous)" expand={4} />

      {/* Inner body fill (yellow) */}
      <BodyShape fill="url(#dexaYellow)" />

      {/* Visceral fat concentration in the abdomen */}
      <ellipse cx="110" cy="220" rx="50" ry="36" fill="url(#dexaVisceral)" />

      {/* Faint white skeleton showing through */}
      <Skeleton />

      {/* Subtle outer contour for definition */}
      <BodyShape
        fill="none"
        stroke="rgba(0,0,0,0.3)"
        strokeWidth="0.8"
        expand={4}
      />

      {/* Left-side FAT bracket annotation, matching reference */}
      <g stroke="#fde047" strokeWidth="1" fill="none">
        <line x1="14" y1="160" x2="14" y2="296" />
        <line x1="14" y1="160" x2="34" y2="160" />
        <line x1="14" y1="296" x2="34" y2="296" />
        <line x1="14" y1="228" x2="6" y2="228" />
      </g>
      <text
        x="0"
        y="222"
        fontSize="9"
        fill="#fde047"
        fontFamily="monospace"
        textAnchor="start"
      >
        FAT
      </text>
      <text
        x="0"
        y="234"
        fontSize="7"
        fill="#fde047"
        fontFamily="monospace"
        opacity="0.85"
      >
        180 LBS
      </text>
    </svg>
  )
}

// Anatomically-proportioned standing humanoid silhouette.
// `expand` enlarges the shape outward by ~n units (used to simulate skin
// vs. tissue layers).
function BodyShape({
  fill,
  stroke,
  strokeWidth,
  opacity = 1,
  expand = 0,
}: {
  fill: string
  stroke?: string
  strokeWidth?: string | number
  opacity?: number
  expand?: number
}) {
  const e = expand
  // Single combined path — head + torso + arms + legs (front view, arms at sides).
  // Widened to depict a heavier subject: broader torso/midsection, thicker
  // limbs, fuller hips and thighs. Head left at standard size for proportion.
  const d = `
    M 110 ${22 - e}
    C ${86 - e} ${22 - e}, ${74 - e} ${42 - e}, ${74 - e} ${62 - e}
    C ${74 - e} ${78 - e}, ${86 - e} ${92 - e}, ${98 - e} ${96 - e}
    L ${92 - e} ${108 - e}
    L ${72 - e} ${118 - e}
    L ${60 - e} ${130 - e}
    L ${48 - e} ${146 - e}
    L ${38 - e} ${172 - e}
    L ${30 - e} ${204 - e}
    L ${24 - e} ${236 - e}
    L ${22 - e} ${268 - e}
    L ${30 - e} ${276 - e}
    L ${42 - e} ${262 - e}
    L ${52 - e} ${214 - e}
    L ${60 - e} ${178 - e}
    L ${64 - e} ${180 - e}
    L ${58 - e} ${238 - e}
    L ${56 - e} ${278 - e}
    L ${66 - e} ${302 - e}
    L ${74 - e} ${340 - e}
    L ${74 - e} ${380 - e}
    L ${82 - e} ${430 - e}
    L ${80 - e} ${462 - e}
    L ${90 - e} ${472 - e}
    L 106 ${472 - e}
    L 106 ${342 - e}
    L 114 ${342 - e}
    L 114 ${472 - e}
    L ${130 + e} ${472 - e}
    L ${140 + e} ${462 - e}
    L ${138 + e} ${430 - e}
    L ${146 + e} ${380 - e}
    L ${146 + e} ${340 - e}
    L ${154 + e} ${302 - e}
    L ${164 + e} ${278 - e}
    L ${162 + e} ${238 - e}
    L ${156 + e} ${180 - e}
    L ${160 + e} ${178 - e}
    L ${168 + e} ${214 - e}
    L ${178 + e} ${262 - e}
    L ${190 + e} ${276 - e}
    L ${198 + e} ${268 - e}
    L ${196 + e} ${236 - e}
    L ${190 + e} ${204 - e}
    L ${182 + e} ${172 - e}
    L ${172 + e} ${146 - e}
    L ${160 + e} ${130 - e}
    L ${148 + e} ${118 - e}
    L ${128 + e} ${108 - e}
    L ${122 + e} ${96 - e}
    C ${134 + e} ${92 - e}, ${146 + e} ${78 - e}, ${146 + e} ${62 - e}
    C ${146 + e} ${42 - e}, ${134 + e} ${22 - e}, 110 ${22 - e}
    Z
  `
  return <path d={d} fill={fill} stroke={stroke} strokeWidth={strokeWidth} opacity={opacity} />
}

// White skeleton drawn over the tissue layer — faint, like in the reference.
function Skeleton() {
  const bone = "rgba(255,255,255,0.85)"
  const stroke = bone
  return (
    <g
      fill={bone}
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.55"
    >
      {/* Cranium */}
      <ellipse cx="110" cy="48" rx="20" ry="24" fill={bone} stroke="none" />
      {/* Mandible */}
      <path d="M 96 70 Q 110 82 124 70 L 122 76 Q 110 84 98 76 Z" fill={bone} stroke="none" />
      {/* Cervical spine */}
      <line x1="110" y1="74" x2="110" y2="100" strokeWidth="3" />
      {/* Clavicles */}
      <path d="M 86 102 Q 110 96 134 102" strokeWidth="2.5" fill="none" />
      {/* Sternum */}
      <line x1="110" y1="110" x2="110" y2="180" strokeWidth="2.2" />
      {/* Ribcage — 6 pairs of ribs as curves */}
      {Array.from({ length: 6 }).map((_, i) => {
        const y = 116 + i * 12
        const w = 30 + i * 1.5
        return (
          <g key={i}>
            <path
              d={`M 110 ${y} Q ${110 - w} ${y + 4} ${110 - w * 0.7} ${y + 14}`}
              fill="none"
              strokeWidth="1.8"
            />
            <path
              d={`M 110 ${y} Q ${110 + w} ${y + 4} ${110 + w * 0.7} ${y + 14}`}
              fill="none"
              strokeWidth="1.8"
            />
          </g>
        )
      })}
      {/* Lumbar spine */}
      <line x1="110" y1="190" x2="110" y2="240" strokeWidth="3" />
      {/* Pelvis — iliac wings + sacrum */}
      <path
        d="M 80 250 Q 110 270 140 250 L 138 274 Q 122 290 110 290 Q 98 290 82 274 Z"
        fill={bone}
        stroke="none"
      />
      {/* Femurs */}
      <line x1="96" y1="296" x2="92" y2="376" strokeWidth="3.5" />
      <line x1="124" y1="296" x2="128" y2="376" strokeWidth="3.5" />
      {/* Patellae */}
      <circle cx="92" cy="380" r="3" fill={bone} stroke="none" />
      <circle cx="128" cy="380" r="3" fill={bone} stroke="none" />
      {/* Tibia + Fibula */}
      <line x1="92" y1="386" x2="92" y2="458" strokeWidth="3" />
      <line x1="86" y1="386" x2="86" y2="456" strokeWidth="1.5" />
      <line x1="128" y1="386" x2="128" y2="458" strokeWidth="3" />
      <line x1="134" y1="386" x2="134" y2="456" strokeWidth="1.5" />
      {/* Feet */}
      <path d="M 84 462 L 100 462 L 102 470 L 82 470 Z" fill={bone} stroke="none" />
      <path d="M 120 462 L 136 462 L 138 470 L 118 470 Z" fill={bone} stroke="none" />
      {/* Humerus */}
      <line x1="78" y1="118" x2="68" y2="200" strokeWidth="3" />
      <line x1="142" y1="118" x2="152" y2="200" strokeWidth="3" />
      {/* Radius + Ulna */}
      <line x1="68" y1="206" x2="60" y2="270" strokeWidth="2.2" />
      <line x1="72" y1="206" x2="64" y2="270" strokeWidth="1.6" />
      <line x1="152" y1="206" x2="160" y2="270" strokeWidth="2.2" />
      <line x1="148" y1="206" x2="156" y2="270" strokeWidth="1.6" />
      {/* Hands — small clusters */}
      <ellipse cx="60" cy="278" rx="5" ry="8" fill={bone} stroke="none" />
      <ellipse cx="160" cy="278" rx="5" ry="8" fill={bone} stroke="none" />
    </g>
  )
}
