'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CreateContactRequest, Contact } from '@/types/customer'

interface CustomerFormProps {
  onSuccess: () => void
  initialData?: Partial<CreateContactRequest>
  editMode?: boolean
  customerId?: number
}

export function CustomerForm({ onSuccess, initialData, editMode = false, customerId }: CustomerFormProps) {
  const [formData, setFormData] = useState<CreateContactRequest>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    fatherName: initialData?.fatherName || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    type: initialData?.type || 'OWNER'
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Form validasiyası
    if (!formData.firstName.trim()) {
      setError('Ad sahəsi mütləqdir')
      setIsLoading(false)
      return
    }

    if (!formData.lastName.trim()) {
      setError('Soyad sahəsi mütləqdir')
      setIsLoading(false)
      return
    }

    if (!formData.phone.trim()) {
      setError('Telefon nömrəsi mütləqdir')
      setIsLoading(false)
      return
    }

    // Telefon nömrəsi formatını yoxla
    const phoneRegex = /^\+994[0-9]{9}$/
    if (!phoneRegex.test(formData.phone)) {
      setError('Telefon nömrəsi +994XXXXXXXXX formatında olmalıdır')
      setIsLoading(false)
      return
    }

    try {
      const url = editMode ? `/api/contacts/${customerId}` : '/api/contacts'
      const method = editMode ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.status === 409 && !editMode) {
        // Handle duplicate phone number for new contacts only
        const errorData = await response.json()
        const existingCustomer = errorData.existingContact
        setError(`Bu telefon nömrəsi artıq istifadə olunur: ${existingCustomer.firstName} ${existingCustomer.lastName} (${existingCustomer.phone})`)
        setIsLoading(false)
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = editMode ? 'Müştəri yenilənərkən xəta baş verdi' : 'Müştəri yaradılarkən xəta baş verdi'
        throw new Error(errorData.error || errorMessage)
      }

      onSuccess()
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Xəta baş verdi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateContactRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('') // Clear error when user starts typing
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editMode ? 'Müştəri Məlumatlarını Redaktə Et' : 'Müştəri Məlumatları'}</CardTitle>
        <CardDescription>
          {editMode ? 'Müştəri məlumatlarını yeniləmək üçün aşağıdakı sahələri dəyişin' : 'Yeni müştəri əlavə etmək üçün aşağıdakı sahələri doldurun'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Ad *</label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Müştərinin adı"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Soyad *</label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Müştərinin soyadı"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Ata adı</label>
            <Input
              value={formData.fatherName}
              onChange={(e) => handleInputChange('fatherName', e.target.value)}
              placeholder="Müştərinin ata adı (ixtiyari)"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Telefon nömrəsi *</label>
            <Input
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+994XXXXXXXXX"
              required
            />
            <p className="text-xs text-gray-500">
              Nümunə: +994501234567
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Ünvan</label>
            <Input
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Ünvanı daxil edin"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Müştəri növü *</label>
            <Select 
              value={formData.type} 
              onValueChange={(value: 'OWNER' | 'BUYER') => handleInputChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Müştəri növünü seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OWNER">Əmlak Sahibi</SelectItem>
                <SelectItem value="BUYER">Alıcı</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading 
                ? (editMode ? 'Yenilənir...' : 'Əlavə edilir...') 
                : (editMode ? 'Məlumatları Yenilə' : 'Müştəri Əlavə Et')
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}