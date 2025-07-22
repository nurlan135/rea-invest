'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Users, Database, Activity, AlertTriangle } from 'lucide-react'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalProperties: number
  totalTransactions: number
  systemHealth: 'healthy' | 'warning' | 'error'
  dbSize: string
  activeConnections: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Admin stats yüklənmədi:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ümumi İstifadəçi</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalUsers || 0}
              </p>
            </div>
          </div>
        </Card>

        {/* Active Users */}
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Aktiv İstifadəçi</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.activeUsers || 0}
              </p>
            </div>
          </div>
        </Card>

        {/* Properties */}
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
              <Database className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ümumi Əmlak</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalProperties || 0}
              </p>
            </div>
          </div>
        </Card>

        {/* Transactions */}
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Əməliyyatlar</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalTransactions || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sistem Vəziyyəti
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Sistem Sağlamlığı</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                stats?.systemHealth === 'healthy' 
                  ? 'bg-green-100 text-green-800'
                  : stats?.systemHealth === 'warning'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {stats?.systemHealth === 'healthy' ? 'Sağlam' : 
                 stats?.systemHealth === 'warning' ? 'Xəbərdarlıq' : 'Xəta'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Verilənlər Bazası Ölçüsü</span>
              <span className="text-sm font-medium text-gray-900">
                {stats?.dbSize || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Aktiv Bağlantılar</span>
              <span className="text-sm font-medium text-gray-900">
                {stats?.activeConnections || 0}
              </span>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sürətli Əməliyyatlar
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
              Verilənlər Bazası Backup
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors">
              Sistem Yenilə
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-md transition-colors">
              Logları Yoxla
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-md transition-colors">
              Performans Analizi
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}