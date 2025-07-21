'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Property } from '@/types/property'

const districts = [
  'Abşeron', 'Binəqədi', 'Xətai', 'Xəzər', 'Yasamal', 'Nizami', 
  'Nərimanov', 'Nəsimi', 'Sabunçu', 'Suraxanı', 'Səbail'
]

const roomCounts = ['1', '2', '2-dən 3-ə', '3', '3-dən 4-ə', '4', '5']

interface PropertyEditFormProps {
  propertyId: string
  onSuccess: () => void
  onCancel: () => void
}

export function PropertyEditForm({ propertyId, onSuccess, onCancel }: PropertyEditFormProps) {
  const [formData, setFormData] = useState({
    district: '',
    projectName: '',
    streetAddress: '',
    apartmentNumber: '',
    roomCount: '',
    area: '',
    floor: '',
    documentType: '',
    repairStatus: '',
    propertyType: '',
    purpose: '',
    notes: '',
    status: '',
    ownerFirstName: '',
    ownerLastName: '',
    ownerFatherName: '',
    ownerPhone: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties/${propertyId}`)
        if (!response.ok) {
          throw new Error('Əmlak məlumatları yüklənərkən xəta baş verdi')
        }
        const property: Property = await response.json()
        
        setFormData({
          district: property.district || '',
          projectName: property.projectName || '',
          streetAddress: property.streetAddress || '',
          apartmentNumber: property.apartmentNumber || '',
          roomCount: property.roomCount || '',
          area: property.area?.toString() || '',
          floor: property.floor?.toString() || '',
          documentType: property.documentType || '',
          repairStatus: property.repairStatus || '',
          propertyType: property.propertyType || '',
          purpose: property.purpose || '',
          notes: property.notes || '',
          status: property.status || '',
          ownerFirstName: property.owner?.firstName || '',
          ownerLastName: property.owner?.lastName || '',
          ownerFatherName: property.owner?.fatherName || '',
          ownerPhone: property.owner?.phone || ''
        })
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Xəta baş verdi')
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchProperty()
  }, [propertyId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Əmlak məlumatlarını yeniləyirik
      const propertyResponse = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district: formData.district,
          projectName: formData.projectName,
          streetAddress: formData.streetAddress,
          apartmentNumber: formData.apartmentNumber,
          roomCount: formData.roomCount,
          area: parseInt(formData.area),
          floor: parseInt(formData.floor),
          documentType: formData.documentType,
          repairStatus: formData.repairStatus,
          propertyType: formData.propertyType,
          purpose: formData.purpose,
          notes: formData.notes,
          status: formData.status,
          owner: {
            firstName: formData.ownerFirstName,
            lastName: formData.ownerLastName,
            fatherName: formData.ownerFatherName,
            phone: formData.ownerPhone
          }
        })
      })

      if (!propertyResponse.ok) {
        throw new Error('Əmlak yenilənərkən xəta baş verdi')
      }

      onSuccess()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Xəta baş verdi')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="text-center py-12">
          <p className="text-gray-500">Məlumatlar yüklənir...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Əmlakı Redaktə Et</CardTitle>
        <CardDescription>Əmlak məlumatlarını yeniləyin</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ünvan məlumatları */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Rayon</label>
              <Select value={formData.district} onValueChange={(value) => setFormData({...formData, district: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Rayon seçin" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map(district => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Layihə adı</label>
              <Input
                placeholder="Məsələn: 28 May"
                value={formData.projectName}
                onChange={(e) => setFormData({...formData, projectName: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Küçə ünvanı</label>
              <Input
                placeholder="Küçə adı"
                value={formData.streetAddress}
                onChange={(e) => setFormData({...formData, streetAddress: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Mənzil/Ev nömrəsi</label>
              <Input
                placeholder="Məsələn: 12A"
                value={formData.apartmentNumber}
                onChange={(e) => setFormData({...formData, apartmentNumber: e.target.value})}
              />
            </div>
          </div>

          {/* Əmlak məlumatları */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Otaq sayı</label>
              <Select value={formData.roomCount} onValueChange={(value) => setFormData({...formData, roomCount: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Otaq sayı" />
                </SelectTrigger>
                <SelectContent>
                  {roomCounts.map(count => (
                    <SelectItem key={count} value={count}>{count}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Sahə (m²)</label>
              <Input
                type="number"
                placeholder="90"
                value={formData.area}
                onChange={(e) => setFormData({...formData, area: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Mərtəbə</label>
              <Input
                type="number"
                placeholder="5"
                value={formData.floor}
                onChange={(e) => setFormData({...formData, floor: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Sənəd növü</label>
              <Select value={formData.documentType} onValueChange={(value) => setFormData({...formData, documentType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sənəd növü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CIXARIS">Çıxarış</SelectItem>
                  <SelectItem value="MUQAVILE">Müqavilə</SelectItem>
                  <SelectItem value="SERENCAM">Sərəncam</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Təmir vəziyyəti</label>
              <Select value={formData.repairStatus} onValueChange={(value) => setFormData({...formData, repairStatus: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Təmir vəziyyəti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEMIRLI">Təmirli</SelectItem>
                  <SelectItem value="TEMIRSIZ">Təmirsiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Əmlak növü</label>
              <Select value={formData.propertyType} onValueChange={(value) => setFormData({...formData, propertyType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Əmlak növü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MENZIL">Mənzil</SelectItem>
                  <SelectItem value="HEYET_EVI">Həyət evi</SelectItem>
                  <SelectItem value="OBYEKT">Obyekt</SelectItem>
                  <SelectItem value="TORPAQ">Torpaq</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Təyinat</label>
              <Select value={formData.purpose} onValueChange={(value) => setFormData({...formData, purpose: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Təyinat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SATIS">Satış</SelectItem>
                  <SelectItem value="ICARE">İcarə</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="YENI">Yeni</SelectItem>
                  <SelectItem value="GOZLEMEDE">Gözləmədə</SelectItem>
                  <SelectItem value="BEH_VERILIB">Beh Verilib</SelectItem>
                  <SelectItem value="SATILIB">Satılıb</SelectItem>
                  <SelectItem value="ICAREYE_VERILIB">İcarəyə Verilib</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sahib məlumatları */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Əmlak Sahibi Məlumatları</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Ad</label>
                <Input
                  placeholder="Ad"
                  value={formData.ownerFirstName}
                  onChange={(e) => setFormData({...formData, ownerFirstName: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Soyad</label>
                <Input
                  placeholder="Soyad"
                  value={formData.ownerLastName}
                  onChange={(e) => setFormData({...formData, ownerLastName: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Ata adı</label>
                <Input
                  placeholder="Ata adı"
                  value={formData.ownerFatherName}
                  onChange={(e) => setFormData({...formData, ownerFatherName: e.target.value})}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium">Telefon</label>
              <Input
                type="tel"
                placeholder="+994XX XXX XX XX"
                value={formData.ownerPhone}
                onChange={(e) => setFormData({...formData, ownerPhone: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Qeydlər</label>
            <Textarea
              placeholder="Əlavə qeydlər..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Yenilənir...' : 'Yenilə'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Ləğv et
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}