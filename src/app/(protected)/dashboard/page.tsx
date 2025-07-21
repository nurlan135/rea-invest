'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { PageLoading } from '@/components/ui/page-loading'
import { LazyWrapper, LazyStatsCards, LazyMonthlyChart, LazyRecentActivities } from '@/components/lazy-components'
import { useCache } from '@/hooks/useCache'
import { usePerformance } from '@/hooks/usePerformance'

// Types for dashboard data
interface DashboardStats {
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

interface MonthlyData {
  month: string
  properties: number
  transactions: number
  revenue: number
  profit: number
}

interface RecentProperty {
  id: number
  documentNumber: string
  district: string
  streetAddress: string
  status: string
  createdAt: string
  agent: {
    fullName: string
  }
}

interface RecentTransaction {
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
}

// Loading components for better UX
function StatsCardsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="space-y-0 pb-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ChartLoading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ActivitiesLoading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="flex justify-between items-center">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const { measureAction } = usePerformance('Dashboard')
  
  // Use cache hooks for optimized data fetching
  const { 
    data: analytics, 
    isLoading: analyticsLoading, 
    error: analyticsError 
  } = useCache<DashboardStats>('/api/analytics/dashboard', {
    key: 'dashboard-analytics',
    ttl: 2 * 60 * 1000 // 2 minutes
  })

  const { 
    data: monthlyData, 
    isLoading: monthlyLoading,
    error: monthlyError 
  } = useCache<MonthlyData[]>('/api/analytics/monthly', {
    key: 'dashboard-monthly',
    ttl: 5 * 60 * 1000 // 5 minutes
  })

  const { 
    data: recentProperties, 
    isLoading: propertiesLoading 
  } = useCache<RecentProperty[]>('/api/properties', {
    key: 'dashboard-recent-properties',
    ttl: 1 * 60 * 1000 // 1 minute
  })

  const { 
    data: recentTransactions, 
    isLoading: transactionsLoading 
  } = useCache<RecentTransaction[]>('/api/transactions', {
    key: 'dashboard-recent-transactions',  
    ttl: 1 * 60 * 1000 // 1 minute
  })

  // Show page loading if initial data is loading
  if (analyticsLoading && !analytics) {
    return <PageLoading />
  }

  // Error handling with retry
  if (analyticsError || monthlyError) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Xəta Baş Verdi</CardTitle>
            <CardDescription>
              Dashboard məlumatları yüklənmədi. Səhifəni yeniləyin və ya bir az sonra cəhd edin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Səhifəni Yenilə
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-600">
            Xoş gəlmisiniz, {session?.user?.name}! Şirkət fəaliyyətinin ümumi görünüşü
          </p>
        </div>
        
        {/* Quick actions */}
        <div className="flex gap-2">
          <button 
            onClick={() => measureAction('Refresh Dashboard', () => window.location.reload())}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            🔄 Yenilə
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <LazyWrapper fallback={<StatsCardsLoading />}>
        {analytics ? (
          <LazyStatsCards analytics={analytics} />
        ) : (
          <StatsCardsLoading />
        )}
      </LazyWrapper>

      {/* Charts Section */}
      <LazyWrapper fallback={<ChartLoading />}>
        {monthlyData && monthlyData.length > 0 ? (
          <LazyMonthlyChart data={monthlyData} />
        ) : monthlyLoading ? (
          <ChartLoading />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Aylıq Məlumatlar</CardTitle>
              <CardDescription>Aylıq qrafik məlumatları mövcud deyil</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">
                Aylıq statistika məlumatları hələ mövcud deyil. 
                Bir neçə əməliyyat tamamladıqdan sonra qrafiklər görünəcək.
              </p>
            </CardContent>
          </Card>
        )}
      </LazyWrapper>

      {/* Recent Activities */}
      <LazyWrapper fallback={<ActivitiesLoading />}>
        {(recentProperties || recentTransactions) ? (
          <LazyRecentActivities 
            properties={recentProperties?.slice(0, 5) || []} 
            transactions={recentTransactions?.slice(0, 5) || []} 
          />
        ) : (propertiesLoading || transactionsLoading) ? (
          <ActivitiesLoading />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Empty states */}
            <Card>
              <CardHeader>
                <CardTitle>Son Əmlaklar</CardTitle>
                <CardDescription>Ən son əlavə edilən əmlaklar</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 mb-4">Hələ əmlak əlavə edilməyib</p>
                <a 
                  href="/properties" 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  İlk əmlakı əlavə edin →
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Son Əməliyyatlar</CardTitle>
                <CardDescription>Ən son maliyyə əməliyyatları</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 mb-4">Hələ əməliyyat yoxdur</p>
                <a 
                  href="/transactions" 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  İlk əməliyyatı yaradın →
                </a>
              </CardContent>
            </Card>
          </div>
        )}
      </LazyWrapper>

      {/* Performance info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 border-t pt-4">
          Dashboard yükləndi • {analytics ? 'Cache hit' : 'API çağırışı'} • 
          Komponenlər: {monthlyData ? 'Yükləndi' : 'Yüklənir'}
        </div>
      )}
    </div>
  )
}