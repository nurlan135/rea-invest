'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Property } from '@/types/property'
import { MapPin, Home, User, Phone, Calendar, FileText, Edit } from 'lucide-react'
import { format } from 'date-fns'
import { az } from 'date-fns/locale'

const statusColors = {
  YENI: 'bg-blue-500',
  GOZLEMEDE: 'bg-yellow-500', 
  BEH_VERILIB: 'bg-orange-500',
  SATILIB: 'bg-green-500',
  ICAREYE_VERILIB: 'bg-purple-500'
} as const

const statusLabels = {
  YENI: 'Yeni',
  GOZLEMEDE: 'Gözləmədə',
  BEH_VERILIB: 'Beh Verilib',
  SATILIB: 'Satılıb',
  ICAREYE_VERILIB: 'İcarəyə Verilib'
} as const

const documentTypeLabels = {
  CIXARIS: 'Çıxarış',
  MUQAVILE: 'Müqavilə',
  SERENCAM: 'Sərəncam'
} as const

const repairStatusLabels = {
  TEMIRLI: 'Təmirli',
  TEMIRSIZ: 'Təmirsiz'
} as const

const propertyTypeLabels = {
  MENZIL: 'Mənzil',
  HEYET_EVI: 'Həyət evi',
  OBYEKT: 'Obyekt',
  TORPAQ: 'Torpaq'
} as const

const purposeLabels = {
  SATIS: 'Satış',
  ICARE: 'İcarə'
} as const

interface PropertyViewProps {
  propertyId: string
  onEdit?: () => void
  onClose?: () => void
}

export function PropertyView({ propertyId, onEdit, onClose }: PropertyViewProps) {
  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties/${propertyId}`)
        if (!response.ok) {
          throw new Error('Əmlak məlumatları yüklənərkən xəta baş verdi')
        }
        const data: Property = await response.json()
        setProperty(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Xəta baş verdi')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProperty()
  }, [propertyId])

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent className="text-center py-12">
          <p className="text-gray-500">Məlumatlar yüklənir...</p>
        </CardContent>
      </Card>
    )
  }

  if (error || !property) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent className="text-center py-12">
          <p className="text-red-500">{error || 'Əmlak tapılmadı'}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* Başlıq */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">
                {property.documentNumber}
              </CardTitle>
              <CardDescription className="text-lg mt-1">
                {property.district}, {property.streetAddress}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge 
                className={`${statusColors[property.status as keyof typeof statusColors]} text-white`}
              >
                {statusLabels[property.status as keyof typeof statusLabels]}
              </Badge>
              {onEdit && (
                <Button size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Redaktə et
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Əmlak Məlumatları */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Əmlak Məlumatları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Rayon</label>
                <p className="font-medium">{property.district}</p>
              </div>
              {property.projectName && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Layihə</label>
                  <p className="font-medium">{property.projectName}</p>
                </div>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Ünvan</label>
              <p className="font-medium">{property.streetAddress}</p>
            </div>
            
            {property.apartmentNumber && (
              <div>
                <label className="text-sm font-medium text-gray-500">Mənzil/Ev nömrəsi</label>
                <p className="font-medium">{property.apartmentNumber}</p>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Otaq sayı</label>
                <p className="font-medium">{property.roomCount}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Sahə</label>
                <p className="font-medium">{property.area} m²</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Mərtəbə</label>
                <p className="font-medium">{property.floor}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Sənəd növü</label>
                <p className="font-medium">{documentTypeLabels[property.documentType as keyof typeof documentTypeLabels]}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Təmir vəziyyəti</label>
                <p className="font-medium">{repairStatusLabels[property.repairStatus as keyof typeof repairStatusLabels]}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Əmlak növü</label>
                <p className="font-medium">{propertyTypeLabels[property.propertyType as keyof typeof propertyTypeLabels]}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Təyinat</label>
                <p className="font-medium">{purposeLabels[property.purpose as keyof typeof purposeLabels]}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sahib Məlumatları */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Əmlak Sahibi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Ad Soyad</label>
              <p className="font-medium text-lg">
                {property.owner.firstName} {property.owner.lastName}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{property.owner.phone}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent və Tarixlər */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Məsul Agent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="font-medium text-lg">{property.agent.fullName}</p>
              <p className="text-sm text-gray-500">{property.agent.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Tarixlər
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Qeydiyyat tarixi</label>
              <p className="font-medium">
                {format(new Date(property.registrationDate), 'dd MMMM yyyy', { locale: az })}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Yaradılma tarixi</label>
              <p className="font-medium">
                {format(new Date(property.createdAt), 'dd MMMM yyyy, HH:mm', { locale: az })}
              </p>
            </div>
            
            {property.lastFollowUpDate && (
              <div>
                <label className="text-sm font-medium text-gray-500">Son əlaqə tarixi</label>
                <p className="font-medium">
                  {format(new Date(property.lastFollowUpDate), 'dd MMMM yyyy', { locale: az })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Əməliyyat Məlumatları */}
      {property.transaction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Əməliyyat Məlumatları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {property.transaction.purchasePrice && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Alış qiyməti</label>
                  <p className="font-medium text-lg">
                    {Number(property.transaction.purchasePrice).toLocaleString()} ₼
                  </p>
                </div>
              )}
              
              {property.transaction.salePrice && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Satış qiyməti</label>
                  <p className="font-medium text-lg text-green-600">
                    {Number(property.transaction.salePrice).toLocaleString()} ₼
                  </p>
                </div>
              )}
              
              {property.transaction.serviceFee && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Xidmət haqqı</label>
                  <p className="font-medium text-lg">
                    {Number(property.transaction.serviceFee).toLocaleString()} ₼
                  </p>
                </div>
              )}
              
              {property.transaction.profit && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Mənfəət</label>
                  <p className={`font-medium text-lg ${
                    Number(property.transaction.profit) > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Number(property.transaction.profit).toLocaleString()} ₼
                  </p>
                </div>
              )}
            </div>
            
            {property.transaction.saleDate && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-500">Satış tarixi</label>
                <p className="font-medium">
                  {format(new Date(property.transaction.saleDate), 'dd MMMM yyyy', { locale: az })}
                </p>
              </div>
            )}
            
            {property.transaction.buyer && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-500">Alıcı</label>
                <p className="font-medium">
                  {property.transaction.buyer.firstName} {property.transaction.buyer.lastName}
                </p>
                <p className="text-sm text-gray-500">{property.transaction.buyer.phone}</p>
              </div>
            )}
            
            {property.transaction.deposit && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Depozit Məlumatları</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <label className="text-yellow-700">Məbləğ</label>
                    <p className="font-medium text-yellow-900">
                      {Number(property.transaction.deposit.amount).toLocaleString()} ₼
                    </p>
                  </div>
                  <div>
                    <label className="text-yellow-700">Depozit tarixi</label>
                    <p className="font-medium text-yellow-900">
                      {format(new Date(property.transaction.deposit.depositDate), 'dd.MM.yyyy')}
                    </p>
                  </div>
                  <div>
                    <label className="text-yellow-700">Son tarix</label>
                    <p className={`font-medium ${
                      property.transaction.deposit.isExpired ? 'text-red-600' : 'text-yellow-900'
                    }`}>
                      {format(new Date(property.transaction.deposit.deadline), 'dd.MM.yyyy')}
                      {property.transaction.deposit.isExpired && ' (Vaxtı keçib)'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Qeydlər */}
      {property.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Qeydlər</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{property.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}