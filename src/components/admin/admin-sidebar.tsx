'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, 
  Settings, 
  BarChart3, 
  Shield,
  Database,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: BarChart3 },
  { name: 'İstifadəçilər', href: '/admin/users', icon: Users },
  { name: 'Sistem Statistikası', href: '/admin/stats', icon: Activity },
  { name: 'Verilənlər Bazası', href: '/admin/database', icon: Database },
  { name: 'Təhlükəsizlik', href: '/admin/security', icon: Shield },
  { name: 'Parametrlər', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-gray-900">
      {/* Logo/Header */}
      <div className="flex items-center justify-center h-16 px-4 bg-gray-800">
        <h2 className="text-xl font-semibold text-white">
          REA Admin
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {adminNavigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
            >
              <Icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Back to Main Dashboard */}
      <div className="p-4 border-t border-gray-700">
        <Link
          href="/dashboard"
          className="flex items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
        >
          <svg
            className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Ana Dashboard
        </Link>
      </div>
    </div>
  )
}