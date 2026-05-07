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
  const audioRef = useRef<HTMLAudioElement>(null)
  const lastSpokenRef = useRef<number | null>(null)

  const speak = useCallback(
    async (text: string) => {
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
        const audioUrl = URL.createObjectURL(await res.blob())
        const audio = audioRef.current
        if (!audio) return
        audio.src = audioUrl
        audio.onended = () => {
          setIsSpeaking(false)
          setMood("neutral")
          URL.revokeObjectURL(audioUrl)
        }
        await audio.play()
      } catch (error) {
        console.error("Speech error:", error)
        setIsSpeaking(false)
        setMood("sad")
        setTimeout(() => setMood("neutral"), 2000)
      }
    },
    [voiceId, voiceSpeed, setMood],
  )

  // Speak each new GERTY message exactly once.
  useEffect(() => {
    const last = messages.at(-1)
    if (!last || last.role !== "gerty") return
    if (lastSpokenRef.current === last.timestamp) return
    lastSpokenRef.current = last.timestamp
    void speak(last.text)
  }, [messages, speak])

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

      <audio ref={audioRef} className="hidden" />
    </div>
  )
}

const GERTY_BLUE = "#3F8FB0"
const GERTY_SCREEN_BLUE = "#5BA8C8"
const GERTY_YELLOW = "#FFD500"
