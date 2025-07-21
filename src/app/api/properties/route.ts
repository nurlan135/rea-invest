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

    console.log('Properties API: Session valid, fetching properties...')

    // Highly optimized Prisma query - only select needed fields
    const properties = await prisma.property.findMany({
      select: {
        id: true,
        documentNumber: true,
        registrationDate: true,
        district: true,
        projectName: true,
        streetAddress: true,
        apartmentNumber: true,
        roomCount: true,
        area: true,
        floor: true,
        documentType: true,
        repairStatus: true,
        propertyType: true,
        purpose: true,
        status: true,
        lastFollowUpDate: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        agent: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        // Only include transaction basics for list view
        transaction: {
          select: {
            id: true,
            salePrice: true,
            profit: true,
            saleDate: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Add performance headers
    const response = NextResponse.json(properties)
    response.headers.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300')
    response.headers.set('X-Total-Count', properties.length.toString())
    
    return response
  } catch (error) {
    console.error('Properties fetch error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error
    })
    
    // Always return JSON response
    return NextResponse.json({ 
      error: 'Əmlaklar yüklənərkən xəta baş verdi',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

// Optimized POST for creating properties
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Use transaction for data consistency and performance
    const result = await prisma.$transaction(async (tx: any) => {
      // Auto-generate document number efficiently
      const lastProperty = await tx.property.findFirst({
        select: { id: true },
        orderBy: { id: 'desc' }
      })
      
      const nextNumber = lastProperty ? lastProperty.id + 1 : 1
      const documentNumber = `REA-${nextNumber.toString().padStart(4, '0')}`

      // Create property
      const property = await tx.property.create({
        data: {
          documentNumber,
          registrationDate: new Date(),
          district: body.district,
          projectName: body.projectName,
          streetAddress: body.streetAddress,
          apartmentNumber: body.apartmentNumber,
          roomCount: body.roomCount,
          area: parseFloat(body.area),
          floor: parseInt(body.floor),
          documentType: body.documentType,
          repairStatus: body.repairStatus,
          propertyType: body.propertyType,
          purpose: body.purpose,
          notes: body.notes,
          ownerId: parseInt(body.ownerId),
          agentId: parseInt(session.user.id)
        },
        select: {
          id: true,
          documentNumber: true,
          district: true,
          streetAddress: true,
          owner: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      })

      return property
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Property creation error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error
    })
    
    // Always return JSON response
    return NextResponse.json({ 
      error: 'Əmlak yaradılarkən xəta baş verdi',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}