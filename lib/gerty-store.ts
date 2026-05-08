"use client"

import { useSyncExternalStore } from "react"
import type { GertyAction } from "./gerty-actions"
import {
  defaultGertyState,
  type GertyMessage,
  type GertyState,
  type Mood,
  type SystemStatus,
  type Todo,
} from "./gerty-defaults"

export type { GertyMessage, GertyState, Mood, SystemStatus, Todo }

let state: GertyState = defaultGertyState
let connected = false
let eventSource: EventSource | null = null
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((l) => l())
}

function setLocalState(next: GertyState) {
  state = next
  notify()
}

async function dispatch(action: GertyAction) {
  // Optimistic local apply via SSE round-trip is the source of truth, so we
  // only fire the request and let the broadcast update everyone (including us).
  try {
    const res = await fetch("/api/gerty/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(action),
    })
    if (!res.ok) return
    const next = (await res.json()) as GertyState
    setLocalState(next)
  } catch (err) {
    console.error("[gerty] dispatch failed", err)
  }
}

function connect() {
  if (connected || typeof window === "undefined") return
  connected = true

  fetch("/api/gerty/state", { cache: "no-store" })
    .then((r) => r.json())
    .then((s: GertyState) => setLocalState(s))
    .catch(() => {
      // ignore — SSE will deliver state once connected
    })

  const open = () => {
    eventSource = new EventSource("/api/gerty/stream")
    eventSource.onmessage = (e) => {
      try {
        const next = JSON.parse(e.data) as GertyState
        setLocalState(next)
      } catch {
        // ignore malformed
      }
    }
    eventSource.onerror = () => {
      // EventSource auto-reconnects; if it gives up, schedule a manual retry.
      if (eventSource && eventSource.readyState === EventSource.CLOSED) {
        eventSource = null
        setTimeout(open, 1000)
      }
    }
  }
  open()
}

function subscribe(listener: () => void) {
  connect()
  listeners.add(listener)
  listener()
  return () => {
    listeners.delete(listener)
  }
}

export const gertyStore = {
  getState: () => state,
  setMood: (mood: Mood) => dispatch({ type: "setMood", mood }),
  setBrightness: (brightness: number) => dispatch({ type: "setBrightness", brightness }),
  setVoiceSpeed: (voiceSpeed: number) => dispatch({ type: "setVoiceSpeed", voiceSpeed }),
  setVoiceId: (voiceId: string) => dispatch({ type: "setVoiceId", voiceId }),
  setSystemStatus: (status: SystemStatus) => dispatch({ type: "setSystemStatus", status }),
  addMessage: (message: Omit<GertyMessage, "timestamp">) =>
    dispatch({ type: "addMessage", message }),
  clearMessages: () => dispatch({ type: "clearMessages" }),
  addCustomResponse: (response: string) => dispatch({ type: "addCustomResponse", response }),
  removeCustomResponse: (index: number) => dispatch({ type: "removeCustomResponse", index }),
  setPrimaryColor: (color: string) => dispatch({ type: "setPrimaryColor", color }),
  setShowScanlines: (value: boolean) => dispatch({ type: "setShowScanlines", value }),
  setIdleAnimation: (value: boolean) => dispatch({ type: "setIdleAnimation", value }),
  reset: () => dispatch({ type: "reset" }),
  sendGertyMessage: (text: string) => dispatch({ type: "sendGertyMessage", text }),
  setSkeletonWalking: (value: boolean) => dispatch({ type: "setSkeletonWalking", value }),
  addTodo: (text: string) => dispatch({ type: "addTodo", text }),
  toggleTodo: (id: string) => dispatch({ type: "toggleTodo", id }),
  removeTodo: (id: string) => dispatch({ type: "removeTodo", id }),
  clearCompletedTodos: () => dispatch({ type: "clearCompletedTodos" }),
}

export function useGertyStore<T>(selector: (state: GertyState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(defaultGertyState),
  )
}

export function useGertyActions() {
  return gertyStore
}
