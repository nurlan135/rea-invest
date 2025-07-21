import { NextRequest, NextResponse } from 'next/server'
import { loginRateLimiter } from '@/lib/rate-limiter'
import { getClientIP, hashIP } from '@/lib/get-client-ip'
import { authLogger } from '@/lib/auth-logger'

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIP(request)
    const hashedIP = hashIP(ip)
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    const status = loginRateLimiter.getStatus(hashedIP, email || undefined)

    return NextResponse.json({
      allowed: status.allowed,
      remaining: status.remaining,
      resetTime: status.resetTime,
      blocked: status.blocked,
      blockUntil: status.blockUntil,
      resetIn: Math.max(0, status.resetTime - Date.now()),
      blockTimeRemaining: status.blockUntil ? Math.max(0, status.blockUntil - Date.now()) : 0
    })
  } catch (error) {
    console.error('Rate limit check error:', error)
    return NextResponse.json(
      { error: 'Rate limit check failed' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request)
    const hashedIP = hashIP(ip)
    const body = await request.json()
    const { email, success = false } = body

    const result = loginRateLimiter.recordAttempt(hashedIP, email, success)

    // Log rate limiting
    if (result.rateLimited || !result.allowed) {
      authLogger.logRateLimit(email, ip, result.remaining)
    }

    return NextResponse.json({
      allowed: result.allowed,
      remaining: result.remaining,
      resetTime: result.resetTime,
      blocked: result.blocked,
      blockUntil: result.blockUntil,
      rateLimited: result.rateLimited,
      resetIn: Math.max(0, result.resetTime - Date.now()),
      blockTimeRemaining: result.blockUntil ? Math.max(0, result.blockUntil - Date.now()) : 0
    })
  } catch (error) {
    console.error('Rate limit record error:', error)
    return NextResponse.json(
      { error: 'Rate limit record failed' },
      { status: 500 }
    )
  }
}