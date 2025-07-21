import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const transactionId = parseInt(params.id)
    
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

    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
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
        purchasingEntity: body.purchasingEntity || 'REA INVEST'
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

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Transaction update error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}