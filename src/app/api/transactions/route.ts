import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const transactions = await prisma.transaction.findMany({
      include: {
        property: {
          include: {
            owner: true
          }
        },
        buyer: true,
        agent: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        deposit: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Transactions fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Mənfəət hesablanması
    const totalExpenses = (
      parseFloat(body.repairExpense || 0) +
      parseFloat(body.documentationExpense || 0) +
      parseFloat(body.interestExpense || 0) +
      parseFloat(body.otherExpense || 0)
    )
    
    const profit = body.salePrice ? 
      parseFloat(body.salePrice) + parseFloat(body.serviceFee || 0) - parseFloat(body.purchasePrice) - totalExpenses :
      null

    const transaction = await prisma.transaction.create({
      data: {
        propertyId: parseInt(body.propertyId),
        purchasePrice: body.purchasePrice ? parseFloat(body.purchasePrice) : null,
        repairExpense: body.repairExpense ? parseFloat(body.repairExpense) : 0,
        documentationExpense: body.documentationExpense ? parseFloat(body.documentationExpense) : 0,
        interestExpense: body.interestExpense ? parseFloat(body.interestExpense) : 0,
        otherExpense: body.otherExpense ? parseFloat(body.otherExpense) : 0,
        salePrice: body.salePrice ? parseFloat(body.salePrice) : null,
        serviceFee: body.serviceFee ? parseFloat(body.serviceFee) : null,
        saleDate: body.saleDate ? new Date(body.saleDate) : null,
        profit: profit,
        buyerId: body.buyerId ? parseInt(body.buyerId) : null,
        purchasingEntity: body.purchasingEntity || 'REA INVEST',
        agentId: parseInt(session.user.id)
      },
      include: {
        property: {
          include: {
            owner: true
          }
        },
        buyer: true,
        agent: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    })

    // Əgər satış tamamlanıbsa, əmlakın statusunu yenilə
    if (body.salePrice && body.saleDate) {
      await prisma.property.update({
        where: { id: parseInt(body.propertyId) },
        data: { 
          status: body.purpose === 'ICARE' ? 'ICAREYE_VERILIB' : 'SATILIB'
        }
      })
    }

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Transaction creation error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}