import { NextResponse, type NextRequest } from "next/server"
import { isAmaranConfigured, toggleAmaranDevice } from "@/lib/amaran"

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!isAmaranConfigured()) {
    return NextResponse.json(
      { error: "Amaran not configured" },
      { status: 503 },
    )
  }
  const { id } = await ctx.params
  try {
    const data = await toggleAmaranDevice(id)
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    const status = message === "bridge timeout" ? 504 : 502
    return NextResponse.json({ error: message }, { status })
  }
}
