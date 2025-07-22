import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateUserSchema, idSchema } from '@/lib/validations'
import { ZodError } from 'zod'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'İcazə yoxdur' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate request data
    const validatedData = updateUserSchema.parse({
      id,
      ...body
    })
    
    const { id: validatedId, ...updateData } = validatedData

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: validatedId }
    })
    
    if (!existingUser) {
      return NextResponse.json({ error: 'İstifadəçi tapılmadı' }, { status: 404 })
    }

    // Don't allow admin to deactivate themselves
    if (validatedId === parseInt(session.user.id) && updateData.isActive === false) {
      return NextResponse.json({ 
        error: 'Özünüzü deaktiv edə bilməzsiniz' 
      }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: validatedId },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'İstifadəçi uğurla yeniləndi',
      data: updatedUser
    })
  } catch (error) {
    console.error('User update error:', error)
    
    if (error instanceof ZodError) {
      return NextResponse.json({
        error: 'Validasiya xətası',
        details: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }, { status: 400 })
    }
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
      return NextResponse.json({ 
        error: 'Bu email ünvanı ilə istifadəçi artıq mövcuddur' 
      }, { status: 409 })
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
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'İcazə yoxdur' }, { status: 403 })
    }

    // Validate ID parameter
    const validatedId = idSchema.parse({ id })

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: validatedId.id }
    })
    
    if (!existingUser) {
      return NextResponse.json({ error: 'İstifadəçi tapılmadı' }, { status: 404 })
    }

    // Don't allow admin to delete themselves
    if (validatedId.id === parseInt(session.user.id)) {
      return NextResponse.json({ 
        error: 'Özünüzü silə bilməzsiniz' 
      }, { status: 400 })
    }

    // Check if user has related data
    const relatedData = await prisma.user.findUnique({
      where: { id: validatedId.id },
      include: {
        properties: { select: { id: true } },
        transactions: { select: { id: true } }
      }
    })

    if (relatedData && (relatedData.properties.length > 0 || relatedData.transactions.length > 0)) {
      return NextResponse.json({
        error: 'Bu istifadəçinin əlaqəli məlumatları var. Əvvəlcə onları başqa istifadəçiyə köçürün.',
        details: {
          properties: relatedData.properties.length,
          transactions: relatedData.transactions.length
        }
      }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id: validatedId.id }
    })

    return NextResponse.json({ message: 'İstifadəçi uğurla silindi' })
  } catch (error) {
    console.error('User deletion error:', error)
    
    if (error instanceof ZodError) {
      return NextResponse.json({
        error: 'Səhv ID formatı',
        details: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Daxili server xətası' }, { status: 500 })
  }
}