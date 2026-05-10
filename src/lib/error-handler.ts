import { NextResponse } from "next/server"
import { logger } from "./logger"
import { ZodError } from "zod"

/**
 * Standardized API response format for failures.
 */
export function handleErrorResponse(error: unknown, context?: string) {
  logger.error({ err: error, context }, "Operation failed")

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation Error", details: error.errors },
      { status: 400 }
    )
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json(
    { error: "Unknown Error" },
    { status: 500 }
  )
}

/**
 * Higher Order Function to wrap Next.js Route Handlers with standard error boundaries.
 */
export function withApiErrorHandler(handler: Function) {
  return async (...args: any[]) => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleErrorResponse(error, "API Handler")
    }
  }
}

/**
 * Helper to wrap generic async (DB/WebSocket processes) if needed to prevent unhandled rejections.
 */
export function withAsyncErrorBoundary<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  fallback?: R
) {
  return async (...args: T): Promise<R | undefined> => {
    try {
      return await fn(...args)
    } catch (error) {
      logger.error({ err: error }, "Async Boundary Caught Error")
      return fallback
    }
  }
}
