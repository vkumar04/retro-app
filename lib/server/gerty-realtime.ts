import { Redis } from "@upstash/redis"
import { defaultGertyState, type GertyState } from "@/lib/gerty-defaults"

// Upstash Redis (REST). Provisioned via Vercel Marketplace; env vars KV_* are
// auto-injected by the integration.
const redis = Redis.fromEnv()

const STATE_KEY = "gerty:state"
const VERSION_KEY = "gerty:version"

export async function getServerState(): Promise<GertyState> {
  const stored = await redis.get<GertyState>(STATE_KEY)
  return stored ?? defaultGertyState
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
