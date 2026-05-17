import { tryGetRedis, getJSON } from "@/lib/server/redis"

export type AmaranDevice = {
  deviceId: string
  label: string
  switchState: "on" | "off"
}

type Snapshot = {
  ts: number
  devices: AmaranDevice[]
}

type Command =
  | { type: "toggle"; deviceId: string; reqId: string }
  | { type: "refresh"; reqId: string }

const CMD_LIST = "amaran:cmds"
const REPLY_PREFIX = "amaran:reply:"
const SNAPSHOT_KEY = "amaran:snapshot"
const SNAPSHOT_FRESH_MS = 30_000
const REPLY_POLL_INTERVAL_MS = 150
const REPLY_TIMEOUT_MS = 5_000

export function isAmaranConfigured(): boolean {
  return tryGetRedis() !== null
}

export type AmaranStatus = {
  configured: boolean
  online: boolean
  devices: AmaranDevice[]
  lastSeenMs: number | null
}

export async function getAmaranStatus(): Promise<AmaranStatus> {
  const redis = tryGetRedis()
  if (!redis) return { configured: false, online: false, devices: [], lastSeenMs: null }
  const snap = await getJSON<Snapshot>(SNAPSHOT_KEY)
  if (!snap) return { configured: true, online: false, devices: [], lastSeenMs: null }
  const lastSeenMs = Date.now() - snap.ts
  return {
    configured: true,
    online: lastSeenMs < SNAPSHOT_FRESH_MS,
    devices: snap.devices,
    lastSeenMs,
  }
}

async function enqueue(cmd: Command): Promise<unknown> {
  const redis = tryGetRedis()
  if (!redis) throw new Error("Amaran not configured")
  await redis.rpush(CMD_LIST, JSON.stringify(cmd))

  const replyKey = `${REPLY_PREFIX}${cmd.reqId}`
  const deadline = Date.now() + REPLY_TIMEOUT_MS
  while (Date.now() < deadline) {
    const reply = await getJSON<unknown>(replyKey)
    if (reply != null) {
      await redis.del(replyKey)
      return reply
    }
    await new Promise((r) => setTimeout(r, REPLY_POLL_INTERVAL_MS))
  }
  throw new Error("bridge timeout")
}

export async function toggleAmaranDevice(
  deviceId: string,
): Promise<{ deviceId: string; switchState: "on" | "off" }> {
  const reqId = crypto.randomUUID()
  const result = (await enqueue({ type: "toggle", deviceId, reqId })) as {
    deviceId?: string
    switchState?: "on" | "off"
    error?: string
  }
  if (result.error) throw new Error(result.error)
  if (!result.deviceId || !result.switchState) throw new Error("bad reply")
  return { deviceId: result.deviceId, switchState: result.switchState }
}

