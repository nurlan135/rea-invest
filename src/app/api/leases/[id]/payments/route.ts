import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/leases/[id]/payments - Get payments for a lease
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const leaseId = parseInt(params.id)
    
    // Verify lease exists
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId }
    })

    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
    }

    const payments = await prisma.rentPayment.findMany({
      where: { leaseId },
      orderBy: [
        { forYear: 'desc' },
        { forMonth: 'desc' }
      ],
      include: {
        lease: {
          include: {
            property: true,
            tenant: true
          }
        }
      }
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching rent payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rent payments' },
      { status: 500 }
    )
  }
}

// POST /api/leases/[id]/payments - Create new rent payment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const leaseId = parseInt(params.id)
    const body = await request.json()
    
    const {
      amount,
      paymentDate,
      forMonth,
      forYear,
      status = 'PAID',
      notes
    } = body

    // Validate required fields
    if (!amount || !paymentDate || !forMonth || !forYear) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, paymentDate, forMonth, forYear' },
        { status: 400 }
      )
    }

    // Verify lease exists and is active
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId }
    })

    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
    }

    if (lease.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cannot add payment to inactive lease' },
        { status: 400 }
      )
    }

    // Check if payment for this month/year already exists
    const existingPayment = await prisma.rentPayment.findFirst({
      where: {
        leaseId,
        forMonth: parseInt(forMonth),
        forYear: parseInt(forYear)
      }
    })

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Payment for this month already exists' },
        { status: 409 }
      )
    }

    // Create the payment
    const payment = await prisma.rentPayment.create({
      data: {
        leaseId,
        amount: parseFloat(amount),
        paymentDate: new Date(paymentDate),
        forMonth: parseInt(forMonth),
        forYear: parseInt(forYear),
        status,
        notes
      },
      include: {
        lease: {
          include: {
            property: true,
            tenant: true
          }
        }
      }
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Error creating rent payment:', error)
    return NextResponse.json(
      { error: 'Failed to create rent payment' },
      { status: 500 }
    )
  }
}