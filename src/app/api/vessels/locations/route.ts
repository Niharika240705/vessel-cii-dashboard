import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withApiErrorHandler } from "@/lib/error-handler"
import { auth } from "@/auth"
import { checkRateLimit } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

export const GET = withApiErrorHandler(async (req: Request) => {
  const isRateLimited = checkRateLimit(req, 100)
  if (isRateLimited) return isRateLimited

  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
  }
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
      lastPing: true
    }
  })

  return NextResponse.json({ vessels })
})
