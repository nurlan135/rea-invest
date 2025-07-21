'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'

export function TransactionForm({ 
  propertyId, 
  onSuccess 
}: { 
  propertyId?: number
  onSuccess: () => void 
}) {
  const [formData, setFormData] = useState({
    propertyId: propertyId?.toString() || '',
    purchasePrice: '',
    repairExpense: '',
    documentationExpense: '',
    interestExpense: '',
    otherExpense: '',
    salePrice: '',
    serviceFee: '',
    saleDate: null as Date | null,
    purchasingEntity: 'REA INVEST',
    buyerFirstName: '',
    buyerLastName: '',
    buyerFatherName: '',
    buyerPhone: ''
  })
  
  const [properties, setProperties] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [estimatedProfit, setEstimatedProfit] = useState(0)
  const router = useRouter()

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    // Ümumi xərcləri hesabla
    const expenses = [
      formData.repairExpense,
      formData.documentationExpense,
      formData.interestExpense,
      formData.otherExpense
    ].reduce((sum, expense) => sum + (parseFloat(expense) || 0), 0)
    
    setTotalExpenses(expenses)

    // Mənfəət hesabla
    if (formData.purchasePrice && formData.salePrice) {
      const profit = parseFloat(formData.salePrice) + 
                    (parseFloat(formData.serviceFee) || 0) - 
                    parseFloat(formData.purchasePrice) - 
                    expenses
      setEstimatedProfit(profit)
    }
  }, [formData])

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/properties')
      if (response.ok) {
        const data = await response.json()
        setProperties(data.filter((p: any) => !p.transaction && p.status !== 'SATILIB'))
      }
    } catch (error) {
      console.error('Properties fetch error:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      let buyerId = null

      // Əgər alıcı məlumatları varsa, alıcını yarat
      if (formData.buyerFirstName && formData.buyerPhone) {
        const buyerResponse = await fetch('/api/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: formData.buyerFirstName,
            lastName: formData.buyerLastName,
            fatherName: formData.buyerFatherName,
            phone: formData.buyerPhone,
            type: 'BUYER'
          })
        })

        if (buyerResponse.ok) {
          const buyer = await buyerResponse.json()
          buyerId = buyer.id
        }
      }

      // Transaction yarat
      const transactionResponse = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          buyerId,
          saleDate: formData.saleDate?.toISOString()
        })
      })

      if (!transactionResponse.ok) {
        throw new Error('Əməliyyat yaradılarkən xəta baş verdi')
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
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Yeni Əməliyyat</CardTitle>
        <CardDescription>Maliyyə əməliyyatı məlumatlarını daxil edin</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Əmlak seçimi */}
          {!propertyId && (
            <div>
              <label className="text-sm font-medium">Əmlak</label>
              <Select value={formData.propertyId} onValueChange={(value: string) => setFormData({...formData, propertyId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Əmlak seçin" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property: any) => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.documentNumber} - {property.district}, {property.streetAddress}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Alış məlumatları */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Alış Məlumatları</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Alış qiyməti (₼)</label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Alıcı şirkət</label>
                <Select value={formData.purchasingEntity} onValueChange={(value: string) => setFormData({...formData, purchasingEntity: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REA INVEST">REA INVEST</SelectItem>
                    <SelectItem value="Filial">Filial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Xərclər */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Tələb Olunan Xərclər</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Təmir xərci (₼)</label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={formData.repairExpense}
                  onChange={(e) => setFormData({...formData, repairExpense: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Sənədləşmə xərci (₼)</label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={formData.documentationExpense}
                  onChange={(e) => setFormData({...formData, documentationExpense: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Faiz xərci (₼)</label>
                <Input
                  type="number"
                  placeholder="2000"
                  value={formData.interestExpense}
                  onChange={(e) => setFormData({...formData, interestExpense: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Digər xərclər (₼)</label>
                <Input
                  type="number"
                  placeholder="500"
                  value={formData.otherExpense}
                  onChange={(e) => setFormData({...formData, otherExpense: e.target.value})}
                />
              </div>
            </div>
            <div className="mt-4 text-right">
              <span className="text-sm text-gray-600">Ümumi xərc: </span>
              <span className="font-medium">₼{totalExpenses.toLocaleString()}</span>
            </div>
          </div>

          {/* Satış məlumatları */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Satış Məlumatları (İxtiyari)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Satış qiyməti (₼)</label>
                <Input
                  type="number"
                  placeholder="65000"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({...formData, salePrice: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Xidmət haqqı (₼)</label>
                <Input
                  type="number"
                  placeholder="3000"
                  value={formData.serviceFee}
                  onChange={(e) => setFormData({...formData, serviceFee: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Satış tarixi</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.saleDate ? format(formData.saleDate, 'dd/MM/yyyy') : 'Tarix seçin'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.saleDate || undefined}
                      onSelect={(date: Date | undefined) => setFormData({...formData, saleDate: date || null})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {formData.salePrice && formData.purchasePrice && (
              <div className="mt-4 text-right">
                <span className="text-sm text-gray-600">Təxmini mənfəət: </span>
                <span className={`font-medium ${estimatedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₼{estimatedProfit.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Alıcı məlumatları */}
          {formData.salePrice && (
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">Alıcı Məlumatları</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Ad</label>
                  <Input
                    placeholder="Ad"
                    value={formData.buyerFirstName}
                    onChange={(e) => setFormData({...formData, buyerFirstName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Soyad</label>
                  <Input
                    placeholder="Soyad"
                    value={formData.buyerLastName}
                    onChange={(e) => setFormData({...formData, buyerLastName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Ata adı</label>
                  <Input
                    placeholder="Ata adı"
                    value={formData.buyerFatherName}
                    onChange={(e) => setFormData({...formData, buyerFatherName: e.target.value})}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium">Telefon</label>
                <Input
                  type="tel"
                  placeholder="+994XX XXX XX XX"
                  value={formData.buyerPhone}
                  onChange={(e) => setFormData({...formData, buyerPhone: e.target.value})}
                />
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Əlavə edilir...' : 'Əməliyyat Əlavə Et'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}