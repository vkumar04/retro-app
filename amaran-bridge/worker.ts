// Redis-backed bridge worker. Native Redis (ioredis) BLPOP — blocks server-side
// for commands, so the worker uses ~0 requests while idle (vs ~345k/day from
// REST polling). Snapshot pushes every SNAPSHOT_INTERVAL_MS are the only
// scheduled writes.
//
//   cd amaran-bridge
//   npm install
//   npm start
//
// Requires KV_URL (or REDIS_URL) in ../.env.local — the Redis-protocol URL
// auto-provisioned by the Vercel <-> Upstash Marketplace integration.
//
import IORedis from "ioredis"
// @ts-expect-error - amaran-light-cli has no published types
import { LightController, discoverLocalWebSocket } from "amaran-light-cli"

const CMD_LIST = "amaran:cmds"
const REPLY_PREFIX = "amaran:reply:"
const SNAPSHOT_KEY = "amaran:snapshot"
const SNAPSHOT_TTL_SEC = 30
const REPLY_TTL_SEC = 60
const SNAPSHOT_INTERVAL_MS = 5_000
const BLOCK_TIMEOUT_SEC = 25
const CLIENT_ID = "retro-trs80-bridge"

type RawDevice = {
  node_id?: string
  device_name?: string
  name?: string
  id?: string
  [k: string]: unknown
}

type SleepResp = { sleep?: boolean } | undefined

type Snapshot = {
  ts: number
  devices: Array<{
    deviceId: string
    label: string
    switchState: "on" | "off"
  }>
}

type Command =
  | { type: "toggle"; deviceId: string; reqId: string }
  | { type: "refresh"; reqId: string }

const redisUrl = process.env.KV_URL ?? process.env.REDIS_URL
if (!redisUrl) {
  console.error("KV_URL or REDIS_URL must be set in ../.env.local")
  process.exit(1)
}

// One connection for BLPOP (blocking), one for writes.
const redisBlocking = new IORedis(redisUrl, { maxRetriesPerRequest: null })
const redis = new IORedis(redisUrl, { maxRetriesPerRequest: null })

const discovered = await discoverLocalWebSocket().catch(() => null)
const wsUrl = discovered?.url ?? "ws://localhost:60124"
console.log(`[bridge] amaran websocket: ${wsUrl}`)

let initialized = false
let controllerInitCallback: () => void = () => {}
const initPromise = new Promise<void>((resolve) => {
  const timer = setTimeout(() => {
    if (!initialized) {
      console.warn("[bridge] init timeout — proceeding anyway")
      initialized = true
      resolve()
    }
  }, 8_000)
  controllerInitCallback = () => {
    if (initialized) return
    initialized = true
    clearTimeout(timer)
    console.log("[bridge] controller initialized")
    resolve()
  }
})

const controller = new LightController(wsUrl, CLIENT_ID, () =>
  controllerInitCallback(),
)

function call<T>(
  fn: (cb: (ok: boolean, msg: string, data: T) => void) => void,
  timeoutMs = 5_000,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("amaran call timeout")), timeoutMs)
    fn((ok, msg, data) => {
      clearTimeout(timer)
      ok ? resolve(data) : reject(new Error(msg))
    })
  })
}

async function listDevices(): Promise<RawDevice[]> {
  const data = await call<RawDevice[] | { data?: RawDevice[] }>((cb) =>
    controller.getDeviceList(cb),
  )
  if (Array.isArray(data)) return data
  if (data && Array.isArray((data as { data?: RawDevice[] }).data))
    return (data as { data: RawDevice[] }).data
  return []
}

async function getSleep(nodeId: string): Promise<boolean | undefined> {
  try {
    const data = await call<SleepResp>((cb) =>
      controller.getLightSleepStatus(nodeId, cb),
    )
    if (data && typeof data === "object" && "sleep" in data) {
      return Boolean(data.sleep)
    }
    return undefined
  } catch (err) {
    console.warn(
      `[bridge] sleep status failed for ${nodeId}:`,
      err instanceof Error ? err.message : err,
    )
    return undefined
  }
}

