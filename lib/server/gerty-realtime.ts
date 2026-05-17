import { getRedis, getJSON, setJSON } from "@/lib/server/redis"
import { defaultGertyState, type GertyState } from "@/lib/gerty-defaults"

const STATE_KEY = "gerty:state"
const VERSION_KEY = "gerty:version"

export async function getServerState(): Promise<GertyState> {
  const stored = await getJSON<Partial<GertyState>>(STATE_KEY)
  // Merge with defaults so older state objects missing newer fields
  // (e.g., todos was added later) don't return undefined for them.
  const merged = { ...defaultGertyState, ...(stored ?? {}) }
  merged.homeStats = { ...defaultGertyState.homeStats, ...(stored?.homeStats ?? {}) }
  // The four daily tasks are fixed — always the same set in the same
  // order. We only preserve the `done` flag from stored state by ID so
  // toggles persist across reloads.
  const storedById = new Map((merged.todos ?? []).map((t) => [t.id, t]))
  merged.todos = defaultGertyState.todos.map((t) => ({
    ...t,
    done: storedById.get(t.id)?.done ?? false,
  }))
  return merged
}

export async function setServerState(next: GertyState): Promise<GertyState> {
  // Last-write-wins; acceptable for human-driven controls.
  await setJSON(STATE_KEY, next)
  await getRedis().incr(VERSION_KEY)
  return next
}

export async function getVersion(): Promise<number> {
  const raw = await getRedis().get(VERSION_KEY)
  return raw ? Number(raw) : 0
}
