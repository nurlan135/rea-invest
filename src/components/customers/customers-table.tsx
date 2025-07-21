'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, Edit, Trash2, Phone, MapPin } from 'lucide-react'
import { Contact } from '@/types/customer'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CustomerDetails } from './customer-details'
import { CustomerForm } from './customer-form'

const typeColors = {
  OWNER: 'bg-blue-500',
  BUYER: 'bg-green-500'
} as const

const typeLabels = {
  OWNER: 'Əmlak Sahibi',
  BUYER: 'Alıcı'
} as const

interface CustomersTableProps {
  customers: Contact[]
  onRefresh: () => void
}

export function CustomersTable({ customers, onRefresh }: CustomersTableProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Contact | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handleViewDetails = (customer: Contact) => {
    setSelectedCustomer(customer)
    setIsDetailsOpen(true)
  }

  const handleEdit = (customer: Contact) => {
    setSelectedCustomer(customer)
    setIsEditOpen(true)
  }

  const handleEditSuccess = () => {
    setIsEditOpen(false)
    setSelectedCustomer(null)
    onRefresh()
  }

  const handleDelete = async (customerId: number) => {
    if (!confirm('Bu müştərini silmək istədiyinizə əminsiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/contacts/${customerId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onRefresh()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Müştəri silinərkən xəta baş verdi')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Müştəri silinərkən xəta baş verdi')
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Müştərilər Siyahısı</CardTitle>
            <CardDescription>
              Cəmi {customers.length} müştəri
            </CardDescription>
          </div>
          {/* TODO: Add customer-specific export functionality */}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 font-medium text-gray-600">Müştəri</th>
                  <th className="text-left p-3 font-medium text-gray-600">Ata adı</th>
                  <th className="text-left p-3 font-medium text-gray-600">Telefon</th>
                  <th className="text-left p-3 font-medium text-gray-600">Ünvan</th>
                  <th className="text-left p-3 font-medium text-gray-600">Növ</th>
                  <th className="text-left p-3 font-medium text-gray-600">Qeydiyyat tarixi</th>
                  <th className="text-left p-3 font-medium text-gray-600">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {customer.firstName} {customer.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {customer.id}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {customer.fatherName || '-'}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{customer.phone}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{customer.address || '-'}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={`${typeColors[customer.type]} text-white`}>
                        {typeLabels[customer.type]}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {new Date(customer.createdAt).toLocaleDateString('az-AZ')}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewDetails(customer)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCustomer && `${selectedCustomer.firstName} ${selectedCustomer.lastName} - Təfərrüatlar`}
            </DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <CustomerDetails 
              customer={selectedCustomer}
              onClose={() => setIsDetailsOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCustomer && `${selectedCustomer.firstName} ${selectedCustomer.lastName} - Redaktə`}
            </DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <CustomerForm
              editMode={true}
              customerId={selectedCustomer.id}
              initialData={{
                firstName: selectedCustomer.firstName,
                lastName: selectedCustomer.lastName,
                fatherName: selectedCustomer.fatherName,
                phone: selectedCustomer.phone,
                address: selectedCustomer.address,
                type: selectedCustomer.type
              }}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}