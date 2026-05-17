import { getRedis } from "@/lib/server/redis"

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
const TOKEN_URL = "https://oauth2.googleapis.com/token"
const SCOPE = "https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly"
const API_BASE = "https://health.googleapis.com/v4"

const REFRESH_TOKEN_KEY = "google-health:refresh-token"

function redis() {
  return getRedis()
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
  const fromRedis = await redis().get(REFRESH_TOKEN_KEY)
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
  distanceMeters: number
}

type CivilDate = { year: number; month: number; day: number }
type RollupResponse = {
  rollupDataPoints?: Array<{
    steps?: { countSum?: string | number }
    totalCalories?: { kcalSum?: number }
    activeMinutes?: { minutesSum?: string | number }
    distance?: { millimetersSum?: string | number }
  }>
}

function todayRange(): { start: CivilDate; end: CivilDate } {
  const t = new Date()
  const tomorrow = new Date(t)
  tomorrow.setDate(t.getDate() + 1)
  return {
    start: { year: t.getFullYear(), month: t.getMonth() + 1, day: t.getDate() },
    end: {
      year: tomorrow.getFullYear(),
      month: tomorrow.getMonth() + 1,
      day: tomorrow.getDate(),
    },
  }
}

async function dailyRollUp(dataType: string, token: string): Promise<RollupResponse> {
  const { start, end } = todayRange()
  const url = `${API_BASE}/users/me/dataTypes/${dataType}/dataPoints:dailyRollUp`
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ range: { start: { date: start }, end: { date: end } } }),
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`health api ${dataType} ${res.status}: ${await res.text()}`)
  return (await res.json()) as RollupResponse
}

function num(v: string | number | undefined): number {
  if (v == null) return 0
  return typeof v === "string" ? Number(v) : v
}

export async function fetchTodayMetrics(): Promise<TodayMetrics> {
  const token = await getAccessToken()
  const [steps, calories, active, distance] = await Promise.all([
    dailyRollUp("steps", token),
    dailyRollUp("total-calories", token),
    dailyRollUp("active-minutes", token),
    dailyRollUp("distance", token),
  ])
  const stepsCount = num(steps.rollupDataPoints?.[0]?.steps?.countSum)
  const kcal = num(calories.rollupDataPoints?.[0]?.totalCalories?.kcalSum)
  const minutes = num(active.rollupDataPoints?.[0]?.activeMinutes?.minutesSum)
  const mm = num(distance.rollupDataPoints?.[0]?.distance?.millimetersSum)
  return {
    steps: Math.round(stepsCount),
    calories: Math.round(kcal),
    activeMinutes: Math.round(minutes),
    distanceMeters: Math.round(mm / 1000),
  }
}
