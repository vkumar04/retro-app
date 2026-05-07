import { defaultGertyState, type GertyState } from "@/lib/gerty-defaults"

type Listener = (state: GertyState) => void

// Module-singleton on globalThis so Next.js dev hot reload preserves state.
// This is in-memory only — fine for a single-instance dev server or single
// long-running container. Multi-instance Vercel deployments would need shared
// storage (Redis / KV) instead.
const g = globalThis as unknown as {
  __gerty?: { state: GertyState; listeners: Set<Listener> }
}
if (!g.__gerty) {
  g.__gerty = { state: defaultGertyState, listeners: new Set() }
}

export function getServerState(): GertyState {
  return g.__gerty!.state
}

export function setServerState(next: GertyState): GertyState {
  g.__gerty!.state = next
  for (const listener of g.__gerty!.listeners) {
    try {
      listener(next)
    } catch {
      // ignore broken listener
    }
  }
  return next
}

export function subscribe(listener: Listener): () => void {
  g.__gerty!.listeners.add(listener)
  return () => {
    g.__gerty!.listeners.delete(listener)
  }
}
