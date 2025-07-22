'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ContactSearch } from '@/components/contacts/contact-search'
import { invalidateCache } from '@/lib/cache'

const districts = [
  'Abşeron', 'Binəqədi', 'Xətai', 'Xəzər', 'Yasamal', 'Nizami', 
  'Nərimanov', 'Nəsimi', 'Sabunçu', 'Suraxanı', 'Səbail'
]

const roomCounts = ['1', '2', '2-dən 3-ə', '3', '3-dən 4-ə', '4', '5']

interface Contact {
  id: number
  firstName: string
  lastName: string
  fatherName?: string
  phone: string
  address?: string
  type: 'OWNER' | 'BUYER'
  displayName: string
  propertyCount: number
}

export function PropertyForm({ onSuccess }: { onSuccess: () => void }) {
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
    ownerFirstName: '',
    ownerLastName: '',
    ownerFatherName: '',
    ownerPhone: '',
    // Rental-specific fields
    rentAmount: '',
    depositAmount: '',
    availabilityDate: '',
    furnished: '',
    utilitiesIncluded: ''
  })
  const [selectedOwner, setSelectedOwner] = useState<Contact | null>(null)
  const [useExistingOwner, setUseExistingOwner] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      let ownerId: number

      if (useExistingOwner) {
        if (!selectedOwner) {
          setError('Mövcud sahibi seçin və ya yeni sahib yaradın')
          setIsLoading(false)
          return
        }
        ownerId = selectedOwner.id
      } else {
        // Create new owner
        const ownerResponse = await fetch('/api/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: formData.ownerFirstName,
            lastName: formData.ownerLastName,
            fatherName: formData.ownerFatherName,
            phone: formData.ownerPhone,
            type: 'OWNER'
          })
        })

        if (ownerResponse.status === 409) {
          // Handle duplicate phone number
          const errorData = await ownerResponse.json()
          const existingContact = errorData.existingContact
          setError(`Bu telefon nömrəsi artıq istifadə olunur: ${existingContact.firstName} ${existingContact.lastName}. Mövcud kontaktı seçin və ya telefon nömrəsini dəyişin.`)
          setIsLoading(false)
          return
        }

        if (!ownerResponse.ok) {
          const errorData = await ownerResponse.json()
          throw new Error(errorData.error || 'Sahib yaradılarkən xəta baş verdi')
        }

        const owner = await ownerResponse.json()
        ownerId = owner.id
      }

      // Create property
      const propertyResponse = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ownerId
        })
      })

      if (!propertyResponse.ok) {
        const errorData = await propertyResponse.json()
        throw new Error(errorData.error || 'Əmlak yaradılarkən xəta baş verdi')
      }

      // Invalidate caches to ensure fresh data
      invalidateCache('contacts') // Refresh customers list
      invalidateCache('properties') // Refresh properties list
      
      onSuccess()
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Xəta baş verdi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOwnerToggle = (useExisting: boolean) => {
    setUseExistingOwner(useExisting)
    setError('')
    if (!useExisting) {
      setSelectedOwner(null)
    }
  }

  const handleOwnerSelect = (contact: Contact | null) => {
    setSelectedOwner(contact)
    setError('')
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Yeni Əmlak Əlavə Et</CardTitle>
        <CardDescription>Əmlak məlumatlarını daxil edin</CardDescription>
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

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          {/* Rental-specific fields - only show when purpose is ICARE */}
          {formData.purpose === 'ICARE' && (
            <div className="border-t pt-4 space-y-4">
              <h3 className="font-medium text-blue-700">İcarə Məlumatları</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Aylıq kirayə (₼)</label>
                  <Input
                    type="number"
                    placeholder="500"
                    value={formData.rentAmount}
                    onChange={(e) => setFormData({...formData, rentAmount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Depozit məbləği (₼)</label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={formData.depositAmount}
                    onChange={(e) => setFormData({...formData, depositAmount: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Mövcudluq tarixi</label>
                  <Input
                    type="date"
                    value={formData.availabilityDate}
                    onChange={(e) => setFormData({...formData, availabilityDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Əşya vəziyyəti</label>
                  <Select value={formData.furnished} onValueChange={(value) => setFormData({...formData, furnished: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Əşya vəziyyəti" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULLY_FURNISHED">Tam əşyalı</SelectItem>
                      <SelectItem value="PARTIALLY_FURNISHED">Qismən əşyalı</SelectItem>
                      <SelectItem value="UNFURNISHED">Əşyasız</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Kommunal xərclər</label>
                <Select value={formData.utilitiesIncluded} onValueChange={(value) => setFormData({...formData, utilitiesIncluded: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kommunal xərclərin daxil olunması" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_INCLUDED">Hamısı daxildir</SelectItem>
                    <SelectItem value="PARTIAL_INCLUDED">Qismən daxildir</SelectItem>
                    <SelectItem value="NOT_INCLUDED">Daxil deyil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Sahib məlumatları */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Əmlak Sahibi Məlumatları</h3>
            
            {/* Owner selection toggle */}
            <div className="flex gap-2 mb-4">
              <Button
                type="button"
                size="sm"
                variant={useExistingOwner ? "outline" : "default"}
                onClick={() => handleOwnerToggle(false)}
              >
                Yeni Sahib Yarat
              </Button>
              <Button
                type="button"
                size="sm"
                variant={useExistingOwner ? "default" : "outline"}
                onClick={() => handleOwnerToggle(true)}
              >
                Mövcud Sahib Seç
              </Button>
            </div>

            {useExistingOwner ? (
              /* Contact search for existing owner */
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Mövcud Əmlak Sahibi</label>
                  <ContactSearch
                    onContactSelect={handleOwnerSelect}
                    selectedContact={selectedOwner}
                    placeholder="Ad, soyad və ya telefon ilə axtarın..."
                  />
                </div>
                {selectedOwner && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm font-medium text-green-800">
                      Seçilmiş sahib: {selectedOwner.displayName}
                    </p>
                    <p className="text-xs text-green-600">
                      Telefon: {selectedOwner.phone} | Əmlak sayı: {selectedOwner.propertyCount}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Manual owner creation fields */
              <div className="space-y-4">
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
                <div>
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
            )}
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

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Əlavə edilir...' : 'Əmlak Əlavə Et'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}