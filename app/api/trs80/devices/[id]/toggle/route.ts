import { NextResponse, type NextRequest } from "next/server"
import { getSwitchState, sendSwitchCommand } from "@/lib/smartthings"

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params
  try {
    const current = await getSwitchState(id)
    const next = current === "on" ? "off" : "on"
    await sendSwitchCommand(id, next)
    return NextResponse.json({ deviceId: id, switchState: next })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
