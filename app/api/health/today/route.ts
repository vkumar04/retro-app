import { NextResponse } from "next/server"
import { fetchTodayMetrics } from "@/lib/server/google-health"

export const runtime = "nodejs"
export const revalidate = 30

export async function GET() {
  try {
    const data = await fetchTodayMetrics()
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
