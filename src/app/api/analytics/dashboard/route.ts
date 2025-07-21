import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parallel queries for maximum performance
    const [
      totalProperties,
      activeProperties,
      completedTransactions,
      revenueData,
      expiredDeposits
    ] = await Promise.all([
      // Total properties count
      prisma.property.count(),
      
      // Active properties count
      prisma.property.count({
        where: {
          status: {
            in: ['YENI', 'GOZLEMEDE', 'BEH_VERILIB']
          }
        }
      }),
      
      // Completed transactions with revenue
      prisma.transaction.findMany({
        where: {
          saleDate: { not: null }
        },
        select: {
          salePrice: true,
          serviceFee: true,
          profit: true
        }
      }),
      
      // This month's data
      prisma.transaction.findMany({
        where: {
          saleDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        select: {
          profit: true
        }
      }),
      
      // Expired deposits count
      prisma.deposit.count({
        where: {
          deadline: { lt: new Date() },
          isExpired: false
        }
      })
    ])

    // Calculate analytics efficiently
    const totalRevenue = completedTransactions.reduce((sum: number, t: any) => 
      sum + Number(t.salePrice || 0) + Number(t.serviceFee || 0), 0
    )
    
    const totalProfit = completedTransactions.reduce((sum: number, t: any) => 
      sum + Number(t.profit || 0), 0
    )
    
    const thisMonthProfit = revenueData.reduce((sum: number, t: any) => 
      sum + Number(t.profit || 0), 0
    )

    const analytics = {
      totalProperties,
      activeProperties,
      soldProperties: totalProperties - activeProperties,
      totalTransactions: completedTransactions.length,
      completedTransactions: completedTransactions.length,
      totalRevenue,
      totalProfit,
      expiredDeposits,
      thisMonthSales: revenueData.length,
      thisMonthProfit,
      avgProfitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
    }

    const response = NextResponse.json(analytics)
    response.headers.set('Cache-Control', 'public, max-age=60') // 1 minute cache
    
    return response
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}