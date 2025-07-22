import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/leases - Get all leases
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const agentId = searchParams.get('agentId')

    const where: any = {}
    
    if (status) {
      where.status = status
    }

    if (agentId) {
      where.agentId = parseInt(agentId)
    }

    const leases = await prisma.lease.findMany({
      where,
      include: {
        property: {
          include: {
            owner: true
          }
        },
        tenant: true,
        agent: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 3 // Get latest 3 payments for overview
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(leases)
  } catch (error) {
    console.error('Error fetching leases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leases' },
      { status: 500 }
    )
  }
}

// POST /api/leases - Create new lease
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      propertyId,
      tenantId,
      startDate,
      endDate,
      rentAmount,
      paymentDueDay,
      depositAmount
    } = body

    // Validate required fields
    if (!propertyId || !tenantId || !startDate || !endDate || !rentAmount || !paymentDueDay) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if property already has an active lease
    const existingLease = await prisma.lease.findFirst({
      where: {
        propertyId: parseInt(propertyId),
        status: 'ACTIVE'
      }
    })

    if (existingLease) {
      return NextResponse.json(
        { error: 'Property already has an active lease' },
        { status: 409 }
      )
    }

    // Create the lease
    const lease = await prisma.lease.create({
      data: {
        propertyId: parseInt(propertyId),
        tenantId: parseInt(tenantId),
        agentId: parseInt(session.user.id),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rentAmount: parseFloat(rentAmount),
        paymentDueDay: parseInt(paymentDueDay),
        depositAmount: depositAmount ? parseFloat(depositAmount) : null,
        status: 'ACTIVE'
      },
      include: {
        property: {
          include: {
            owner: true
          }
        },
        tenant: true,
        agent: true
      }
    })

    // Update property status to ICAREYE_VERILIB
    await prisma.property.update({
      where: { id: parseInt(propertyId) },
      data: { status: 'ICAREYE_VERILIB' }
    })

    return NextResponse.json(lease, { status: 201 })
  } catch (error) {
    console.error('Error creating lease:', error)
    return NextResponse.json(
      { error: 'Failed to create lease' },
      { status: 500 }
    )
  }
}