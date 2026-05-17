import { Redis } from "@upstash/redis"

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
const TOKEN_URL = "https://oauth2.googleapis.com/token"
const SCOPE = "https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly"
const API_BASE = "https://health.googleapis.com/v4"

const REFRESH_TOKEN_KEY = "google-health:refresh-token"

function redis() {
  return Redis.fromEnv()
}

function clientId() {
  const id = process.env.GOOGLE_HEALTH_CLIENT_ID
  if (!id) throw new Error("GOOGLE_HEALTH_CLIENT_ID is not set")
  return id
}

function clientSecret() {
  const s = process.env.GOOGLE_HEALTH_CLIENT_SECRET
  if (!s) throw new Error("GOOGLE_HEALTH_CLIENT_SECRET is not set")
  return s
}

function redirectUri() {
  const explicit = process.env.GOOGLE_HEALTH_REDIRECT_URI
  if (explicit) return explicit
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000"
  return `${base}/api/health/callback`
}

export function buildAuthUrl(state: string) {
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
    state,
  })
  return `${AUTH_URL}?${params.toString()}`
}

type TokenResponse = {
  access_token: string
  expires_in: number
  refresh_token?: string
  scope?: string
  token_type: string
}

export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    code,
    client_id: clientId(),
    client_secret: clientSecret(),
    redirect_uri: redirectUri(),
    grant_type: "authorization_code",
  })
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })
  if (!res.ok) throw new Error(`token exchange failed: ${res.status} ${await res.text()}`)
  return (await res.json()) as TokenResponse
}

export async function saveRefreshToken(token: string) {
  await redis().set(REFRESH_TOKEN_KEY, token)
}

export async function loadRefreshToken(): Promise<string | null> {
  const fromRedis = await redis().get<string>(REFRESH_TOKEN_KEY)
  if (fromRedis) return fromRedis
  return process.env.GOOGLE_HEALTH_REFRESH_TOKEN ?? null
}

let accessCache: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  const now = Date.now()
  if (accessCache && accessCache.expiresAt > now + 60_000) return accessCache.token

  const refreshToken = await loadRefreshToken()
  if (!refreshToken) throw new Error("No refresh token. Visit /api/health/login first.")

  const body = new URLSearchParams({
    client_id: clientId(),
    client_secret: clientSecret(),
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  })
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })
  if (!res.ok) throw new Error(`refresh failed: ${res.status} ${await res.text()}`)
  const json = (await res.json()) as TokenResponse

  if (json.refresh_token && json.refresh_token !== refreshToken) {
    await saveRefreshToken(json.refresh_token)
  }
  accessCache = {
    token: json.access_token,
    expiresAt: now + json.expires_in * 1000,
  }
  return json.access_token
}

export type TodayMetrics = {
  steps: number
  calories: number
  activeMinutes: number
  exerciseCount: number
}

type ExerciseDataPoint = {
  exercise?: {
    interval?: { civilStartTime?: string; civilEndTime?: string }
    duration?: string
    steps?: number
    calories?: number
    activeDurationMinutes?: number
  }
  startTime?: string
  endTime?: string
  steps?: number
  calories?: number
}

export async function fetchTodayMetrics(): Promise<TodayMetrics> {
  const token = await getAccessToken()
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const filter = `exercise.interval.civil_start_time >= "${start.toISOString().slice(0, 19)}"`
  const url = `${API_BASE}/users/me/dataTypes/exercise/dataPoints?filter=${encodeURIComponent(filter)}`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`health api ${res.status}: ${await res.text()}`)
  const json = (await res.json()) as { dataPoints?: ExerciseDataPoint[] }

  let steps = 0
  let calories = 0
  let activeMinutes = 0
  for (const dp of json.dataPoints ?? []) {
    steps += dp.exercise?.steps ?? dp.steps ?? 0
    calories += dp.exercise?.calories ?? dp.calories ?? 0
    activeMinutes += dp.exercise?.activeDurationMinutes ?? 0
  }
  return {
    steps,
    calories: Math.round(calories),
    activeMinutes: Math.round(activeMinutes),
    exerciseCount: json.dataPoints?.length ?? 0,
  }
}
