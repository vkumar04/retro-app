import type { Mood } from "@/lib/gerty-store"

export function GertyFace({ mood, isSpeaking }: { mood: Mood; isSpeaking: boolean }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 200 200"
        className="w-[78%] h-[78%]"
        style={{ color: "#000000" }}
        aria-label={`GERTY ${mood}`}
      >
        <Emoticon mood={mood} isSpeaking={isSpeaking} />
      </svg>
    </div>
  )
}

// Gerty's signature eyes are tall vertical ovals, not round dots.
const EYE_LEFT_X = 72
const EYE_RIGHT_X = 128
const EYE_Y = 88
const EYE_RX = 10
const EYE_RY = 18

function OvalEyes() {
  return (
    <>
      <ellipse cx={EYE_LEFT_X} cy={EYE_Y} rx={EYE_RX} ry={EYE_RY} fill="currentColor" />
      <ellipse cx={EYE_RIGHT_X} cy={EYE_Y} rx={EYE_RX} ry={EYE_RY} fill="currentColor" />
    </>
  )
}

function Emoticon({ mood, isSpeaking }: { mood: Mood; isSpeaking: boolean }) {
  const stroke = "currentColor"
  const strokeW = 7

  const speakingMouth = isSpeaking ? <SpeakingMouth /> : null

  switch (mood) {
    case "happy":
      // Single-stroke arc smile, like the film reference.
      return (
        <>
          <OvalEyes />
          {speakingMouth ?? (
            <path
              d="M 60 122 Q 100 164 140 122"
              fill="none"
              stroke={stroke}
              strokeWidth={strokeW}
              strokeLinecap="round"
            />
          )}
        </>
      )

    case "sad":
      return (
        <>
          <OvalEyes />
          <path
            d="M 56 152 Q 100 108 144 152"
            fill="none"
            stroke={stroke}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
          {/* teardrop from left eye */}
          <path d="M 64 108 Q 58 124 64 132 Q 70 124 64 108 Z" fill="currentColor">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; 0 14; 0 0"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </path>
        </>
      )

    case "thinking":
      return (
        <>
          <OvalEyes />
          <line
            x1={70}
            y1={142}
            x2={108}
            y2={142}
            stroke={stroke}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
          <g>
            <circle cx={120} cy={142} r={4} fill="currentColor">
              <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" begin="0s" repeatCount="indefinite" />
            </circle>
            <circle cx={132} cy={142} r={4} fill="currentColor">
              <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" begin="0.2s" repeatCount="indefinite" />
            </circle>
            <circle cx={144} cy={142} r={4} fill="currentColor">
              <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" begin="0.4s" repeatCount="indefinite" />
            </circle>
          </g>
        </>
      )

    case "confused":
      return (
        <>
          <OvalEyes />
          <line
            x1={66}
            y1={150}
            x2={140}
            y2={126}
            stroke={stroke}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
        </>
      )

    case "angry":
      return (
        <>
          <line x1={48} y1={56} x2={92} y2={74} stroke={stroke} strokeWidth={strokeW} strokeLinecap="round" />
          <line x1={152} y1={56} x2={108} y2={74} stroke={stroke} strokeWidth={strokeW} strokeLinecap="round" />
          <ellipse cx={EYE_LEFT_X} cy={98} rx={EYE_RX} ry={EYE_RY} fill="currentColor" />
          <ellipse cx={EYE_RIGHT_X} cy={98} rx={EYE_RX} ry={EYE_RY} fill="currentColor" />
          <path
            d="M 56 158 Q 100 116 144 158"
            fill="none"
            stroke={stroke}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
        </>
      )

    case "sleeping":
      return (
        <>
          <path
            d="M 58 88 Q 72 104 86 88"
            fill="none"
            stroke={stroke}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
          <path
            d="M 114 88 Q 128 104 142 88"
            fill="none"
            stroke={stroke}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
          <line
            x1={75}
            y1={142}
            x2={125}
            y2={142}
            stroke={stroke}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
          <text x={150} y={50} fontFamily="monospace" fontSize="22" fontWeight="bold" fill="currentColor">
            Z
            <animate attributeName="opacity" values="0;1;0" dur="2.4s" begin="0s" repeatCount="indefinite" />
          </text>
          <text x={166} y={34} fontFamily="monospace" fontSize="16" fontWeight="bold" fill="currentColor">
            z
            <animate attributeName="opacity" values="0;1;0" dur="2.4s" begin="0.8s" repeatCount="indefinite" />
          </text>
        </>
      )

    case "neutral":
    default:
      return (
        <>
          <OvalEyes />
          {speakingMouth ?? (
            <line
              x1={64}
              y1={142}
              x2={136}
              y2={142}
              stroke={stroke}
              strokeWidth={strokeW}
              strokeLinecap="round"
            />
          )}
        </>
      )
  }
}

function SpeakingMouth() {
  return (
    <ellipse cx={100} cy={142} rx={22} ry={10} fill="none" stroke="currentColor" strokeWidth={7} strokeLinecap="round">
      <animate attributeName="ry" values="4;14;6;12;4" dur="0.7s" repeatCount="indefinite" />
      <animate attributeName="rx" values="20;24;22;26;20" dur="0.7s" repeatCount="indefinite" />
    </ellipse>
  )
}
