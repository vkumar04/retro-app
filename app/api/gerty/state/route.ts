import { NextRequest } from "next/server"
import { applyAction, type GertyAction } from "@/lib/gerty-actions"
import { getServerState, setServerState } from "@/lib/server/gerty-realtime"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  return Response.json(getServerState())
}

export async function POST(req: NextRequest) {
  const action = (await req.json()) as GertyAction
  const next = applyAction(getServerState(), action)
  setServerState(next)
  return Response.json(next)
}
