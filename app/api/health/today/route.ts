import { NextResponse } from "next/server"
import { fetchTodayMetrics } from "@/lib/server/google-health"

export const runtime = "nodejs"
export const revalidate = 300

export async function GET() {
  try {
    const data = await fetchTodayMetrics()
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
