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

    // Son 12 ayın statistikaları
    const monthlyData = []
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      date.setDate(1)
      date.setHours(0, 0, 0, 0)
      
      const nextMonth = new Date(date)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      
      const [properties, transactions, revenue, profit] = await Promise.all([
        prisma.property.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextMonth
            }
          }
        }),
        
        prisma.transaction.count({
          where: {
            saleDate: {
              gte: date,
              lt: nextMonth
            }
          }
        }),
        
        prisma.transaction.aggregate({
          where: {
            saleDate: {
              gte: date,
              lt: nextMonth
            }
          },
          _sum: {
            salePrice: true,
            serviceFee: true
          }
        }),
        
        prisma.transaction.aggregate({
          where: {
            saleDate: {
              gte: date,
              lt: nextMonth
            }
          },
          _sum: {
            profit: true
          }
        })
      ])
      
      monthlyData.push({
        month: date.toLocaleDateString('az-AZ', { year: 'numeric', month: 'short' }),
        properties,
        transactions,
        revenue: Number(revenue._sum.salePrice || 0) + Number(revenue._sum.serviceFee || 0),
        profit: profit._sum.profit || 0
      })
    }

    return NextResponse.json(monthlyData)
  } catch (error) {
    console.error('Monthly analytics fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}