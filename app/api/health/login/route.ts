import { NextResponse } from "next/server"
import { randomBytes } from "node:crypto"
import { buildAuthUrl } from "@/lib/server/google-health"

export const runtime = "nodejs"

export async function GET() {
  const state = randomBytes(16).toString("hex")
  const url = buildAuthUrl(state)
  const res = NextResponse.redirect(url)
  res.cookies.set("gh_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  })
  return res
}
