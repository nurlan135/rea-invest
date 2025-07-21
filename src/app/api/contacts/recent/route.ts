import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20)
    const type = searchParams.get('type') as 'OWNER' | 'BUYER' | null

    // Get recent contacts (created or updated recently)
    const contacts = await prisma.contact.findMany({
      where: {
        ...(type && { type })
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        fatherName: true,
        phone: true,
        address: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            ownedProperties: true
          }
        }
      },
      orderBy: [
        { updatedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    })

    // Transform the data to match frontend interface
    const formattedContacts = contacts.map(contact => {
      const displayName = [
        contact.firstName,
        contact.fatherName,
        contact.lastName
      ].filter(Boolean).join(' ')

      return {
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        fatherName: contact.fatherName,
        phone: contact.phone,
        address: contact.address,
        type: contact.type,
        displayName,
        propertyCount: contact._count.ownedProperties,
        isRecent: true
      }
    })

    return NextResponse.json(formattedContacts)
  } catch (error) {
    console.error('Recent contacts fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}