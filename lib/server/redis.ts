import IORedis from "ioredis"

declare global {
  // eslint-disable-next-line no-var
  var __redisClient: IORedis | undefined
}

function create(): IORedis {
  const url = process.env.REDIS_URL
  if (!url) throw new Error("REDIS_URL is not set")
  return new IORedis(url, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  })
}

export function getRedis(): IORedis {
  if (!global.__redisClient) global.__redisClient = create()
  return global.__redisClient
}

export function tryGetRedis(): IORedis | null {
  try {
    return getRedis()
  } catch {
    return null
  }
}

export async function getJSON<T>(key: string): Promise<T | null> {
  const raw = await getRedis().get(key)
  if (raw == null) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return raw as unknown as T
  }
}

export async function setJSON(key: string, value: unknown): Promise<void> {
  const serialized = typeof value === "string" ? value : JSON.stringify(value)
  await getRedis().set(key, serialized)
}
