import WebSocket from "ws"
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import dotenv from "dotenv"

// Load env explicitly if running independently
dotenv.config()
import { logger } from "../lib/logger"
import { withAsyncErrorBoundary } from "../lib/error-handler"

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const API_KEY = process.env.AISSTREAM_API_KEY

let activeSocket: WebSocket | null = null
let reconnectAttempts = 0
const MAX_RECONNECT_DELAY = 60000
const INITIAL_RECONNECT_DELAY = 2000

// Heartbeat variables
let pingTimeout: NodeJS.Timeout

function heartbeat() {
  clearTimeout(pingTimeout)
  // Assume connection is dead if no message in 60s
  pingTimeout = setTimeout(() => {
    logger.warn("No heartbeat/message from AISStream in 60s. Terminating connection to force reconnect.")
    if (activeSocket) activeSocket.terminate()
  }, 60000)
}

const startIngester = withAsyncErrorBoundary(async () => {
  if (!API_KEY) {
    logger.error("Missing AISSTREAM_API_KEY in .env!")
    process.exit(1)
  }

  // Fetch target ships from DB to track natively
  const vessels = await prisma.vessel.findMany({ where: { mmsi: { not: null } } })
  const mmsiList = vessels.map((v) => Number(v.mmsi)) // Real mmsi format for AIS stream? The old code mapped to string. The API accepts an array of strings. Wait, wait:
  // "FiltersShipMMSI": ["368207620", "367736110"]
  const mmsiStringList = vessels.map((v) => v.mmsi?.toString() as string)
  
  const mmsiToIdMap = new Map<number, string>()
  vessels.forEach(v => {
    if (v.mmsi) mmsiToIdMap.set(Number(v.mmsi), v.id)
  })

  if (mmsiStringList.length === 0) {
    logger.warn("No valid vessels with MMSI found in database. Exiting.")
    return
  }

  logger.info(`Starting real-time tracking for ${mmsiStringList.length} vessels via AISStream.`)

  function connect() {
    logger.info("Initiating WebSocket connection to AISStream...")
    const socket = new WebSocket("wss://stream.aisstream.io/v0/stream")
    activeSocket = socket

    socket.on("open", () => {
      logger.info("Connected to globe AIS Stream.")
      reconnectAttempts = 0 // Reset on successful connect
      heartbeat() // start heartbeat

      const subscriptionMessage = {
        APIKey: API_KEY,
        BoundingBoxes: [[[-90, -180], [90, 180]]], // Global view
        FiltersShipMMSI: mmsiStringList, 
        FilterMessageTypes: ["PositionReport"]
      }
      
      socket.send(JSON.stringify(subscriptionMessage))
      logger.info({ Count: mmsiStringList.length }, "Subscribed to MMSIs")
    })

    socket.on("message", async (data) => {
      heartbeat() // Any message acts as a heartbeat
      try {
        const parsed = JSON.parse(data.toString())
        if (parsed.MessageType === "PositionReport") {
          const report = parsed.Message.PositionReport
          const mmsiId = parsed.MetaData.MMSI
          const lat = report.Latitude
          const lon = report.Longitude
          const speed = report.Sog // Speed over ground
          const heading = report.Cog // Course over ground

          logger.info({ mmsiId, lat, lon, speed, heading }, "[LIVE PING] Received")

          const vesselId = mmsiToIdMap.get(Number(mmsiId))
          const ts = new Date()

          if (vesselId) {
            // Store historical trajectory (step 5)
            await prisma.vesselPositionHistory.create({
              data: {
                vesselId,
                latitude: lat,
                longitude: lon,
                speed: speed,
                heading: heading,
                timestamp: ts
              }
            })

            // Update Postgres current position
            await prisma.vessel.update({
              where: { id: vesselId },
              data: {
                latitude: lat,
                longitude: lon,
                speed: speed,
                heading: heading,
                lastPing: ts
              }
            })
          }
        }
      } catch (e) {
        logger.error({ err: e }, "Error parsing AES message")
      }
    })

    socket.on("close", () => {
      clearTimeout(pingTimeout)
      const delay = Math.min(INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempts), MAX_RECONNECT_DELAY)
      logger.warn(`WebSocket Connection Closed. Reconnecting in ${delay}ms...`)
      
      reconnectAttempts++
      setTimeout(connect, delay)
    })

    socket.on("error", (err) => {
      logger.error({ err }, "WebSocket Error")
      socket.close() // emit close to trigger reconnect
    })
  }

  connect()
})

async function gracefulShutdown(signal: string) {
  logger.info({ signal }, "Received shutdown signal, terminating gracefully...")
  clearTimeout(pingTimeout)
  if (activeSocket) {
    activeSocket.terminate()
  }
  await prisma.$disconnect()
  logger.info("Prisma disconnected. Exiting now.")
  process.exit(0) // Exit safely
}

// Intercept exit signals
process.on("SIGINT", () => gracefulShutdown("SIGINT"))
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught Exception")
  gracefulShutdown("UNCAUGHT_EXCEPTION")
})

// Start daemon
startIngester()
