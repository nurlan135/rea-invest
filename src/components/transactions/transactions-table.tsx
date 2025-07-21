'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, Edit, DollarSign } from 'lucide-react'

interface Transaction {
  id: number
  purchasePrice: number
  salePrice: number | null
  serviceFee: number | null
  profit: number | null
  saleDate: string | null
  property: {
    documentNumber: string
    district: string
    streetAddress: string
  }
  buyer: {
    firstName: string
    lastName: string
  } | null
  agent: {
    fullName: string
  }
}

interface TransactionsTableProps {
  transactions: Transaction[]
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500 text-lg">Hələ heç bir əməliyyat yoxdur</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Əməliyyatlar</CardTitle>
        <CardDescription>Ümumi {transactions.length} əməliyyat</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Əmlak</th>
                <th className="text-left p-3">Alış Qiyməti</th>
                <th className="text-left p-3">Satış Qiyməti</th>
                <th className="text-left p-3">Mənfəət</th>
                <th className="text-left p-3">Alıcı</th>
                <th className="text-left p-3">Agent</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div>
                      <div className="font-mono text-sm">{transaction.property.documentNumber}</div>
                      <div className="text-sm text-gray-500">
                        {transaction.property.district}, {transaction.property.streetAddress}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="font-medium">₼{transaction.purchasePrice?.toLocaleString()}</span>
                  </td>
                  <td className="p-3">
                    {transaction.salePrice ? (
                      <span className="font-medium text-green-600">
                        ₼{transaction.salePrice.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-400">Satılmayıb</span>
                    )}
                  </td>
                  <td className="p-3">
                    {transaction.profit !== null ? (
                      <span className={`font-medium ${transaction.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₼{transaction.profit.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    {transaction.buyer ? (
                      <span className="text-sm">
                        {transaction.buyer.firstName} {transaction.buyer.lastName}
                      </span>
                    ) : (
                      <span className="text-gray-400">Alıcı yoxdur</span>
                    )}
                  </td>
                  <td className="p-3 text-sm">{transaction.agent.fullName}</td>
                  <td className="p-3">
                    {transaction.saleDate ? (
                      <Badge className="bg-green-500 text-white">
                        Tamamlanıb
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        Davam edir
                      </Badge>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!transaction.saleDate && (
                        <Button size="sm" variant="outline">
                          <DollarSign className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}