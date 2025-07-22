import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPropertySchema, propertyQuerySchema } from '@/lib/validations'
import { withErrorHandling, createAuthError } from '@/lib/error-handler'

export const GET = withErrorHandling(async (request: NextRequest) => {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    throw createAuthError()
  }

  // Validate query parameters
  const { searchParams } = new URL(request.url)
  const queryParams = Object.fromEntries(searchParams.entries())
  
  const validatedQuery = propertyQuerySchema.parse(queryParams)
  const { search, district, propertyType, purpose, status, minArea, maxArea, page = 1, limit = 10 } = validatedQuery || {}
  
  // Build where condition  
  const where: Record<string, unknown> = {}
  
  if (search) {
    where.OR = [
      { district: { contains: search, mode: 'insensitive' } },
      { streetAddress: { contains: search, mode: 'insensitive' } },
      { documentNumber: { contains: search, mode: 'insensitive' } },
      { projectName: { contains: search, mode: 'insensitive' } }
    ]
  }
  
  if (district) where.district = district
  if (propertyType) where.propertyType = propertyType
  if (purpose) where.purpose = purpose
  if (status) where.status = status
  
  if (minArea !== undefined || maxArea !== undefined) {
    where.area = {}
    if (minArea !== undefined) where.area.gte = minArea
    if (maxArea !== undefined) where.area.lte = maxArea
  }

  console.log('Properties API: Session valid, fetching properties...')

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
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
      },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.property.count({ where })
  ])

  return NextResponse.json({
    data: properties,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }, {
    headers: {
      'Cache-Control': 'public, max-age=120, stale-while-revalidate=300',
      'X-Total-Count': total.toString()
    }
  })
})

// Optimized POST for creating properties
export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    throw createAuthError()
  }

  const body = await request.json()
  
  // Validate request body
  const validatedData = createPropertySchema.parse(body)
  
  // Use transaction for data consistency and performance
  const result = await prisma.$transaction(async (tx) => {
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
        ...validatedData,
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

  return NextResponse.json({
    message: 'Əmlak uğurla yaradıldı',
    data: result
  }, { status: 201 })
})