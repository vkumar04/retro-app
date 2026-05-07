"use client"

import { useState } from "react"
import { useGertyActions, useGertyStore } from "@/lib/gerty-store"
import { VOICE_OPTIONS } from "./voice-options"

export function VoicePanel({
  onPreview,
}: {
  onPreview: (text: string) => void | Promise<void>
}) {
  const voiceId = useGertyStore((s) => s.voiceId)
  const voiceSpeed = useGertyStore((s) => s.voiceSpeed)
  const messageCount = useGertyStore((s) => s.messages.length)
  const { setVoiceId, setVoiceSpeed, sendGertyMessage, clearMessages } = useGertyActions()

  const [directMessage, setDirectMessage] = useState("")

  const sendDirect = () => {
    const text = directMessage.trim()
    if (!text) return
    sendGertyMessage(text)
    void onPreview(text)
    setDirectMessage("")
  }

  return (
    <div className="border border-primary/30 bg-muted/5">
      <div className="border-b border-primary/30 p-3">
        <span className="text-xs text-primary">VOICE CONFIGURATION</span>
      </div>
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">VOICE MODEL</label>
          <select
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            className="w-full bg-background border border-primary/30 px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
          >
            {VOICE_OPTIONS.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-xs text-muted-foreground">SPEECH SPEED</label>
            <span className="text-xs text-primary">{voiceSpeed.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={1.5}
            step={0.05}
            value={voiceSpeed}
            onChange={(e) => setVoiceSpeed(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <div className="border-t border-primary/20 pt-4">
          <label className="text-xs text-muted-foreground">DIRECT MESSAGE TO GERTY</label>
          <p className="text-[10px] text-muted-foreground/70 mt-1 mb-2">
            Send a message as GERTY to the chat
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={directMessage}
              onChange={(e) => setDirectMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendDirect()}
              placeholder="Enter message..."
              className="flex-1 bg-background border border-primary/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
            <button
              onClick={sendDirect}
              disabled={!directMessage.trim()}
              className="px-4 py-2 border border-primary bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
              SEND
            </button>
          </div>
        </div>

        <div className="border-t border-primary/20 pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground">MESSAGE LOG</span>
            <span className="text-xs text-primary">{messageCount} messages</span>
          </div>
          <button
            onClick={clearMessages}
            className="w-full py-2 text-xs border border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            CLEAR ALL MESSAGES
          </button>
        </div>
      </div>
    </div>
  )
}
