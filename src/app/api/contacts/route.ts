import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createContactSchema, contactQuerySchema } from '@/lib/validations'
import { withErrorHandling, createAuthError, createConflictError } from '@/lib/error-handler'

export const GET = withErrorHandling(async (request: NextRequest) => {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    throw createAuthError()
  }

    // Validate query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const validatedQuery = contactQuerySchema.parse(queryParams)
    const { search, type, page = 1, limit = 10 } = validatedQuery || {}
    
    // Build where condition
    const where: Record<string, unknown> = {}
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ]
    }
    
    if (type) {
      where.type = type
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: {
          ownedProperties: {
            select: {
              id: true,
              documentNumber: true,
              district: true,
              streetAddress: true,
              status: true
            }
          },
          boughtTransactions: {
            select: {
              id: true,
              salePrice: true,
              saleDate: true,
              property: {
                select: {
                  documentNumber: true,
                  district: true,
                  streetAddress: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.contact.count({ where })
    ])

  return NextResponse.json({
    data: contacts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  })
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    throw createAuthError()
  }

    const body = await request.json()
    
    // Validate request body
    const validatedData = createContactSchema.parse(body)
    
    // Check for existing contact with same phone number
    const existingContact = await prisma.contact.findUnique({
      where: { phone: validatedData.phone }
    })
    
    if (existingContact) {
      throw createConflictError('Bu telefon nömrəsi ilə müştəri artıq mövcuddur')
    }
    
    const contact = await prisma.contact.create({
      data: validatedData
    })

  return NextResponse.json({
    message: 'Müştəri uğurla yaradıldı',
    data: contact
  }, { status: 201 })
})