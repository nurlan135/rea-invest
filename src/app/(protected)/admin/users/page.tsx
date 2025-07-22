import { Suspense } from 'react'
import UserManagement from '@/components/admin/user-management'
import { Card } from '@/components/ui/card'

export default function UsersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          İstifadəçi İdarəetməsi
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Sistem istifadəçilərini idarə edin və yeni hesablar yaradın
        </p>
      </div>

      {/* User Management */}
      <Suspense 
        fallback={
          <Card className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </Card>
        }
      >
        <UserManagement />
      </Suspense>
    </div>
  )
}