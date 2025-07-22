'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ContactSearch } from '@/components/contacts/contact-search'
import { Calendar, Home } from 'lucide-react'

interface Property {
  id: number
  documentNumber: string
  district: string
  streetAddress: string
  apartmentNumber?: string
  roomCount: string
  area: number
  owner: {
    firstName: string
    lastName: string
  }
}

interface Contact {
  id: number
  firstName: string
  lastName: string
  fatherName?: string
  phone: string
  address?: string
  type: 'OWNER' | 'BUYER' | 'TENANT'
  displayName: string
  propertyCount: number
}

export function LeaseForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    propertyId: '',
    tenantId: '',
    startDate: '',
    endDate: '',
    rentAmount: '',
    paymentDueDay: '1',
    depositAmount: '',
    notes: ''
  })
  
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [selectedTenant, setSelectedTenant] = useState<Contact | null>(null)
  const [useExistingTenant, setUseExistingTenant] = useState(true)
  const [newTenantData, setNewTenantData] = useState({
    firstName: '',
    lastName: '',
    fatherName: '',
    phone: '',
    address: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Load available rental properties on component mount
  useEffect(() => {
    fetchAvailableProperties()
  }, [])

  const fetchAvailableProperties = async () => {
    try {
      const response = await fetch('/api/properties?purpose=ICARE&status=YENI')
      if (response.ok) {
        const data = await response.json()
        setProperties(data.properties || data)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    }
  }

  const handlePropertyChange = (propertyId: string) => {
    setFormData({ ...formData, propertyId })
    const property = properties.find(p => p.id === parseInt(propertyId))
    setSelectedProperty(property || null)
  }

  const handleTenantToggle = (useExisting: boolean) => {
    setUseExistingTenant(useExisting)
    setError('')
    if (!useExisting) {
      setSelectedTenant(null)
    }
  }

  const handleTenantSelect = (contact: Contact | null) => {
    setSelectedTenant(contact)
    setError('')
    if (contact) {
      setFormData({ ...formData, tenantId: contact.id.toString() })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      let tenantId: number

      if (useExistingTenant) {
        if (!selectedTenant) {
          setError('Mövcud kirayəçini seçin və ya yeni kirayəçi yaradın')
          setIsLoading(false)
          return
        }
        tenantId = selectedTenant.id
      } else {
        // Create new tenant
        const tenantResponse = await fetch('/api/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newTenantData,
            type: 'TENANT'
          })
        })

        if (tenantResponse.status === 409) {
          const errorData = await tenantResponse.json()
          const existingContact = errorData.existingContact
          setError(`Bu telefon nömrəsi artıq istifadə olunur: ${existingContact.firstName} ${existingContact.lastName}`)
          setIsLoading(false)
          return
        }

        if (!tenantResponse.ok) {
          const errorData = await tenantResponse.json()
          throw new Error(errorData.error || 'Kirayəçi yaradılarkən xəta baş verdi')
        }

        const tenant = await tenantResponse.json()
        tenantId = tenant.id
      }

      // Create lease
      const leaseResponse = await fetch('/api/leases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tenantId,
          propertyId: parseInt(formData.propertyId),
          rentAmount: parseFloat(formData.rentAmount),
          paymentDueDay: parseInt(formData.paymentDueDay),
          depositAmount: formData.depositAmount ? parseFloat(formData.depositAmount) : null
        })
      })

      if (!leaseResponse.ok) {
        const errorData = await leaseResponse.json()
        throw new Error(errorData.error || 'İcarə müqaviləsi yaradılarkən xəta baş verdi')
      }

      onSuccess()
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Xəta baş verdi')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="w-5 h-5" />
          Yeni İcarə Müqaviləsi
        </CardTitle>
        <CardDescription>
          Əmlak üçün kirayəçi ilə müqavilə bağlayın
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Selection */}
          <div className="space-y-4">
            <h3 className="font-medium text-blue-700">Əmlak Seçimi</h3>
            <div>
              <label className="text-sm font-medium">İcarəyə verilən əmlak</label>
              <Select value={formData.propertyId} onValueChange={handlePropertyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Əmlak seçin" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map(property => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.documentNumber} - {property.district}, {property.streetAddress}
                      {property.apartmentNumber && ` ${property.apartmentNumber}`}
                      ({property.roomCount} otaq, {property.area}m²)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedProperty && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-medium text-blue-800">
                  Seçilmiş əmlak: {selectedProperty.documentNumber}
                </p>
                <p className="text-xs text-blue-600">
                  {selectedProperty.district}, {selectedProperty.streetAddress} | 
                  {selectedProperty.roomCount} otaq, {selectedProperty.area}m² | 
                  Sahib: {selectedProperty.owner.firstName} {selectedProperty.owner.lastName}
                </p>
              </div>
            )}
          </div>

          {/* Tenant Selection */}
          <div className="border-t pt-4 space-y-4">
            <h3 className="font-medium text-blue-700">Kirayəçi Məlumatları</h3>
            
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={useExistingTenant ? "default" : "outline"}
                onClick={() => handleTenantToggle(true)}
              >
                Mövcud Kirayəçi Seç
              </Button>
              <Button
                type="button"
                size="sm"
                variant={useExistingTenant ? "outline" : "default"}
                onClick={() => handleTenantToggle(false)}
              >
                Yeni Kirayəçi Yarat
              </Button>
            </div>

            {useExistingTenant ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Mövcud Kirayəçi</label>
                  <ContactSearch
                    onContactSelect={handleTenantSelect}
                    selectedContact={selectedTenant}
                    placeholder="Ad, soyad və ya telefon ilə axtarın..."
                    filterType="TENANT"
                  />
                </div>
                {selectedTenant && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm font-medium text-green-800">
                      Seçilmiş kirayəçi: {selectedTenant.displayName}
                    </p>
                    <p className="text-xs text-green-600">
                      Telefon: {selectedTenant.phone}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Ad</label>
                    <Input
                      placeholder="Ad"
                      value={newTenantData.firstName}
                      onChange={(e) => setNewTenantData({...newTenantData, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Soyad</label>
                    <Input
                      placeholder="Soyad"
                      value={newTenantData.lastName}
                      onChange={(e) => setNewTenantData({...newTenantData, lastName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Ata adı</label>
                    <Input
                      placeholder="Ata adı"
                      value={newTenantData.fatherName}
                      onChange={(e) => setNewTenantData({...newTenantData, fatherName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Telefon</label>
                    <Input
                      type="tel"
                      placeholder="+994XX XXX XX XX"
                      value={newTenantData.phone}
                      onChange={(e) => setNewTenantData({...newTenantData, phone: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Ünvan</label>
                    <Input
                      placeholder="Yaşayış ünvanı"
                      value={newTenantData.address}
                      onChange={(e) => setNewTenantData({...newTenantData, address: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lease Terms */}
          <div className="border-t pt-4 space-y-4">
            <h3 className="font-medium text-blue-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Müqavilə Şərtləri
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Müqavilə başlama tarixi</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Müqavilə bitmə tarixi</label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Aylıq kirayə (₼)</label>
                <Input
                  type="number"
                  placeholder="500"
                  value={formData.rentAmount}
                  onChange={(e) => setFormData({...formData, rentAmount: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Ödəniş günü</label>
                <Select 
                  value={formData.paymentDueDay} 
                  onValueChange={(value) => setFormData({...formData, paymentDueDay: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

            <div>
              <label className="text-sm font-medium">Əlavə qeydlər</label>
              <Textarea
                placeholder="Müqavilə şərtləri və ya digər qeydlər..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading || !formData.propertyId || (!selectedTenant && useExistingTenant)}>
            {isLoading ? 'Müqavilə yaradılır...' : 'İcarə Müqaviləsi Yarat'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}