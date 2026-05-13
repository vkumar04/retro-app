"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

type Device = {
  deviceId: string
  label: string
  category?: string
  switchState: "on" | "off" | "unknown"
}

type Source = "smartthings" | "amaran"

type AmaranState = {
  configured: boolean
  online: boolean
  devices: Device[]
  lastSeenMs: number | null
  error: string | null
}

const GAMES = [
  { slug: "pong", name: "PONG" },
  { slug: "heist", name: "BANK ROBBERY" },
  { slug: "zombies", name: "ZOMBIES" },
  { slug: "tetris", name: "TETRIS" },
  { slug: "lighthouse", name: "LIGHTHOUSE" },
] as const

const MEALS = [
  { slug: "breakfast", name: "BREAKFAST" },
  { slug: "lunch", name: "LUNCH" },
  { slug: "dinner", name: "DINNER" },
  { slug: "snack", name: "SNACK" },
] as const

export default function Trs80Page() {
  const [stDevices, setStDevices] = useState<Device[]>([])
  const [amaran, setAmaran] = useState<AmaranState>({
    configured: false,
    online: false,
    devices: [],
    lastSeenMs: null,
    error: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<Set<string>>(new Set())
  const [time, setTime] = useState("")
  const [acks, setAcks] = useState<Record<string, number>>({})

  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString("en-US", { hour12: false }))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const load = useCallback(async () => {
    setError(null)
    try {
      const [stRes, amRes] = await Promise.all([
        fetch("/api/trs80/devices", { cache: "no-store" }),
        fetch("/api/trs80/amaran/devices", { cache: "no-store" }),
      ])
      const stJson = await stRes.json()
      const amJson = await amRes.json()
      if (!stRes.ok) throw new Error(stJson.error ?? "SmartThings load failed")
      setStDevices(stJson.devices)
      setAmaran({
        configured: !!amJson.configured,
        online: !!amJson.online,
        devices: amJson.devices ?? [],
        lastSeenMs: amJson.lastSeenMs ?? null,
        error: amJson.error ?? null,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load devices")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const toggle = async (source: Source, id: string) => {
    const key = `${source}:${id}`
    setPending((p) => new Set(p).add(key))
    const path =
      source === "smartthings"
        ? `/api/trs80/devices/${id}/toggle`
        : `/api/trs80/amaran/devices/${id}/toggle`
    try {
      const res = await fetch(path, { method: "POST" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Toggle failed")
      const updater = (ds: Device[]) =>
        ds.map((d) =>
          d.deviceId === id ? { ...d, switchState: json.switchState } : d,
        )
      if (source === "smartthings") setStDevices(updater)
      else setAmaran((a) => ({ ...a, devices: updater(a.devices) }))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Toggle failed")
    } finally {
      setPending((p) => {
        const n = new Set(p)
        n.delete(key)
        return n
      })
    }
  }

  // Fake tile feedback — flashes "ACK" for 1.6s then clears.
  const ack = (key: string) => {
    setAcks((m) => ({ ...m, [key]: Date.now() }))
    setTimeout(() => {
      setAcks((m) => {
        const n = { ...m }
        delete n[key]
        return n
      })
    }, 1600)
  }

  const allDevices = [...stDevices, ...amaran.devices]
  const onCount = allDevices.filter((d) => d.switchState === "on").length

  return (
    <div className="min-h-screen w-full bg-background crt-curve font-mono flex flex-col">
      <header className="border-b border-border p-4 flex items-center justify-between">
        <Link
          href="/admin"
          className="text-terminal-green hover:underline text-xs tracking-[0.3em]"
        >
          {"<"} ADMIN
        </Link>
        <div className="text-center">
          <h1 className="text-terminal-green text-xl tracking-[0.5em] font-bold glow-green">
            TRS-80 CTRL
          </h1>
          <div className="text-muted-foreground text-xs tracking-[0.3em] mt-1">
            {onCount} / {allDevices.length} ACTIVE
          </div>
        </div>
        <div className="text-terminal-amber text-xs tabular-nums tracking-[0.2em] glow-amber min-w-[8ch] text-right">
          {time}
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-5xl w-full mx-auto">
        <div className="mb-6 text-xs text-muted-foreground">
          <span className="text-terminal-green">root@trs80</span>
          <span>:</span>
          <span className="text-terminal-cyan">~/control</span>
          <span>$ </span>
          <span className="text-foreground">scan --all-bridges</span>
          <span className="cursor-blink ml-1">█</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xs tracking-[0.3em] text-terminal-green">
            DEVICES
          </span>
          <button
            onClick={() => {
              setLoading(true)
              load()
            }}
            className="px-3 py-1 border border-border text-xs tracking-wider text-muted-foreground hover:border-terminal-green/60 hover:text-terminal-green"
          >
            REFRESH
          </button>
        </div>

        {error && (
          <div className="mb-4 border border-destructive/60 bg-destructive/10 text-destructive p-3 text-xs tracking-wider">
            ERR: {error}
          </div>
        )}

        <Section title="TV'S" status={`${stDevices.length} DEVICES`}>
          {loading ? (
            <SectionLoading />
          ) : stDevices.length === 0 ? (
            <SectionEmpty text="NO SWITCH-CAPABLE DEVICES" />
          ) : (
            <DeviceGrid
              devices={stDevices}
              onToggle={(id) => toggle("smartthings", id)}
              pending={pending}
              source="smartthings"
            />
          )}
        </Section>

        <Section
          title="LIGHTS"
          status={
            !amaran.configured
              ? "BRIDGE OFFLINE"
              : amaran.error
                ? "BRIDGE ERROR"
                : `${amaran.devices.length} LIGHTS`
          }
          tone={!amaran.configured || amaran.error ? "amber" : "green"}
        >
          {!amaran.configured ? (
            <SectionEmpty text="LOCAL BRIDGE NOT CONFIGURED · SEE amaran-bridge/README" />
          ) : amaran.error ? (
            <SectionEmpty text={`BRIDGE: ${amaran.error}`} />
          ) : loading ? (
            <SectionLoading />
          ) : amaran.devices.length === 0 ? (
            <SectionEmpty text="NO LIGHTS PAIRED IN AMARAN DESKTOP" />
          ) : (
            <DeviceGrid
              devices={amaran.devices}
              onToggle={(id) => toggle("amaran", id)}
              pending={pending}
              source="amaran"
            />
          )}
        </Section>

        <Section title="FOOD" status={`${MEALS.length} OPTIONS`}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {MEALS.map((m) => {
              const key = `food:${m.slug}`
              return (
                <FakeTile
                  key={m.slug}
                  caption="REQUEST"
                  label={m.name}
                  ack={!!acks[key]}
                  onClick={() => ack(key)}
                />
              )
            })}
          </div>
        </Section>

        <Section title="LAUNDRY" status="1 OPTION">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <FakeTile
              caption="REQUEST"
              label="REQUEST LAUNDRY"
              ack={!!acks["laundry:request"]}
              onClick={() => ack("laundry:request")}
            />
          </div>
        </Section>

        <Section title="GAMES" status={`${GAMES.length} GAMES`}>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {GAMES.map((g) => {
              const key = `game:${g.slug}`
              return (
                <FakeTile
                  key={g.slug}
                  caption="GAME"
                  label={g.name}
                  actionLabel="PLAY ▶"
                  ack={!!acks[key]}
                  onClick={() => ack(key)}
                />
              )
            })}
          </div>
        </Section>
      </main>

      <footer className="border-t border-border p-3 flex items-center justify-between text-xs text-muted-foreground tracking-[0.2em]">
        <span className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-terminal-green pulse-glow" />
          MULTI-BRIDGE UPLINK
        </span>
        <span>TRS-80 · v1.2</span>
      </footer>
    </div>
  )
}

function Section({
  title,
  status,
  tone = "green",
  children,
}: {
  title: string
  status: string
  tone?: "green" | "amber"
  children: React.ReactNode
}) {
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
        <span className="text-xs tracking-[0.3em] text-terminal-green">
          {title}
        </span>
        <span
          className={`text-xs tracking-[0.2em] ${
            tone === "amber" ? "text-terminal-amber" : "text-muted-foreground"
          }`}
        >
          {status}
        </span>
      </div>
      {children}
    </section>
  )
}

function SectionLoading() {
  return (
    <div className="text-muted-foreground text-sm tracking-[0.3em]">
      SCANNING<span className="cursor-blink">█</span>
    </div>
  )
}

function SectionEmpty({ text }: { text: string }) {
  return (
    <div className="text-muted-foreground text-xs tracking-[0.3em] border border-dashed border-border p-4">
      {text}
    </div>
  )
}

function DeviceGrid({
  devices,
  onToggle,
  pending,
  source,
}: {
  devices: Device[]
  onToggle: (id: string) => void
  pending: Set<string>
  source: Source
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {devices.map((d) => {
        const isOn = d.switchState === "on"
        const isPending = pending.has(`${source}:${d.deviceId}`)
        return (
          <li key={d.deviceId}>
            <button
              type="button"
              onClick={() => onToggle(d.deviceId)}
              disabled={isPending}
              className={`w-full text-left border p-4 transition-colors flex flex-col gap-2 ${
                isOn
                  ? "border-terminal-green bg-terminal-green/10 text-terminal-green glow-green"
                  : "border-border bg-card hover:border-terminal-green/60"
              } ${isPending ? "opacity-50 cursor-wait" : ""}`}
            >
              <div className="flex items-center justify-between text-[10px] tracking-[0.3em] text-muted-foreground">
                <span>{(d.category ?? (source === "amaran" ? "lights" : source)).toUpperCase()}</span>
                <span
                  className={
                    isOn
                      ? "text-terminal-green"
                      : d.switchState === "off"
                        ? "text-muted-foreground"
                        : "text-terminal-amber"
                  }
                >
                  {isPending
                    ? "..."
                    : d.switchState === "unknown"
                      ? "??"
                      : d.switchState.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`size-3 shrink-0 rounded-full border-2 ${
                    isOn
                      ? "border-terminal-green bg-terminal-green pulse-glow"
                      : "border-muted-foreground"
                  }`}
                />
                <span className="text-base tracking-wide flex-1 truncate">
                  {d.label}
                </span>
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function FakeTile({
  caption,
  label,
  actionLabel,
  ack,
  onClick,
}: {
  caption: string
  label: string
  actionLabel?: string
  ack: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left border p-4 transition-colors flex flex-col gap-2 ${
        ack
          ? "border-terminal-amber bg-terminal-amber/10 text-terminal-amber glow-amber"
          : "border-border bg-card hover:border-terminal-green/60 text-foreground"
      }`}
    >
      <div className="flex items-center justify-between text-[10px] tracking-[0.3em] text-muted-foreground">
        <span>{caption}</span>
        {actionLabel && <span>{ack ? "QUEUED ✓" : actionLabel}</span>}
        {!actionLabel && <span>{ack ? "REQUESTED ✓" : "TAP"}</span>}
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`size-3 shrink-0 rounded-full border-2 ${
            ack
              ? "border-terminal-amber bg-terminal-amber/80 pulse-glow"
              : "border-muted-foreground"
          }`}
        />
        <span className="text-base tracking-wide flex-1 truncate">{label}</span>
      </div>
    </button>
  )
}
