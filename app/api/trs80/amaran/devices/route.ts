import { NextResponse } from "next/server"
import { getAmaranStatus } from "@/lib/amaran"

export async function GET() {
  try {
    const status = await getAmaranStatus()
    return NextResponse.json(status)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json(
      { configured: true, online: false, devices: [], lastSeenMs: null, error: message },
      { status: 502 },
    )
  }
}
