import { getServerState, getVersion } from "@/lib/server/gerty-realtime"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 300

const POLL_MS = 1000
const KEEPALIVE_MS = 25_000

export async function GET(req: Request) {
  const encoder = new TextEncoder()
  let lastVersion = -1
  let pollTimer: ReturnType<typeof setInterval> | null = null
  let keepAliveTimer: ReturnType<typeof setInterval> | null = null
  let closed = false

  const stream = new ReadableStream({
    async start(controller) {
      const safeEnqueue = (chunk: Uint8Array) => {
        if (closed) return
        try {
          controller.enqueue(chunk)
        } catch {
          closed = true
        }
      }
      const send = (data: unknown) => {
        safeEnqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const initial = await getServerState()
        lastVersion = await getVersion()
        send(initial)
      } catch {
        // ignore initial fetch failures; poller will retry
      }

      pollTimer = setInterval(async () => {
        if (closed) return
        try {
          const v = await getVersion()
          if (v !== lastVersion) {
            lastVersion = v
            const next = await getServerState()
            send(next)
          }
        } catch {
          // transient redis errors — try again next tick
        }
      }, POLL_MS)

      keepAliveTimer = setInterval(() => {
        safeEnqueue(encoder.encode(": ka\n\n"))
      }, KEEPALIVE_MS)

      const cleanup = () => {
        if (closed) return
        closed = true
        if (pollTimer) clearInterval(pollTimer)
        if (keepAliveTimer) clearInterval(keepAliveTimer)
        try {
          controller.close()
        } catch {
          // already closed
        }
      }
      req.signal.addEventListener("abort", cleanup)
    },
    cancel() {
      closed = true
      if (pollTimer) clearInterval(pollTimer)
      if (keepAliveTimer) clearInterval(keepAliveTimer)
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
