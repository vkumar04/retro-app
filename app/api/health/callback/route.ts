import { NextResponse } from "next/server"
import { exchangeCodeForTokens, saveRefreshToken } from "@/lib/server/google-health"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const error = url.searchParams.get("error")

  if (error) return NextResponse.json({ error }, { status: 400 })
  if (!code) return NextResponse.json({ error: "missing code" }, { status: 400 })

  const stateCookie = req.headers
    .get("cookie")
    ?.split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith("gh_oauth_state="))
    ?.split("=")[1]
  if (!state || !stateCookie || state !== stateCookie) {
    return NextResponse.json({ error: "state mismatch" }, { status: 400 })
  }

  const tokens = await exchangeCodeForTokens(code)
  if (!tokens.refresh_token) {
    return NextResponse.json(
      {
        error:
          "no refresh_token returned. Revoke app access at myaccount.google.com/permissions and retry — Google only issues a refresh token on first consent or with prompt=consent.",
      },
      { status: 400 },
    )
  }
  await saveRefreshToken(tokens.refresh_token)

  return NextResponse.json({
    ok: true,
    message: "Refresh token saved to Redis. You can now hit /api/health/today.",
  })
}
