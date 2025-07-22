import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateContactSchema, idSchema } from '@/lib/validations'
import { ZodError } from 'zod'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'İcazə yoxdur' }, { status: 401 })
    }

    // Validate ID parameter
    const validatedId = idSchema.parse({ id })

    const contact = await prisma.contact.findUnique({
      where: { id: validatedId.id },
      include: {
        ownedProperties: {
          select: {
            id: true,
            documentNumber: true,
            district: true,
            streetAddress: true,
            status: true,
            area: true,
            propertyType: true
          }
        },
        boughtTransactions: {
          select: {
            id: true,
            salePrice: true,
            saleDate: true,
            profit: true,
            property: {
              select: {
                documentNumber: true,
                district: true,
                streetAddress: true
              }
            }
          }
        }
      }
    })

    if (!contact) {
      return NextResponse.json({ error: 'Müştəri tapılmadı' }, { status: 404 })
    }

    return NextResponse.json({ data: contact })
  } catch (error) {
    console.error('Contact fetch error:', error)
    
    if (error instanceof ZodError) {
      return NextResponse.json({
        error: 'Səhv ID formatı',
        details: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Daxili server xətası' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'İcazə yoxdur' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate request data
    const validatedData = updateContactSchema.parse({
      id,
      ...body
    })
    
    const { id: validatedId, ...updateData } = validatedData

    const contact = await prisma.contact.update({
      where: { id: validatedId },
      data: updateData,
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
      }
    })

    return NextResponse.json({
      message: 'Müştəri uğurla yeniləndi',
      data: contact
    })
  } catch (error) {
    console.error('Contact update error:', error)
    
    if (error instanceof ZodError) {
      return NextResponse.json({
        error: 'Validasiya xətası',
        details: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }, { status: 400 })
    }
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
      return NextResponse.json({ 
        error: 'Bu telefon nömrəsi ilə müştəri artıq mövcuddur' 
      }, { status: 409 })
    }
    
    // Handle record not found
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json({ 
        error: 'Müştəri tapılmadı' 
      }, { status: 404 })
    }
    
    return NextResponse.json({ error: 'Daxili server xətası' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'İcazə yoxdur' }, { status: 401 })
    }

    // Validate ID parameter
    const validatedId = idSchema.parse({ id })

    // Əvvəlcə bu müştərinin əmlakları və ya əməliyyatları olub-olmadığını yoxla
    const contact = await prisma.contact.findUnique({
      where: { id: validatedId.id },
      include: {
        ownedProperties: { select: { id: true } },
        boughtTransactions: { select: { id: true } }
      }
    })

    if (!contact) {
      return NextResponse.json({ error: 'Müştəri tapılmadı' }, { status: 404 })
    }

    // Əgər müştərinin əmlakları və ya əməliyyatları varsa, silməyə icazə vermə
    if (contact.ownedProperties.length > 0 || contact.boughtTransactions.length > 0) {
      return NextResponse.json({ 
        error: 'Bu müştərinin əlaqəli əmlak və ya əməliyyatları var. Əvvəlcə onları silin.',
        details: {
          properties: contact.ownedProperties.length,
          transactions: contact.boughtTransactions.length
        }
      }, { status: 400 })
    }

    await prisma.contact.delete({
      where: { id: validatedId.id }
    })

    return NextResponse.json({ message: 'Müştəri uğurla silindi' })
  } catch (error) {
    console.error('Contact delete error:', error)
    
    if (error instanceof ZodError) {
      return NextResponse.json({
        error: 'Səhv ID formatı',
        details: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Daxili server xətası' }, { status: 500 })
  }
}