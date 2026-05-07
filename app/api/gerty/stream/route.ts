import { getServerState, subscribe } from "@/lib/server/gerty-realtime"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const encoder = new TextEncoder()
  let unsubscribe = () => {}
  let keepAlive: ReturnType<typeof setInterval> | null = null
  let closed = false

  const stream = new ReadableStream({
    start(controller) {
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
      send(getServerState())
      unsubscribe = subscribe(send)
      keepAlive = setInterval(() => {
        safeEnqueue(encoder.encode(": ka\n\n"))
      }, 25_000)

      const cleanup = () => {
        if (closed) return
        closed = true
        unsubscribe()
        if (keepAlive) clearInterval(keepAlive)
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
      unsubscribe()
      if (keepAlive) clearInterval(keepAlive)
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
