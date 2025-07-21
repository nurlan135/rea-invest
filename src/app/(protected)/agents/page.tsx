'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, Building, Receipt } from 'lucide-react'
import { useCache } from '@/hooks/useCache'
import { PageLoading } from '@/components/ui/page-loading'

interface Agent {
  id: number
  email: string
  fullName: string
  role: string
  createdAt: string
  _count: {
    properties: number
    transactions: number
  }
}

export default function AgentsPage() {
  // Use cache hook for optimized data fetching
  const { 
    data: agents, 
    isLoading, 
    error 
  } = useCache<Agent[]>('/api/agents', {
    key: 'agents-list',
    ttl: 5 * 60 * 1000 // 5 minutes cache
  })

  // Ensure agents is always an array
  const safeAgents = agents || []

  if (isLoading) {
    return <PageLoading />
  }

  if (error) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Xəta: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agentlər</h1>
        <p className="text-gray-600">Sistem istifadəçilərinin idarə edilməsi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeAgents.map((agent) => (
          <Card key={agent.id}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{agent.fullName}</CardTitle>
                  <CardDescription>{agent.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rol:</span>
                  <Badge variant={agent.role === 'ADMIN' ? 'default' : 'secondary'}>
                    {agent.role === 'ADMIN' ? 'Admin' : 'Agent'}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    Əmlaklar:
                  </span>
                  <span className="font-medium">{agent._count.properties}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Receipt className="h-4 w-4" />
                    Əməliyyatlar:
                  </span>
                  <span className="font-medium">{agent._count.transactions}</span>
                </div>
                
                <div className="text-xs text-gray-400 pt-2">
                  Qeydiyyat: {new Date(agent.createdAt).toLocaleDateString('az-AZ')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {safeAgents.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 text-lg">Hələ agent yoxdur</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}