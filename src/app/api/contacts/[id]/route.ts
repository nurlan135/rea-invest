import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contact = await prisma.contact.findUnique({
      where: { id: parseInt(id) },
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

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    return NextResponse.json(contact)
  } catch (error) {
    console.error('Contact fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const contactId = parseInt(id)

    const contact = await prisma.contact.update({
      where: { id: contactId },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        fatherName: body.fatherName,
        phone: body.phone,
        address: body.address,
        type: body.type
      },
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

    return NextResponse.json(contact)
  } catch (error) {
    console.error('Contact update error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contactId = parseInt(id)

    // Əvvəlcə bu müştərinin əmlakları və ya əməliyyatları olub-olmadığını yoxla
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        ownedProperties: true,
        boughtTransactions: true
      }
    })

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    // Əgər müştərinin əmlakları və ya əməliyyatları varsa, silməyə icazə vermə
    if (contact.ownedProperties.length > 0 || contact.boughtTransactions.length > 0) {
      return NextResponse.json({ 
        error: 'Bu müştərinin əmlakları və ya əməliyyatları mövcuddur. Əvvəlcə onları silin.' 
      }, { status: 400 })
    }

    await prisma.contact.delete({
      where: { id: contactId }
    })

    return NextResponse.json({ message: 'Contact deleted successfully' })
  } catch (error) {
    console.error('Contact delete error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}