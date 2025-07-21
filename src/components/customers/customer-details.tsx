'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, MapPin, Calendar, Building, Receipt } from 'lucide-react'
import { Contact } from '@/types/customer'

const typeColors = {
  OWNER: 'bg-blue-500',
  BUYER: 'bg-green-500'
} as const

const typeLabels = {
  OWNER: 'Əmlak Sahibi',
  BUYER: 'Alıcı'
} as const

interface CustomerDetailsProps {
  customer: Contact
  onClose: () => void
}

export function CustomerDetails({ customer }: CustomerDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Əsas məlumatlar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div>
              {customer.firstName} {customer.lastName}
              <Badge className={`ml-3 ${typeColors[customer.type]} text-white`}>
                {typeLabels[customer.type]}
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>
            Müştəri ID: {customer.id}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Ad:</span>
                <span>{customer.firstName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Soyad:</span>
                <span>{customer.lastName}</span>
              </div>
              {customer.fatherName && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Ata adı:</span>
                  <span>{customer.fatherName}</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-700">Telefon:</span>
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-700">Ünvan:</span>
                <span>{customer.address || 'Məlumat yoxdur'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-700">Qeydiyyat:</span>
                <span>{new Date(customer.createdAt).toLocaleDateString('az-AZ')}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Əmlaklar (əgər sahibdirsə) */}
      {customer.type === 'OWNER' && customer.ownedProperties && customer.ownedProperties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Sahib olduğu əmlaklar
            </CardTitle>
            <CardDescription>
              {customer.ownedProperties.length} əmlak
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {customer.ownedProperties.map((property) => (
                <div key={property.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{property.documentNumber}</div>
                    <div className="text-sm text-gray-600">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {property.district}, {property.streetAddress}
                    </div>
                  </div>
                  <Badge variant="outline">
                    {property.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alış əməliyyatları (əgər alıcıdırsa) */}
      {customer.type === 'BUYER' && customer.boughtTransactions && customer.boughtTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Alış əməliyyatları
            </CardTitle>
            <CardDescription>
              {customer.boughtTransactions.length} əməliyyat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {customer.boughtTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{transaction.property.documentNumber}</div>
                    <div className="text-sm text-gray-600">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {transaction.property.district}, {transaction.property.streetAddress}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(transaction.saleDate).toLocaleDateString('az-AZ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">
                      {transaction.salePrice.toLocaleString()} ₼
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Boş hallar */}
      {customer.type === 'OWNER' && (!customer.ownedProperties || customer.ownedProperties.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Sahib olduğu əmlaklar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-8">
              Hələ əmlak qeydiyyatı yoxdur
            </p>
          </CardContent>
        </Card>
      )}

      {customer.type === 'BUYER' && (!customer.boughtTransactions || customer.boughtTransactions.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Alış əməliyyatları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-8">
              Hələ alış əməliyyatı yoxdur
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}