let loggedFirstDeviceList = false
async function buildSnapshot(): Promise<Snapshot> {
  const devices = await listDevices()
  if (!loggedFirstDeviceList) {
    loggedFirstDeviceList = true
    console.log("[bridge] first device list:", JSON.stringify(devices, null, 2))
  }

  const states = await Promise.all(
    devices.map(async (d) => {
      const id = d.node_id ?? d.id
      if (!id) return undefined
      return await getSleep(id)
    }),
  )

  return {
    ts: Date.now(),
    devices: devices
      .map((d, i) => {
        const id = d.node_id ?? d.id
        if (!id) return null
        const sleep = states[i]
        return {
          deviceId: id,
          label: d.device_name ?? d.name ?? id,
          switchState: (sleep === false ? "on" : "off") as "on" | "off",
        }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null),
  }
}

let lastSnapshotJson = ""
async function pushSnapshot(): Promise<Snapshot | null> {
  try {
    const snap = await buildSnapshot()
    const json = JSON.stringify(snap.devices)
    // Skip the write when nothing changed except the timestamp. Snapshot TTL is
    // long enough that the previous SET is still alive; we just refresh it.
    if (json === lastSnapshotJson) {
      await redis.expire(SNAPSHOT_KEY, SNAPSHOT_TTL_SEC)
    } else {
      await redis.set(SNAPSHOT_KEY, JSON.stringify(snap), "EX", SNAPSHOT_TTL_SEC)
      lastSnapshotJson = json
      console.log(`[bridge] snapshot updated: ${snap.devices.length} device(s)`)
    }
    return snap
  } catch (err) {
    console.error("[bridge] snapshot error:", err)
    return null
  }
}

async function handleCommand(cmd: Command): Promise<unknown> {
  if (cmd.type === "refresh") {
    const snap = await pushSnapshot()
    return { ok: !!snap, snapshot: snap }
  }

  if (cmd.type === "toggle") {
    await call<unknown>((cb) => controller.toggleLight(cmd.deviceId, cb))
    await new Promise((r) => setTimeout(r, 300))
    const sleep = await getSleep(cmd.deviceId)
    const switchState: "on" | "off" = sleep === false ? "on" : "off"
    await pushSnapshot()
    return { deviceId: cmd.deviceId, switchState }
  }

  return { error: "unknown command" }
}

await initPromise

// Periodic snapshot pusher (timer, independent of command loop).
setInterval(() => {
  pushSnapshot().catch((err) => console.error("[bridge] periodic snapshot:", err))
}, SNAPSHOT_INTERVAL_MS)
await pushSnapshot() // initial

console.log("[bridge] worker started, BLPOP loop ready")

// Blocking command loop. BLPOP holds open one TCP connection and returns
// only when a command lands. Idle = zero requests.
for (;;) {
  let popped: [string, string] | null = null
  try {
    popped = await redisBlocking.blpop(CMD_LIST, BLOCK_TIMEOUT_SEC)
  } catch (err) {
    console.error("[bridge] blpop error, retrying in 2s:", err)
    await new Promise((r) => setTimeout(r, 2_000))
    continue
  }
  if (!popped) continue // timeout — keep blocking

  const [, raw] = popped
  let cmd: Command
  try {
    cmd = JSON.parse(raw) as Command
  } catch {
    console.error("[bridge] malformed cmd:", raw)
    continue
  }

  const startedAt = Date.now()
  try {
    const result = await handleCommand(cmd)
    await redis.set(
      `${REPLY_PREFIX}${cmd.reqId}`,
      JSON.stringify(result),
      "EX",
      REPLY_TTL_SEC,
    )
    console.log(
      `[bridge] ${cmd.type} ${"deviceId" in cmd ? cmd.deviceId : ""} -> ${
        Date.now() - startedAt
      }ms`,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown"
    await redis.set(
      `${REPLY_PREFIX}${cmd.reqId}`,
      JSON.stringify({ error: message }),
      "EX",
      REPLY_TTL_SEC,
    )
    console.error("[bridge] cmd error:", message)
  }
}
