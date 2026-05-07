"use client"

import { useState } from "react"
import { useGertyActions, useGertyStore } from "@/lib/gerty-store"

export function ResponseLibrary() {
  const customResponses = useGertyStore((s) => s.customResponses)
  const { addCustomResponse, removeCustomResponse } = useGertyActions()
  const [draft, setDraft] = useState("")

  const submit = () => {
    const text = draft.trim()
    if (!text) return
    addCustomResponse(text)
    setDraft("")
  }

  return (
    <div className="border border-primary/30 bg-muted/5">
      <div className="border-b border-primary/30 p-3 flex justify-between items-center">
        <span className="text-xs text-primary">RESPONSE LIBRARY</span>
        <span className="text-xs text-muted-foreground">
          {customResponses.length} responses
        </span>
      </div>
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">ADD NEW RESPONSE</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Enter response..."
              className="flex-1 bg-background border border-primary/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
            <button
              onClick={submit}
              disabled={!draft.trim()}
              className="px-4 py-2 border border-primary bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
              ADD
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {customResponses.map((response, index) => (
            <div
              key={`${index}-${response}`}
              className="flex items-start gap-2 p-2 border border-primary/20 bg-muted/10 group"
            >
              <span className="text-xs text-muted-foreground w-6">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="flex-1 text-xs text-foreground">{response}</p>
              <button
                onClick={() => removeCustomResponse(index)}
                className="text-destructive/50 hover:text-destructive text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Delete response ${index + 1}`}
              >
                [X]
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
