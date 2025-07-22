import { Suspense } from 'react'
import AdminDashboard from '@/components/admin/admin-dashboard'
import { Card } from '@/components/ui/card'

export default function AdminPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Admin Panel
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Sistemin ümumi idarəetməsi və statistikalar
        </p>
      </div>

      {/* Admin Dashboard */}
      <Suspense 
        fallback={
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
        }
      >
        <AdminDashboard />
      </Suspense>
    </div>
  )
}