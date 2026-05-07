import { NextRequest } from "next/server"
import { applyAction, type GertyAction } from "@/lib/gerty-actions"
import { getServerState, setServerState } from "@/lib/server/gerty-realtime"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const state = await getServerState()
  return Response.json(state)
}

export async function POST(req: NextRequest) {
  const action = (await req.json()) as GertyAction
  const current = await getServerState()
  const next = applyAction(current, action)
  await setServerState(next)
  return Response.json(next)
}
