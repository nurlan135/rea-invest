import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')

    let whereClause: any = {}

    // Phone number search (exact match)
    if (phone) {
      whereClause.phone = phone
    }
    
    // General search by name or phone (partial match)
    if (query) {
      whereClause.OR = [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query } }
      ]
    }

    // If no search parameters, return empty result
    if (!phone && !query) {
      return NextResponse.json([])
    }

    const contacts = await prisma.contact.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        fatherName: true,
        phone: true,
        address: true,
        type: true,
        createdAt: true,
        // Include property count for context
        _count: {
          select: {
            ownedProperties: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ],
      take: limit
    })

    // Transform data to include display name and property count
    const transformedContacts = contacts.map(contact => ({
      ...contact,
      displayName: `${contact.firstName} ${contact.lastName}${contact.fatherName ? ` (${contact.fatherName})` : ''}`,
      propertyCount: contact._count.ownedProperties
    }))

    return NextResponse.json(transformedContacts)
  } catch (error) {
    console.error('Contact search error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}