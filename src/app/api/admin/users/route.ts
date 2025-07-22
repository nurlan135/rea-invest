import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createUserSchema, userQuerySchema } from '@/lib/validations'
import { ZodError } from 'zod'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'İcazə yoxdur' }, { status: 403 })
    }

    // Validate query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const validatedQuery = userQuerySchema.parse(queryParams)
    const { search, role, isActive, page = 1, limit = 10 } = validatedQuery || {}
    
    // Build where condition
    const where: Record<string, any> = {}
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (role) where.role = role
    if (isActive !== undefined) where.isActive = isActive

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              properties: true,
              transactions: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Users fetch error:', error)
    
    if (error instanceof ZodError) {
      return NextResponse.json({
        error: 'Validasiya xətası',
        details: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Daxili server xətası' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'İcazə yoxdur' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = createUserSchema.parse(body)
    
    // Check for existing user with same email
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUser) {
      return NextResponse.json({ 
        error: 'Bu email ünvanı ilə istifadəçi artıq mövcuddur'
      }, { status: 409 })
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: 'İstifadəçi uğurla yaradıldı',
      data: user
    }, { status: 201 })
  } catch (error) {
    console.error('User creation error:', error)
    
    if (error instanceof ZodError) {
      return NextResponse.json({
        error: 'Validasiya xətası',
        details: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Daxili server xətası' }, { status: 500 })
  }
}