'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface RecentActivitiesProps {
  properties: Array<{
    id: number
    documentNumber: string
    district: string
    streetAddress: string
    status: string
    createdAt: string
    agent: {
      fullName: string
    }
  }>
  transactions: Array<{
    id: number
    salePrice: number | null
    property: {
      documentNumber: string
      district: string
    }
    agent: {
      fullName: string
    }
    createdAt: string
  }>
}

const statusLabels = {
  YENI: 'Yeni',
  GOZLEMEDE: 'Gözləmədə',
  BEH_VERILIB: 'Beh Verilib',
  SATILIB: 'Satılıb',
  ICAREYE_VERILIB: 'İcarəyə Verilib'
}

const statusColors = {
  YENI: 'bg-blue-500',
  GOZLEMEDE: 'bg-yellow-500',
  BEH_VERILIB: 'bg-orange-500',
  SATILIB: 'bg-green-500',
  ICAREYE_VERILIB: 'bg-purple-500'
}

export function RecentActivities({ properties, transactions }: RecentActivitiesProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Son əmlaklar */}
      <Card>
        <CardHeader>
          <CardTitle>Son Əmlaklar</CardTitle>
          <CardDescription>Ən son əlavə edilən əmlaklar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {properties.slice(0, 5).map((property) => (
              <div key={property.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm">{property.documentNumber}</div>
                  <div className="text-xs text-gray-500">
                    {property.district}, {property.streetAddress}
                  </div>
                  <div className="text-xs text-gray-400">
                    {property.agent.fullName} • {new Date(property.createdAt).toLocaleDateString('az-AZ')}
                  </div>
                </div>
                <Badge 
                  className={`${statusColors[property.status as keyof typeof statusColors]} text-white text-xs`}
                >
                  {statusLabels[property.status as keyof typeof statusLabels]}
                </Badge>
              </div>
            ))}
            {properties.length === 0 && (
              <p className="text-gray-500 text-center py-4">Hələ əmlak yoxdur</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Son əməliyyatlar */}
      <Card>
        <CardHeader>
          <CardTitle>Son Əməliyyatlar</CardTitle>
          <CardDescription>Ən son maliyyə əməliyyatları</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm">{transaction.property.documentNumber}</div>
                  <div className="text-xs text-gray-500">{transaction.property.district}</div>
                  <div className="text-xs text-gray-400">
                    {transaction.agent.fullName} • {new Date(transaction.createdAt).toLocaleDateString('az-AZ')}
                  </div>
                </div>
                <div className="text-right">
                  {transaction.salePrice ? (
                    <div className="text-sm font-medium text-green-600">
                      ₼{transaction.salePrice.toLocaleString()}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">Davam edir</div>
                  )}
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-gray-500 text-center py-4">Hələ əməliyyat yoxdur</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}