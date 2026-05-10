import { LRUCache } from "lru-cache"
import { NextResponse } from "next/server"

/**
 * Standard fixed-window rate limiter utilizing LRU caches.
 * Caches memory bounds to 500 unique IPs.
 */
const rateLimitCache = new LRUCache<string, number>({
  max: 500,
  ttl: 60 * 1000, // 1 minute window
})

export function checkRateLimit(req: Request, limit: number = 60) {
  // Try to determine the IP from headers, fallback to "global" string if missing.
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown_ip"
  
  const currentUsage = rateLimitCache.get(ip) || 0

  if (currentUsage >= limit) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 })
  }

  rateLimitCache.set(ip, currentUsage + 1)
  return null
}
