'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { ScrollArea } from '@/components/ui/scroll-area'
import { RefreshCw, Trash2, Eye, EyeOff } from 'lucide-react'
import { useSessionValidation } from '@/hooks/useSessionValidation'
import { useMultiTabSync } from '@/hooks/useMultiTabSync'

interface AuthLog {
  type: string
  userId?: string
  email?: string
  ip?: string
  timestamp: number
  error?: string
  details?: Record<string, any>
}

interface AuthStats {
  total: number
  byType: Record<string, number>
  recentActivity: number
  uniqueUsers: number
}

export function SessionDebugDashboard() {
  const { data: session } = useSession()
  const [logs, setLogs] = useState<AuthLog[]>([])
  const [stats, setStats] = useState<AuthStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  
  const { isValid, isValidating, lastCheck, lastError, serverTime } = useSessionValidation()
  const { tabId } = useMultiTabSync()

  // Only show in development or for admin users
  const canAccess = process.env.NODE_ENV === 'development' || session?.user?.role === 'ADMIN'

  const fetchLogs = async (type?: string) => {
    if (!canAccess) return
    
    setIsLoading(true)
    try {
      const url = new URL('/api/debug/auth-logs', window.location.origin)
      if (type) url.searchParams.set('type', type)
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch auth logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearLogs = async () => {
    if (!canAccess || session?.user?.role !== 'ADMIN') return
    
    try {
      const response = await fetch('/api/debug/auth-logs', { method: 'DELETE' })
      if (response.ok) {
        setLogs([])
        setStats(null)
      }
    } catch (error) {
      console.error('Failed to clear logs:', error)
    }
  }

  useEffect(() => {
    if (canAccess) {
      fetchLogs()
    }
  }, [canAccess])

  useEffect(() => {
    if (!autoRefresh || !canAccess) return
    
    const interval = setInterval(() => fetchLogs(), 5000)
    return () => clearInterval(interval)
  }, [autoRefresh, canAccess])

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const getTypeColor = (type: string) => {
    const colors = {
      login_success: 'bg-green-500',
      login_failure: 'bg-red-500', 
      login_attempt: 'bg-blue-500',
      logout: 'bg-gray-500',
      session_refresh: 'bg-yellow-500',
      session_expire: 'bg-orange-500',
      rate_limit: 'bg-red-600',
      error: 'bg-red-700'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-400'
  }

  if (!canAccess) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          Debug dashboard sadəcə development mühitində və ya admin istifadəçiləri üçün əlçatandır
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Session Debug Dashboard
            <Badge variant={isValid ? 'default' : 'destructive'}>
              {isValid ? 'Valid' : 'Invalid'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Authentication və session monitoring - Tab ID: {tabId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats?.total || 0}</div>
              <div className="text-sm text-gray-500">Ümumi log</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats?.uniqueUsers || 0}</div>
              <div className="text-sm text-gray-500">Unikal istifadəçi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats?.recentActivity || 0}</div>
              <div className="text-sm text-gray-500">Son saat aktivlik</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${isValidating ? 'text-yellow-600' : isValid ? 'text-green-600' : 'text-red-600'}`}>
                {isValidating ? 'Checking...' : isValid ? 'OK' : 'ERROR'}
              </div>
              <div className="text-sm text-gray-500">Session status</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Button onClick={() => fetchLogs()} disabled={isLoading} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Yenilə
            </Button>
            <Button 
              onClick={() => setAutoRefresh(!autoRefresh)} 
              variant={autoRefresh ? 'default' : 'outline'}
              size="sm"
            >
              Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
            </Button>
            <Button onClick={() => setShowSensitiveInfo(!showSensitiveInfo)} variant="outline" size="sm">
              {showSensitiveInfo ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              Həssas məlumat
            </Button>
            {session?.user?.role === 'ADMIN' && (
              <Button onClick={clearLogs} variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Log-ları təmizlə
              </Button>
            )}
          </div>

          {lastCheck && (
            <div className="text-sm text-gray-500 mb-4">
              Son yoxlama: {formatTimestamp(lastCheck)}
              {serverTime && ` | Server vaxtı: ${formatTimestamp(serverTime)}`}
              {lastError && <span className="text-red-500"> | Xəta: {lastError}</span>}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Son authentication log-ları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Log tapılmadı</p>
            ) : (
              <div className="space-y-2">
                {logs.slice(0, 20).map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getTypeColor(log.type)}`} />
                      <div>
                        <div className="font-medium">{log.type.replace('_', ' ').toUpperCase()}</div>
                        <div className="text-sm text-gray-500">
                          {log.email && showSensitiveInfo && `${log.email} | `}
                          {formatTimestamp(log.timestamp)}
                          {log.ip && showSensitiveInfo && ` | IP: ${log.ip}`}
                        </div>
                        {log.error && (
                          <div className="text-sm text-red-500">Xəta: {log.error}</div>
                        )}
                        {log.details && showSensitiveInfo && (
                          <div className="text-xs text-gray-400">
                            {JSON.stringify(log.details)}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className={getTypeColor(log.type)}>
                      {log.type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}