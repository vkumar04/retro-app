import { NextResponse } from "next/server"
import { loadRefreshToken, fetchTodayMetrics } from "@/lib/server/google-health"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const token = await loadRefreshToken()
  if (!token) {
    return NextResponse.json({ state: "disconnected", reason: "no_refresh_token" })
  }
  try {
    await fetchTodayMetrics()
    return NextResponse.json({ state: "connected" })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const reason = /ACCOUNT_NOT_LINKED/.test(msg)
      ? "account_not_linked"
      : /refresh failed/.test(msg)
        ? "refresh_failed"
        : "api_error"
    return NextResponse.json({ state: "error", reason, detail: msg })
  }
}
