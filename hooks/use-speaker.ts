"use client"

import { useCallback, useRef, useState } from "react"

export interface SpeakOptions {
  voiceId?: string
  speed?: number
}

export function useSpeaker() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speak = useCallback(async (text: string, options: SpeakOptions = {}) => {
    setIsSpeaking(true)
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, ...options }),
      })
      if (!res.ok) throw new Error("Speech synthesis failed")
      const url = URL.createObjectURL(await res.blob())
      const audio = audioRef.current
      if (!audio) {
        URL.revokeObjectURL(url)
        setIsSpeaking(false)
        return
      }
      audio.src = url
      audio.onended = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(url)
      }
      await audio.play()
    } catch (error) {
      console.error("Speech error:", error)
      setIsSpeaking(false)
    }
  }, [])

  return { audioRef, isSpeaking, speak }
}
