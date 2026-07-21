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

  const stream = new ReadableStream({
    async start(controller) {
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
      } finally {
        // Close the connection immediately in serverless environments to release the connection pool and prevent timeouts.
        // The browser's native EventSource will automatically reconnect to poll for new coordinates.
        controller.close()
      }
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
