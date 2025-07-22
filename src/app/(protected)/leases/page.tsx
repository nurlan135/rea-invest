'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { LeaseForm } from '@/components/leases/lease-form'
import { Plus, Home, Calendar, DollarSign, User } from 'lucide-react'
// Using native date formatting instead of date-fns to avoid potential issues

interface Lease {
  id: number
  startDate: string
  endDate: string
  rentAmount: number
  paymentDueDay: number
  depositAmount: number | null
  status: string
  property: {
    id: number
    documentNumber: string
    district: string
    streetAddress: string
    apartmentNumber: string | null
    roomCount: string
    area: number
    owner: {
      firstName: string
      lastName: string
    }
  }
  tenant: {
    id: number
    firstName: string
    lastName: string
    phone: string
  }
  agent: {
    id: number
    fullName: string
  }
  payments: Array<{
    id: number
    amount: number
    forMonth: number
    forYear: number
    status: string
  }>
}

export default function LeasesPage() {
  const [leases, setLeases] = useState<Lease[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchLeases()
  }, [])

  const fetchLeases = async () => {
    try {
      const response = await fetch('/api/leases')
      if (response.ok) {
        const data = await response.json()
        setLeases(data)
      }
    } catch (error) {
      console.error('Error fetching leases:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccess = () => {
    setShowForm(false)
    fetchLeases()
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      ACTIVE: { label: 'Aktiv', variant: 'default' as const },
      EXPIRED: { label: 'Vaxtı keçib', variant: 'secondary' as const },
      TERMINATED: { label: 'Ləğv edilib', variant: 'destructive' as const }
    }
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-lg">Yüklənir...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">İcarə Müqavilələri</h1>
          <p className="text-muted-foreground">
            Bütün aktiv və keçmiş icarə müqavilələrini idarə edin
          </p>
        </div>
        
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Yeni Müqavilə
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni İcarə Müqaviləsi</DialogTitle>
            </DialogHeader>
            <LeaseForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {leases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Home className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Hələ müqavilə yoxdur</h3>
            <p className="text-muted-foreground mb-4">
              İlk icarə müqavilənizi yaratmaq üçün yuxarıdakı düyməni basın
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {leases.map((lease) => (
            <Card key={lease.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="w-5 h-5" />
                      {lease.property.documentNumber}
                    </CardTitle>
                    <CardDescription>
                      {lease.property.district}, {lease.property.streetAddress}
                      {lease.property.apartmentNumber && ` ${lease.property.apartmentNumber}`}
                    </CardDescription>
                  </div>
                  {getStatusBadge(lease.status)}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Kirayəçi</p>
                      <p className="text-sm text-muted-foreground">
                        {lease.tenant.firstName} {lease.tenant.lastName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Aylıq kirayə</p>
                      <p className="text-sm text-muted-foreground">
                        {lease.rentAmount.toLocaleString()} ₼
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Müddət</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(lease.startDate).toLocaleDateString('az-AZ')} - 
                        {new Date(lease.endDate).toLocaleDateString('az-AZ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Əmlak</p>
                      <p className="text-sm text-muted-foreground">
                        {lease.property.roomCount} otaq, {lease.property.area}m²
                      </p>
                    </div>
                  </div>
                </div>
                
                {lease.payments.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Son ödənişlər:</p>
                    <div className="flex gap-2">
                      {lease.payments.slice(0, 3).map((payment) => (
                        <Badge key={payment.id} variant="outline">
                          {payment.forMonth}/{payment.forYear} - {payment.amount.toLocaleString()}₼
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}