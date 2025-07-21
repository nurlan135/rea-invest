import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contacts = await prisma.contact.findMany({
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
      }
    })

    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Contacts fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Check for existing contact with same phone number
    const existingContact = await prisma.contact.findUnique({
      where: { phone: body.phone }
    })
    
    if (existingContact) {
      // Return 409 Conflict for duplicate phone number
      console.log('Contact with phone already exists:', existingContact.id)
      return NextResponse.json({ 
        error: 'Bu telefon nömrəsi ilə müştəri artıq mövcuddur',
        existingContact: {
          id: existingContact.id,
          firstName: existingContact.firstName,
          lastName: existingContact.lastName,
          phone: existingContact.phone
        }
      }, { status: 409 })
    }
    
    const contact = await prisma.contact.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        fatherName: body.fatherName,
        phone: body.phone,
        address: body.address,
        type: body.type
      }
    })

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error('Contact creation error:', error)
    
    // Handle unique constraint violations specifically
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
      return NextResponse.json({ 
        error: 'Bu telefon nömrəsi ilə müştəri artıq mövcuddur' 
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}