import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'İcazə yoxdur' }, { status: 403 })
    }

    // Get admin statistics
    const [totalUsers, activeUsers, totalProperties, totalTransactions] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.property.count(),
      prisma.transaction.count()
    ])

    // Simple system health check
    const systemHealth = 'healthy' // This could be more sophisticated

    // Mock database size (in production, you'd query actual DB size)
    const dbSize = '156 MB'

    // Mock active connections
    const activeConnections = 12

    const stats = {
      totalUsers,
      activeUsers,
      totalProperties,
      totalTransactions,
      systemHealth,
      dbSize,
      activeConnections
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ 
      error: 'Statistikalar yüklənərkən xəta baş verdi' 
    }, { status: 500 })
  }
}