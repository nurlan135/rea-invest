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

    // Bütün əmlakları əlaqəli məlumatlarla gətir
    const properties = await prisma.property.findMany({
      include: {
        owner: true,
        agent: {
          select: {
            fullName: true,
            email: true
          }
        },
        transaction: {
          include: {
            buyer: true,
            deposit: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Excel üçün formatla
    const excelData = properties.map((property: any, index: number) => ({
      '№': index + 1,
      'Sənəd Nömrəsi': property.documentNumber,
      'Qeydiyyat Tarixi': property.registrationDate.toLocaleDateString('az-AZ'),
      'Rayon': property.district,
      'Layihə': property.projectName || '',
      'Ünvan': property.streetAddress,
      'Mənzil/Ev №': property.apartmentNumber || '',
      'Otaq Sayı': property.roomCount,
      'Sahə (m²)': property.area,
      'Mərtəbə': property.floor,
      'Sənəd Növü': property.documentType,
      'Təmir Vəziyyəti': property.repairStatus,
      'Əmlak Növü': property.propertyType,
      'Təyinat': property.purpose,
      'Status': property.status,
      'Sahib (Ad)': property.owner.firstName,
      'Sahib (Soyad)': property.owner.lastName,
      'Sahib (Ata adı)': property.owner.fatherName || '',
      'Sahib (Telefon)': property.owner.phone,
      'Agent': property.agent.fullName,
      'Alış Qiyməti': property.transaction?.purchasePrice ? Number(property.transaction.purchasePrice).toString() : '',
      'Satış Qiyməti': property.transaction?.salePrice ? Number(property.transaction.salePrice).toString() : '',
      'Xidmət Haqqı': property.transaction?.serviceFee ? Number(property.transaction.serviceFee).toString() : '',
      'Mənfəət': property.transaction?.profit ? Number(property.transaction.profit).toString() : '',
      'Satış Tarixi': property.transaction?.saleDate?.toLocaleDateString('az-AZ') || '',
      'Alıcı (Ad)': property.transaction?.buyer?.firstName || '',
      'Alıcı (Soyad)': property.transaction?.buyer?.lastName || '',
      'Alıcı (Telefon)': property.transaction?.buyer?.phone || '',
      'Depozit Məbləği': property.transaction?.deposit?.amount ? Number(property.transaction.deposit.amount).toString() : '',
      'Depozit Tarixi': property.transaction?.deposit?.depositDate?.toLocaleDateString('az-AZ') || '',
      'Depozit Son Tarixi': property.transaction?.deposit?.deadline?.toLocaleDateString('az-AZ') || '',
      'Son Əlaqə Tarixi': property.lastFollowUpDate?.toLocaleDateString('az-AZ') || '',
      'Qeydlər': property.notes || ''
    }))

    // Excel faylı yarat
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Əmlaklar')

    // Sütun genişliklərini təyin et
    const columnWidths = [
      { wch: 5 },   // №
      { wch: 12 },  // Sənəd Nömrəsi
      { wch: 12 },  // Qeydiyyat Tarixi
      { wch: 15 },  // Rayon
      { wch: 20 },  // Layihə
      { wch: 30 },  // Ünvan
      { wch: 10 },  // Mənzil/Ev №
      { wch: 10 },  // Otaq Sayı
      { wch: 10 },  // Sahə
      { wch: 10 },  // Mərtəbə
      { wch: 12 },  // Sənəd Növü
      { wch: 12 },  // Təmir Vəziyyəti
      { wch: 12 },  // Əmlak Növü
      { wch: 10 },  // Təyinat
      { wch: 15 },  // Status
      { wch: 15 },  // Sahib (Ad)
      { wch: 15 },  // Sahib (Soyad)
      { wch: 15 },  // Sahib (Ata adı)
      { wch: 15 },  // Sahib (Telefon)
      { wch: 20 },  // Agent
      { wch: 12 },  // Alış Qiyməti
      { wch: 12 },  // Satış Qiyməti
      { wch: 12 },  // Xidmət Haqqı
      { wch: 12 },  // Mənfəət
      { wch: 12 },  // Satış Tarixi
      { wch: 15 },  // Alıcı (Ad)
      { wch: 15 },  // Alıcı (Soyad)
      { wch: 15 },  // Alıcı (Telefon)
      { wch: 12 },  // Depozit Məbləği
      { wch: 12 },  // Depozit Tarixi
      { wch: 12 },  // Depozit Son Tarixi
      { wch: 12 },  // Son Əlaqə Tarixi
      { wch: 30 }   // Qeydlər
    ]
    worksheet['!cols'] = columnWidths

    // Buffer-ə çevir
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Response headers
    const headers = new Headers()
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    headers.set('Content-Disposition', `attachment; filename="emlak-siyahisi-${new Date().toISOString().split('T')[0]}.xlsx"`)

    return new Response(buffer, { headers })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}