'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExportButtons } from '@/components/export/export-buttons'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { MonthlyChart } from '@/components/dashboard/monthly-chart'

export default function ReportsPage() {
  const [analytics, setAnalytics] = useState(null)
  const [monthlyData, setMonthlyData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchReportsData()
  }, [])

  const fetchReportsData = async () => {
    try {
      const [analyticsRes, monthlyRes] = await Promise.all([
        fetch('/api/analytics/dashboard'),
        fetch('/api/analytics/monthly')
      ])

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json()
        setAnalytics(analyticsData)
      }

      if (monthlyRes.ok) {
        const monthlyData = await monthlyRes.json()
        setMonthlyData(monthlyData)
      }
    } catch (error) {
      console.error('Reports data fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p>Hesabatlar yüklənir...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hesabatlar</h1>
        <p className="text-gray-600">Məlumatların Excel formatında yüklənməsi və analiz</p>
      </div>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Excel Export</CardTitle>
          <CardDescription>
            Bütün məlumatları Excel formatında yükləyin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExportButtons />
        </CardContent>
      </Card>

      {/* Analytics Summary */}
      {analytics && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Ümumi Statistikalar</h2>
          <StatsCards analytics={analytics} />
        </div>
      )}

      {/* Monthly Trends */}
      {monthlyData.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Aylıq Trendlər</h2>
          <MonthlyChart data={monthlyData} />
        </div>
      )}
    </div>
  )
}