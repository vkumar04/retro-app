import { NextResponse } from "next/server"
import { listSwitchableDevices } from "@/lib/smartthings"

export async function GET() {
  try {
    const devices = await listSwitchableDevices()
    return NextResponse.json({ devices })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
