import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { authLogger } from '@/lib/auth-logger'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow access in development or for admin users
    if (process.env.NODE_ENV !== 'development' && session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as any
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const email = searchParams.get('email')

    let logs
    if (type) {
      logs = authLogger.getLogsByType(type, limit)
    } else if (email) {
      logs = authLogger.getFailedAttempts(email, 60) // Last 60 minutes
    } else {
      logs = authLogger.getLogs(limit || 100)
    }

    const stats = authLogger.getStats()

    return NextResponse.json({
      logs,
      stats,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Auth logs API error:', error)
    return NextResponse.json({ error: 'Failed to get auth logs' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow access for admin users
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    authLogger.clearLogs()
    
    return NextResponse.json({ success: true, message: 'Auth logs cleared' })
  } catch (error) {
    console.error('Auth logs clear error:', error)
    return NextResponse.json({ error: 'Failed to clear logs' }, { status: 500 })
  }
}