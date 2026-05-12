// Redis-backed bridge worker. Connects outbound to Upstash and to the local
// amaran desktop WebSocket. No public port, no tunnel.
//
//   cd amaran-bridge
//   npm install
//   npm start
//
// Requires KV_REST_API_URL + KV_REST_API_TOKEN (auto-provisioned by the
// Vercel <-> Upstash Marketplace integration) in ../.env.local.
//
import { Redis } from "@upstash/redis"
// @ts-expect-error - amaran-light-cli has no published types
import { LightController, discoverLocalWebSocket } from "amaran-light-cli"

const CMD_LIST = "amaran:cmds"
const REPLY_PREFIX = "amaran:reply:"
const SNAPSHOT_KEY = "amaran:snapshot"
const SNAPSHOT_TTL_SEC = 30
const REPLY_TTL_SEC = 60
const POLL_INTERVAL_MS = 250
const SNAPSHOT_INTERVAL_MS = 5000
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

const redis = Redis.fromEnv()

const discovered = await discoverLocalWebSocket().catch(() => null)
const wsUrl = discovered?.url ?? "ws://localhost:60124"
console.log(`[bridge] amaran websocket: ${wsUrl}`)

let initialized = false
let controllerInitCallback: () => void = () => {}
const initPromise = new Promise<void>((resolve) => {
  // Failsafe: don't block forever if amaran has 0 devices (onInitialized may
  // not fire when there are no node configs to gather).
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
  // The handler unwraps parsedData.data, but some responses double-wrap.
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

async function pushSnapshot(): Promise<Snapshot | null> {
  try {
    const snap = await buildSnapshot()
    await redis.set(SNAPSHOT_KEY, snap, { ex: SNAPSHOT_TTL_SEC })
    console.log(`[bridge] snapshot: ${snap.devices.length} device(s)`)
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
    // Let the desktop app's mesh round-trip the state change before re-reading.
    await new Promise((r) => setTimeout(r, 300))
    const sleep = await getSleep(cmd.deviceId)
    const switchState: "on" | "off" = sleep === false ? "on" : "off"
    // Refresh full snapshot so the UI sees the new state on next /devices poll.
    await pushSnapshot()
    return { deviceId: cmd.deviceId, switchState }
  }

  return { error: "unknown command" }
}

// Wait for controller init before opening the polling loop.
await initPromise

let lastSnapshot = 0
async function tick() {
  if (Date.now() - lastSnapshot > SNAPSHOT_INTERVAL_MS) {
    await pushSnapshot()
    lastSnapshot = Date.now()
  }

  const raw = await redis.lpop<string | Command>(CMD_LIST)
  if (raw == null) return

  let cmd: Command
  try {
    cmd = typeof raw === "string" ? (JSON.parse(raw) as Command) : raw
  } catch {
    console.error("[bridge] dropped malformed command:", raw)
    return
  }

  const startedAt = Date.now()
  try {
    const result = await handleCommand(cmd)
    await redis.set(`${REPLY_PREFIX}${cmd.reqId}`, result, {
      ex: REPLY_TTL_SEC,
    })
    console.log(
      `[bridge] ${cmd.type} ${"deviceId" in cmd ? cmd.deviceId : ""} -> ${
        Date.now() - startedAt
      }ms`,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown"
    await redis.set(
      `${REPLY_PREFIX}${cmd.reqId}`,
      { error: message },
      { ex: REPLY_TTL_SEC },
    )
    console.error("[bridge] cmd error:", message)
  }
}

console.log("[bridge] worker started, polling Redis…")
for (;;) {
  try {
    await tick()
  } catch (err) {
    console.error("[bridge] tick error:", err)
  }
  await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
}
