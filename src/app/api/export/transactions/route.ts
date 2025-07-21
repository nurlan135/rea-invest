import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const transactions = await prisma.transaction.findMany({
      include: {
        property: {
          include: {
            owner: true
          }
        },
        buyer: true,
        agent: {
          select: {
            fullName: true
          }
        },
        deposit: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const excelData = transactions.map((transaction: any, index: number) => {
      // Decimal tipləri number-ə çevir
      const repairExpense = transaction.repairExpense ? Number(transaction.repairExpense) : 0
      const documentationExpense = transaction.documentationExpense ? Number(transaction.documentationExpense) : 0
      const interestExpense = transaction.interestExpense ? Number(transaction.interestExpense) : 0
      const otherExpense = transaction.otherExpense ? Number(transaction.otherExpense) : 0
      
      const totalExpenses = repairExpense + documentationExpense + interestExpense + otherExpense

      return {
        '№': index + 1,
        'Əmlak (Sənəd №)': transaction.property.documentNumber,
        'Əmlak (Ünvan)': `${transaction.property.district}, ${transaction.property.streetAddress}`,
        'Sahib': `${transaction.property.owner.firstName} ${transaction.property.owner.lastName}`,
        'Agent': transaction.agent.fullName,
        'Alış Qiyməti (₼)': transaction.purchasePrice ? Number(transaction.purchasePrice).toString() : '',
        'Təmir Xərci (₼)': repairExpense.toString(),
        'Sənədləşmə Xərci (₼)': documentationExpense.toString(),
        'Faiz Xərci (₼)': interestExpense.toString(),
        'Digər Xərclər (₼)': otherExpense.toString(),
        'Ümumi Xərc (₼)': totalExpenses.toString(),
        'Satış Qiyməti (₼)': transaction.salePrice ? Number(transaction.salePrice).toString() : '',
        'Xidmət Haqqı (₼)': transaction.serviceFee ? Number(transaction.serviceFee).toString() : '',
        'Mənfəət (₼)': transaction.profit ? Number(transaction.profit).toString() : '',
        'Satış Tarixi': transaction.saleDate?.toLocaleDateString('az-AZ') || '',
        'Alıcı': transaction.buyer ? `${transaction.buyer.firstName} ${transaction.buyer.lastName}` : '',
        'Alıcı Telefon': transaction.buyer?.phone || '',
        'Depozit Məbləği (₼)': transaction.deposit?.amount ? Number(transaction.deposit.amount).toString() : '',
        'Depozit Tarixi': transaction.deposit?.depositDate?.toLocaleDateString('az-AZ') || '',
        'Depozit Son Tarix': transaction.deposit?.deadline?.toLocaleDateString('az-AZ') || '',
        'Alıcı Şirkət': transaction.purchasingEntity,
        'Yaradılma Tarixi': transaction.createdAt.toLocaleDateString('az-AZ')
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Əməliyyatlar')

    // Sütun genişlikləri
    worksheet['!cols'] = Array(23).fill({ wch: 15 })

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    const headers = new Headers()
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    headers.set('Content-Disposition', `attachment; filename="emeliyyatlar-${new Date().toISOString().split('T')[0]}.xlsx"`)

    return new Response(buffer, { headers })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}