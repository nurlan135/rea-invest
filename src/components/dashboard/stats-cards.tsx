'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'

interface StatsCardsProps {
  analytics: {
    totalProperties: number
    activeProperties: number
    soldProperties: number
    totalRevenue: number
    totalProfit: number
    expiredDeposits: number
    thisMonthSales: number
    thisMonthProfit: number
    avgProfitMargin: number
  }
}

export function StatsCards({ analytics }: StatsCardsProps) {
  const cards = [
    {
      title: 'Ümumi Əmlaklar',
      value: analytics.totalProperties,
      description: `${analytics.activeProperties} aktiv, ${analytics.soldProperties} satılmış`,
      icon: Building,
      color: 'text-blue-600'
    },
    {
      title: 'Ümumi Gəlir',
      value: `₼${analytics.totalRevenue.toLocaleString()}`,
      description: `Bu ay ₼${analytics.thisMonthProfit.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Ümumi Mənfəət',
      value: `₼${analytics.totalProfit.toLocaleString()}`,
      description: `Mənfəət marjı: ${analytics.avgProfitMargin.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      title: 'Vaxtı Keçmiş Depozitlər',
      value: analytics.expiredDeposits,
      description: 'Diqqət tələb edir',
      icon: AlertTriangle,
      color: 'text-red-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-gray-500 mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}