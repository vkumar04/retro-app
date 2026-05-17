import { getRedis } from "@/lib/server/redis"
import { NextResponse, type NextRequest } from "next/server"

export const runtime = "nodejs"

// POST /api/admin/redis-cleanup
//
// Deletes transient Amaran keys to free up request budget / inspect state:
//   - amaran:reply:*  (per-request reply blobs; should auto-TTL but just in case)
//   - amaran:snapshot (worker rebuilds this on next tick)
//   - amaran:cmds     (pending command list; safe to drop)
//
// Does NOT touch gerty:* keys.
//
// Requires CLEANUP_SECRET to be set on Vercel and passed via
// x-cleanup-secret header.
export async function POST(req: NextRequest) {
  const secret = process.env.CLEANUP_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: "CLEANUP_SECRET not configured" },
      { status: 500 },
    )
  }
  if (req.headers.get("x-cleanup-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const redis = getRedis()

  let deleted = 0
  let cursor = "0"
  do {
    const [next, keys] = await redis.scan(cursor, "MATCH", "amaran:reply:*", "COUNT", 100)
    cursor = next
    if (keys.length > 0) {
      deleted += await redis.del(...keys)
    }
  } while (cursor !== "0")

  const droppedSnapshot = (await redis.del("amaran:snapshot")) === 1
  const droppedCmds = (await redis.del("amaran:cmds")) === 1
  const dbsize = await redis.dbsize()

  return NextResponse.json({
    deletedReplies: deleted,
    droppedSnapshot,
    droppedCmds,
    dbsize,
  })
}
