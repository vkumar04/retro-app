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

type RawDevice = {
  node_id: string
  name?: string
  switch?: "on" | "off"
  on?: boolean
  intensity?: number
}

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
const controller = new LightController(wsUrl)

function call<T>(fn: (cb: (ok: boolean, msg: string, data: T) => void) => void) {
  return new Promise<T>((resolve, reject) => {
    fn((ok, msg, data) => (ok ? resolve(data) : reject(new Error(msg))))
  })
}

const isOn = (d: RawDevice): boolean => {
  if (d.switch) return d.switch === "on"
  if (typeof d.on === "boolean") return d.on
  return (d.intensity ?? 0) > 0
}

async function buildSnapshot(): Promise<Snapshot> {
  const devices = await call<RawDevice[]>((cb) => controller.getDeviceList(cb))
  return {
    ts: Date.now(),
    devices: devices.map((d) => ({
      deviceId: d.node_id,
      label: d.name ?? d.node_id,
      switchState: isOn(d) ? "on" : "off",
    })),
  }
}

async function pushSnapshot(): Promise<Snapshot | null> {
  try {
    const snap = await buildSnapshot()
    await redis.set(SNAPSHOT_KEY, snap, { ex: SNAPSHOT_TTL_SEC })
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
    const devices = await call<RawDevice[]>((cb) =>
      controller.getDeviceList(cb),
    )
    const d = devices.find((x) => x.node_id === cmd.deviceId)
    if (!d) return { error: "device not found" }
    const next = !isOn(d)
    await call<unknown>((cb) =>
      next ? controller.turnOn(d.node_id, cb) : controller.turnOff(d.node_id, cb),
    )
    await pushSnapshot()
    return { deviceId: d.node_id, switchState: next ? "on" : "off" }
  }

  return { error: "unknown command" }
}

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
