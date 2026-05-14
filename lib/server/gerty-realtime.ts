import { Redis } from "@upstash/redis"
import { defaultGertyState, type GertyState } from "@/lib/gerty-defaults"

// Upstash Redis (REST). Provisioned via Vercel Marketplace; env vars KV_* are
// auto-injected by the integration.
const redis = Redis.fromEnv()

const STATE_KEY = "gerty:state"
const VERSION_KEY = "gerty:version"

export async function getServerState(): Promise<GertyState> {
  const stored = await redis.get<Partial<GertyState>>(STATE_KEY)
  // Merge with defaults so older state objects missing newer fields
  // (e.g., todos was added later) don't return undefined for them.
  const merged = { ...defaultGertyState, ...(stored ?? {}) }
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
  await redis.set(STATE_KEY, next)
  await redis.incr(VERSION_KEY)
  return next
}

export async function getVersion(): Promise<number> {
  return (await redis.get<number>(VERSION_KEY)) ?? 0
}
