const SMARTTHINGS_BASE = "https://api.smartthings.com/v1"

export type StDevice = {
  deviceId: string
  label: string
  category: string
  switchState: "on" | "off" | "unknown"
}

type RawDevice = {
  deviceId: string
  label?: string
  name?: string
  components?: Array<{
    id: string
    capabilities?: Array<{ id: string }>
    categories?: Array<{ name?: string }>
  }>
}

type StatusResponse = {
  components?: Record<
    string,
    {
      switch?: {
        switch?: { value?: string }
      }
    }
  >
}

function token(): string {
  const t = process.env.SMARTTHINGS_TOKEN
  if (!t) throw new Error("SMARTTHINGS_TOKEN not configured")
  return t
}

async function st<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${SMARTTHINGS_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`SmartThings ${res.status}: ${body.slice(0, 200)}`)
  }
  return res.json() as Promise<T>
}

function hasSwitchCapability(d: RawDevice): boolean {
  return (
    d.components?.some((c) =>
      c.capabilities?.some((cap) => cap.id === "switch"),
    ) ?? false
  )
}

function categoryOf(d: RawDevice): string {
  const main = d.components?.find((c) => c.id === "main")
  return main?.categories?.[0]?.name ?? "Device"
}

export async function listSwitchableDevices(): Promise<StDevice[]> {
  const data = await st<{ items: RawDevice[] }>("/devices")
  const switchable = data.items.filter(hasSwitchCapability)

  const statuses = await Promise.allSettled(
    switchable.map((d) =>
      st<StatusResponse>(`/devices/${d.deviceId}/status`).then((s) => {
        const value =
          s.components?.main?.switch?.switch?.value ??
          Object.values(s.components ?? {}).find((c) => c.switch)?.switch
            ?.switch?.value
        return value === "on" ? "on" : value === "off" ? "off" : "unknown"
      }),
    ),
  )

  return switchable.map((d, i) => {
    const status = statuses[i]
    return {
      deviceId: d.deviceId,
      label: d.label || d.name || d.deviceId,
      category: categoryOf(d),
      switchState:
        status.status === "fulfilled"
          ? (status.value as StDevice["switchState"])
          : "unknown",
    }
  })
}

export async function getSwitchState(
  deviceId: string,
): Promise<StDevice["switchState"]> {
  const s = await st<StatusResponse>(`/devices/${deviceId}/status`)
  const value =
    s.components?.main?.switch?.switch?.value ??
    Object.values(s.components ?? {}).find((c) => c.switch)?.switch?.switch
      ?.value
  return value === "on" ? "on" : value === "off" ? "off" : "unknown"
}

export async function sendSwitchCommand(
  deviceId: string,
  command: "on" | "off",
): Promise<void> {
  await st(`/devices/${deviceId}/commands`, {
    method: "POST",
    body: JSON.stringify({
      commands: [{ component: "main", capability: "switch", command }],
    }),
  })
}
