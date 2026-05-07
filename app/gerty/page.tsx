"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { GertyFace } from "@/app/_components/gerty/gerty-face"
import { useGertyActions, useGertyStore, type Mood } from "@/lib/gerty-store"

const MOOD_CYCLE: Mood[] = ["happy", "neutral", "sad", "confused", "thinking"]
const IDLE_MOODS: Mood[] = ["neutral", "happy"]

export default function GertyPage() {
  const mood = useGertyStore((s) => s.mood)
  const brightness = useGertyStore((s) => s.brightness)
  const voiceSpeed = useGertyStore((s) => s.voiceSpeed)
  const voiceId = useGertyStore((s) => s.voiceId)
  const systemStatus = useGertyStore((s) => s.systemStatus)
  const messages = useGertyStore((s) => s.messages)
  const showScanlines = useGertyStore((s) => s.showScanlines)
  const idleAnimation = useGertyStore((s) => s.idleAnimation)
  const { setMood } = useGertyActions()

  const [isSpeaking, setIsSpeaking] = useState(false)
  const [apiKeyMissing, setApiKeyMissing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [audioUnlocked, setAudioUnlocked] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const lastSpokenRef = useRef<number | null>(null)

  // iOS Safari requires an AudioContext.resume() inside a user gesture before
  // any audio can play. Web Audio is more reliable than <audio>.play() on
  // mobile Safari, and once the context is running we can stream TTS through
  // a BufferSource without further gesture requirements.
  const unlockAudio = useCallback(async () => {
    if (audioUnlocked) return
    try {
      if (!audioCtxRef.current) {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        audioCtxRef.current = new Ctx()
      }
      const ctx = audioCtxRef.current
      if (ctx.state === "suspended") await ctx.resume()
      // Play a 1-sample silent buffer to confirm the context is hot.
      const buffer = ctx.createBuffer(1, 1, 22050)
      const src = ctx.createBufferSource()
      src.buffer = buffer
      src.connect(ctx.destination)
      src.start(0)
      setAudioUnlocked(true)
    } catch (err) {
      console.error("[gerty] audio unlock failed", err)
      // mark unlocked anyway so the overlay clears; user can retry
      setAudioUnlocked(true)
    }
  }, [audioUnlocked])

  const speak = useCallback(
    async (text: string) => {
      const ctx = audioCtxRef.current
      if (!ctx) return
      setIsSpeaking(true)
      setMood("happy")
      try {
        const res = await fetch("/api/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voiceId, speed: voiceSpeed }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          if (typeof err.error === "string" && err.error.includes("not configured")) {
            setApiKeyMissing(true)
          }
          throw new Error(err.error || "Speech synthesis failed")
        }
        const arrayBuffer = await res.arrayBuffer()
        // Some browsers (Safari) detach the buffer during decode — copy first.
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0))

        // Stop anything currently playing so messages don't pile up.
        if (currentSourceRef.current) {
          try {
            currentSourceRef.current.stop()
          } catch {
            // already stopped
          }
        }

        const source = ctx.createBufferSource()
        source.buffer = audioBuffer
        source.connect(ctx.destination)
        source.onended = () => {
          if (currentSourceRef.current === source) currentSourceRef.current = null
          setIsSpeaking(false)
          setMood("neutral")
        }
        currentSourceRef.current = source
        source.start(0)
      } catch (error) {
        console.error("Speech error:", error)
        setIsSpeaking(false)
        setMood("sad")
        setTimeout(() => setMood("neutral"), 2000)
      }
    },
    [voiceId, voiceSpeed, setMood],
  )

  // Speak each new GERTY message exactly once — but only after the user has
  // interacted with the page, otherwise the browser silently rejects play().
  useEffect(() => {
    const last = messages.at(-1)
    if (!last || last.role !== "gerty") return
    if (lastSpokenRef.current === last.timestamp) return
    if (!audioUnlocked) return
    lastSpokenRef.current = last.timestamp
    void speak(last.text)
  }, [messages, speak, audioUnlocked])

  // When audio first unlocks, speak the most recent gerty message so the user
  // hears something immediately rather than having to wait for the next one.
  useEffect(() => {
    if (!audioUnlocked) return
    const last = messages.at(-1)
    if (!last || last.role !== "gerty") return
    if (lastSpokenRef.current === last.timestamp) return
    lastSpokenRef.current = last.timestamp
    void speak(last.text)
    // Intentionally only run when audioUnlocked flips; subsequent messages are
    // handled by the effect above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUnlocked])

  useEffect(() => {
    if (!idleAnimation || isSpeaking || mood === "thinking") return
    const id = setInterval(() => {
      if (Math.random() > 0.9) {
        setMood(IDLE_MOODS[Math.floor(Math.random() * IDLE_MOODS.length)])
      }
    }, 5000)
    return () => clearInterval(id)
  }, [idleAnimation, isSpeaking, mood, setMood])

  const handleFaceClick = () => {
    if (systemStatus === "offline") return
    void unlockAudio()
    const i = MOOD_CYCLE.indexOf(mood)
    setMood(MOOD_CYCLE[(i + 1) % MOOD_CYCLE.length])
  }

  if (systemStatus === "offline") {
    return (
      <div
        className="min-h-screen font-mono flex items-center justify-center"
        style={{ backgroundColor: GERTY_BLUE, color: GERTY_YELLOW }}
      >
        <div className="text-center space-y-4">
          <div className="text-6xl">[ OFFLINE ]</div>
          <p>GERTY SYSTEM IS CURRENTLY UNAVAILABLE</p>
          <Link href="/admin" className="underline text-sm">
            GO TO ADMIN PANEL
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen font-mono relative overflow-hidden"
      style={{ filter: `brightness(${brightness}%)`, backgroundColor: GERTY_BLUE, color: GERTY_YELLOW }}
    >
      {!audioUnlocked && (
        <button
          type="button"
          onClick={() => void unlockAudio()}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center font-mono"
          style={{ backgroundColor: "rgba(0,0,0,0.65)", color: GERTY_YELLOW }}
        >
          <div className="text-2xl tracking-[0.5em] mb-2">TAP TO ENABLE</div>
          <div className="text-xs tracking-[0.3em] opacity-70">GERTY VOICE</div>
        </button>
      )}

      <main className="min-h-screen flex items-center justify-center">
        <div
          className="relative cursor-pointer w-screen h-screen flex items-center justify-center"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleFaceClick}
        >
          {/* Thin black ring around the round LCD — matches Gerty's head */}
          <div
            className="rounded-full bg-black flex items-center justify-center transition-all duration-300 shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
            style={{
              width: "min(96vw, 96vh)",
              height: "min(96vw, 96vh)",
              padding: "min(1.2vw, 1.2vh)",
            }}
          >
            {/* The round LCD screen */}
            <div
              className="w-full h-full rounded-full flex items-center justify-center relative overflow-hidden shadow-[inset_0_0_0_2px_rgba(0,0,0,0.6)]"
              style={{ backgroundColor: GERTY_YELLOW }}
            >
              <GertyFace mood={mood} isSpeaking={isSpeaking} />
            </div>
          </div>
        </div>
      </main>

    </div>
  )
}

const GERTY_BLUE = "#3F8FB0"
const GERTY_SCREEN_BLUE = "#5BA8C8"
const GERTY_YELLOW = "#FFD500"
