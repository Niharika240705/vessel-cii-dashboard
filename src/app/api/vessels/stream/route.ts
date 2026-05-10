import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { checkRateLimit } from "@/lib/rate-limit"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const isRateLimited = checkRateLimit(req, 20) // Tight limits for streaming connections
  if (isRateLimited) return isRateLimited

  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
  }
  const encoder = new TextEncoder()
  let intervalId: NodeJS.Timeout

  const stream = new ReadableStream({
    async start(controller) {
      const fetchAndEncode = async () => {
        try {
          const vessels = await prisma.vessel.findMany({
            where: { 
              latitude: { not: null },
              longitude: { not: null }
            },
            select: {
              id: true,
              name: true,
              mmsi: true,
              latitude: true,
              longitude: true,
              speed: true,
              heading: true,
              type: true,
              lastPing: true,
              ciiRatings: {
                take: 1,
                orderBy: { year: 'desc' },
                select: { rating: true }
              }
            }
          })
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ vessels })}\n\n`))
        } catch (err) {
          console.error("SSE Streaming DB error", err)
        }
      }

      // 1. Dispatch initial load instantly
      await fetchAndEncode()

      // 2. Setup high-frequency internal polling (Server-Side)
      // This prevents thousands of heavy React HTTP handshakes by pushing byte-streams natively
      intervalId = setInterval(fetchAndEncode, 2000)

      // 3. Graceful termination when client drops the connection
      req.signal.addEventListener("abort", () => {
        clearInterval(intervalId)
        controller.close()
      })
    },
    cancel() {
      clearInterval(intervalId)
    }
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  })
}
