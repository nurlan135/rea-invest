import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const property = await prisma.property.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        owner: true,
        agent: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        transaction: {
          include: {
            buyer: true,
            deposit: true
          }
        }
      }
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error('Property fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

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
    const propertyId = parseInt(params.id)

    // Transaction istifadə edərək əmlak və sahib məlumatlarını yeniləyirik
    const result = await prisma.$transaction(async (tx: any) => {
      // Əvvəlcə əmlakı tapırıq
      const existingProperty = await tx.property.findUnique({
        where: { id: propertyId },
        include: { owner: true }
      })

      if (!existingProperty) {
        throw new Error('Property not found')
      }

      // Sahib məlumatlarını yeniləyirik
      if (body.owner) {
        await tx.contact.update({
          where: { id: existingProperty.ownerId },
          data: {
            firstName: body.owner.firstName,
            lastName: body.owner.lastName,
            fatherName: body.owner.fatherName,
            phone: body.owner.phone
          }
        })
      }

      // Əmlak məlumatlarını yeniləyirik
      const updatedProperty = await tx.property.update({
        where: { id: propertyId },
        data: {
          district: body.district,
          projectName: body.projectName,
          streetAddress: body.streetAddress,
          apartmentNumber: body.apartmentNumber,
          roomCount: body.roomCount,
          area: body.area ? parseFloat(body.area.toString()) : undefined,
          floor: body.floor ? parseInt(body.floor.toString()) : undefined,
          documentType: body.documentType,
          repairStatus: body.repairStatus,
          propertyType: body.propertyType,
          purpose: body.purpose,
          status: body.status,
          notes: body.notes,
          lastFollowUpDate: body.lastFollowUpDate ? new Date(body.lastFollowUpDate) : null
        },
        include: {
          owner: true,
          agent: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          transaction: {
            include: {
              buyer: true,
              deposit: true
            }
          }
        }
      })

      return updatedProperty
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Property update error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const propertyId = parseInt(params.id)

    // Əvvəlcə əlaqəli transaction-ları yoxla
    const existingTransaction = await prisma.transaction.findFirst({
      where: { propertyId }
    })

    if (existingTransaction) {
      return NextResponse.json({ 
        error: 'Bu əmlakla əlaqəli əməliyyat mövcuddur. Əvvəlcə əməliyyatı silin.' 
      }, { status: 400 })
    }

    await prisma.property.delete({
      where: { id: propertyId }
    })

    return NextResponse.json({ message: 'Property deleted successfully' })
  } catch (error) {
    console.error('Property delete error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}