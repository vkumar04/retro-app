"use client"

import { useEffect, useRef, useState } from "react"
import { useGertyActions, useGertyStore } from "@/lib/gerty-store"

export function CommunicationTerminal({
  isSpeaking,
  onSpeak,
}: {
  isSpeaking: boolean
  onSpeak: (text: string) => void | Promise<void>
}) {
  const messages = useGertyStore((s) => s.messages)
  const customResponses = useGertyStore((s) => s.customResponses)
  const mood = useGertyStore((s) => s.mood)
  const systemStatus = useGertyStore((s) => s.systemStatus)
  const { addMessage, setMood } = useGertyActions()

  const [input, setInput] = useState("")
  const [now, setNow] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const update = () =>
      setNow(new Date().toLocaleTimeString("en-US", { hour12: false }))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const disabled = isSpeaking || mood === "thinking" || systemStatus === "offline"

  const send = async () => {
    const userMessage = input.trim()
    if (!userMessage || systemStatus === "offline") return
    setInput("")
    addMessage({ role: "user", text: userMessage })
    setMood("thinking")
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const response =
      customResponses[Math.floor(Math.random() * customResponses.length)] ?? ""
    if (response) {
      addMessage({ role: "gerty", text: response })
      void onSpeak(response)
    }
  }

  return (
    <div className="mt-6 border border-primary/30 bg-muted/5">
      <div className="border-b border-primary/30 p-3 flex items-center justify-between">
        <span className="text-xs text-primary">COMMUNICATION TERMINAL</span>
        <span
          className={`text-xs tabular-nums ${isSpeaking ? "text-accent animate-pulse" : "text-muted-foreground"}`}
        >
          {isSpeaking ? "[ GERTY SPEAKING ]" : now}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[300px] border-b lg:border-b-0 lg:border-r border-primary/20">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
              NO MESSAGES IN LOG
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.timestamp}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 ${
                    message.role === "user"
                      ? "bg-primary/20 border border-primary/30 text-primary"
                      : "bg-muted/20 border border-muted-foreground/30 text-foreground"
                  }`}
                >
                  <div className="text-[10px] text-muted-foreground mb-1">
                    {message.role === "user" ? "USER" : "GERTY"}
                  </div>
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="lg:w-[350px] p-4 flex flex-col gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">CHAT AS USER</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    void send()
                  }
                }}
                placeholder="ENTER MESSAGE..."
                disabled={disabled}
                className="flex-1 bg-background border border-primary/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary disabled:opacity-50"
              />
              <button
                onClick={send}
                disabled={disabled || !input.trim()}
                className="px-4 py-2 border border-primary bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                SEND
              </button>
            </div>
          </div>

          <div className="text-[10px] text-muted-foreground/60 border-t border-primary/20 pt-3">
            Send messages as a user to test GERTY responses. Use the Direct Message field above
            to make GERTY speak specific text.
          </div>
        </div>
      </div>
    </div>
  )
}
