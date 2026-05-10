import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // 1. Check strict Database connectivity
    // If DB is unreachable, this fails instantly triggering catch block
    await prisma.$queryRaw`SELECT 1`

    // 2. Monitor internal AIS Daemon Heartbeat natively
    // Assess the absolute global trailing ping across the entire tracked fleet
    const latestVessel = await prisma.vessel.findFirst({
      where: { lastPing: { not: null } },
      orderBy: { lastPing: "desc" },
      select: { lastPing: true }
    })

    const now = new Date().getTime()
    const lastPingTime = latestVessel?.lastPing?.getTime() || 0
    const absoluteDelaySeconds = (now - lastPingTime) / 1000

    // 3. Strict tolerance
    // If our background daemon hasn't inserted a positional row within 5 minutes, 
    // it implies the websocket stream crashed or hung without restarting.
    const isIngesterLive = absoluteDelaySeconds < 300

    if (!isIngesterLive) {
      return NextResponse.json({
        status: "unhealthy",
        database: "connected",
        ais_daemon: "stalled",
        latency_seconds: absoluteDelaySeconds,
        message: "AIS Background Worker has not recorded any fleet movements in over 5 minutes. Restart daemon."
      }, { status: 503 }) // Triggers automated alerts on Vercel/Railway/Datadog
    }

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      ais_daemon: "live",
      latency_seconds: absoluteDelaySeconds,
      message: "All systems fully operational. Maritime telemetry is natively streaming."
    }, { status: 200 })
    
  } catch (error) {
    // Catastrophic failure layer
    return NextResponse.json({
      status: "down",
      database: "disconnected",
      message: "Database connection completely severed."
    }, { status: 500 })
  }
}
