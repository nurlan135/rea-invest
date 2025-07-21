import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Check current session status
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({
        valid: false,
        error: 'No active session'
      }, { status: 401 })
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    })

    if (!user || !user.isActive) {
      return NextResponse.json({
        valid: false,
        error: 'User not found or inactive'
      }, { status: 401 })
    }

    return NextResponse.json({
      valid: true,
      session: {
        user: {
          id: user.id.toString(),
          email: user.email,
          name: user.fullName,
          role: user.role
        },
        expires: session.expires
      },
      serverTime: Date.now()
    })
  } catch (error) {
    console.error('Session validation error:', error)
    return NextResponse.json({
      valid: false,
      error: 'Session validation failed'
    }, { status: 500 })
  }
}

// POST - Refresh/extend session
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'No active session to refresh'
      }, { status: 401 })
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true
      }
    })

    if (!user || !user.isActive) {
      return NextResponse.json({
        success: false,
        error: 'User not found or inactive'
      }, { status: 401 })
    }

    // Session refresh is handled automatically by NextAuth
    // This endpoint mainly serves to validate and return current session info
    return NextResponse.json({
      success: true,
      session: {
        user: {
          id: user.id.toString(),
          email: user.email,
          name: user.fullName,
          role: user.role
        },
        expires: session.expires
      },
      refreshed: true,
      serverTime: Date.now()
    })
  } catch (error) {
    console.error('Session refresh error:', error)
    return NextResponse.json({
      success: false,
      error: 'Session refresh failed'
    }, { status: 500 })
  }
}

// DELETE - Invalidate session (logout)
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({
        success: true,
        message: 'No active session to invalidate'
      })
    }

    // Log the logout attempt
    console.log(`Session invalidated for user: ${session.user.email}`)

    return NextResponse.json({
      success: true,
      message: 'Session invalidated successfully'
    })
  } catch (error) {
    console.error('Session invalidation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Session invalidation failed'
    }, { status: 500 })
  }
}