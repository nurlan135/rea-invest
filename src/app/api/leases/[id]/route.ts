import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/leases/[id] - Get specific lease
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
    
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        property: {
          include: {
            owner: true
          }
        },
        tenant: true,
        agent: true,
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
    }

    return NextResponse.json(lease)
  } catch (error) {
    console.error('Error fetching lease:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lease' },
      { status: 500 }
    )
  }
}

// PUT /api/leases/[id] - Update lease
export async function PUT(
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

    // Check if lease exists
    const existingLease = await prisma.lease.findUnique({
      where: { id: leaseId }
    })

    if (!existingLease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
    }

    const updatedLease = await prisma.lease.update({
      where: { id: leaseId },
      data: {
        ...body,
        updatedAt: new Date()
      },
      include: {
        property: {
          include: {
            owner: true
          }
        },
        tenant: true,
        agent: true,
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    return NextResponse.json(updatedLease)
  } catch (error) {
    console.error('Error updating lease:', error)
    return NextResponse.json(
      { error: 'Failed to update lease' },
      { status: 500 }
    )
  }
}

// DELETE /api/leases/[id] - Delete lease (or mark as terminated)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const leaseId = parseInt(params.id)

    // Check if lease exists
    const existingLease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { property: true }
    })

    if (!existingLease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
    }

    // Instead of deleting, mark lease as terminated
    const terminatedLease = await prisma.lease.update({
      where: { id: leaseId },
      data: {
        status: 'TERMINATED',
        updatedAt: new Date()
      }
    })

    // Update property status back to available for rent
    await prisma.property.update({
      where: { id: existingLease.propertyId },
      data: { status: 'YENI' }
    })

    return NextResponse.json({ message: 'Lease terminated successfully' })
  } catch (error) {
    console.error('Error terminating lease:', error)
    return NextResponse.json(
      { error: 'Failed to terminate lease' },
      { status: 500 }
    )
  }
}