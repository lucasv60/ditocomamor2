import { NextRequest, NextResponse } from 'next/server'
import { rateLimiter, sanitizeInput } from './validation'
import { createErrorResponse, RateLimitError } from './error-handler'

// Rate limiting middleware
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse,
  options: { maxRequests?: number; windowMs?: number; identifier?: (request: NextRequest) => string } = {}
) {
  const { maxRequests = 10, windowMs = 60000, identifier } = options

  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Get client identifier (IP address or user ID)
      const clientId = identifier
        ? identifier(request)
        : request.ip || request.headers.get('x-forwarded-for') || 'unknown'

      // Check rate limit
      if (!rateLimiter.isAllowed(clientId, maxRequests, windowMs)) {
        return createErrorResponse(new RateLimitError(), 429)
      }

      return await handler(request)
    } catch (error) {
      return createErrorResponse(error as Error, 500)
    }
  }
}

// Input sanitization middleware
export function withSanitization(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // For POST/PUT requests, we could sanitize the body here
      // But for now, we'll rely on individual route validation

      return await handler(request)
    } catch (error) {
      return createErrorResponse(error as Error, 500)
    }
  }
}

// CORS middleware
export function withCORS(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse,
  options: {
    allowedOrigins?: string[]
    allowedMethods?: string[]
    allowedHeaders?: string[]
    maxAge?: number
  } = {}
) {
  const {
    allowedOrigins = ['*'], // In production, specify exact origins
    allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge = 86400, // 24 hours
  } = options

  return async (request: NextRequest): Promise<NextResponse> => {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 })

      response.headers.set('Access-Control-Allow-Origin', allowedOrigins.join(', '))
      response.headers.set('Access-Control-Allow-Methods', allowedMethods.join(', '))
      response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '))
      response.headers.set('Access-Control-Max-Age', maxAge.toString())

      return response
    }

    // Handle actual requests
    const response = await handler(request)

    // Add CORS headers to response
    if (response instanceof NextResponse) {
      response.headers.set('Access-Control-Allow-Origin', allowedOrigins.join(', '))
      response.headers.set('Access-Control-Allow-Methods', allowedMethods.join(', '))
      response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '))
    }

    return response
  }
}

// Security headers middleware
export function withSecurityHeaders(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const response = await handler(request)

    if (response instanceof NextResponse) {
      // Security headers
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('X-XSS-Protection', '1; mode=block')
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
      response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

      // Content Security Policy (basic)
      response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
      )
    }

    return response
  }
}

// Request logging middleware
export function withLogging(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse,
  options: { logRequests?: boolean; logErrors?: boolean } = {}
) {
  const { logRequests = true, logErrors = true } = options

  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now()
    const { method, url } = request
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'

    if (logRequests) {
      console.log(`[${new Date().toISOString()}] ${method} ${url} - IP: ${ip} - UA: ${userAgent}`)
    }

    try {
      const response = await handler(request)
      const duration = Date.now() - startTime

      if (logRequests) {
        console.log(`[${new Date().toISOString()}] ${method} ${url} - ${response.status} - ${duration}ms`)
      }

      return response
    } catch (error) {
      const duration = Date.now() - startTime

      if (logErrors) {
        console.error(`[${new Date().toISOString()}] ${method} ${url} - ERROR - ${duration}ms`, error)
      }

      throw error
    }
  }
}

// Combine multiple middlewares
export function withMiddlewares(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse,
  middlewares: Array<(handler: any) => any>
) {
  return middlewares.reduce((acc, middleware) => middleware(acc), handler)
}

// Common middleware combinations
export const withApiMiddleware = (handler: (request: NextRequest) => Promise<NextResponse> | NextResponse) =>
  withMiddlewares(handler, [
    withLogging,
    withRateLimit,
    withSanitization,
    withSecurityHeaders,
    withCORS,
  ])

export const withPublicApiMiddleware = (handler: (request: NextRequest) => Promise<NextResponse> | NextResponse) =>
  withMiddlewares(handler, [
    withLogging,
    withRateLimit,
    withSanitization,
    withSecurityHeaders,
    withCORS,
  ])