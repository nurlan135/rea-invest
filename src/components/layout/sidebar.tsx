'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { 
  Home, 
  Building, 
  Users, 
  Receipt, 
  BarChart3,
  Settings,
  ContactRound,
  File
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, preload: ['/api/analytics/dashboard'] },
  { name: 'Əmlaklar', href: '/properties', icon: Building, preload: ['/api/properties'] },
  { name: 'İcarə', href: '/leases', icon: File, preload: ['/api/leases'] },
  { name: 'Agentlər', href: '/agents', icon: Users, preload: ['/api/agents'] },
  { name: 'Müştərilər', href: '/customers', icon: ContactRound, preload: ['/api/contacts'] },
  { name: 'Əməliyyatlar', href: '/transactions', icon: Receipt, preload: ['/api/transactions'] },
  { name: 'Hesabatlar', href: '/reports', icon: BarChart3, preload: ['/api/analytics/monthly'] },
  { name: 'Parametrlər', href: '/settings', icon: Settings, preload: [] },
]

export function Sidebar() {
  const pathname = usePathname()
  const preloadTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Preload page resources
  const preloadPage = (href: string, apis: string[] = []) => {
    // Cancel any existing timeout for this href
    const existingTimeout = preloadTimeouts.current.get(href)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Set new timeout to avoid too many preloads
    const timeout = setTimeout(() => {
      // Preload the page
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = href
      link.as = 'document'
      document.head.appendChild(link)

      // Preload APIs
      apis.forEach(api => {
        fetch(api, { 
          method: 'GET',
          headers: { 'X-Prefetch': 'true' }
        }).catch(() => {}) // Silent fail for preloading
      })

      preloadTimeouts.current.delete(href)
    }, 200) // 200ms delay to avoid excessive preloading

    preloadTimeouts.current.set(href, timeout)
  }

  const cancelPreload = (href: string) => {
    const timeout = preloadTimeouts.current.get(href)
    if (timeout) {
      clearTimeout(timeout)
      preloadTimeouts.current.delete(href)
    }
  }

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      preloadTimeouts.current.forEach(timeout => clearTimeout(timeout))
      preloadTimeouts.current.clear()
    }
  }, [])

  return (
    <div className="w-full bg-gray-900 text-white h-full min-h-screen">
      <div className="p-6">
        <h2 className="text-lg font-semibold">Əsas Bölmələr</h2>
      </div>
      
      <nav className="px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = item.href === '/dashboard' 
            ? pathname === '/dashboard' 
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              onMouseEnter={() => preloadPage(item.href, item.preload)}
              onMouseLeave={() => cancelPreload(item.href)}
              onFocus={() => preloadPage(item.href, item.preload)}
              onBlur={() => cancelPreload(item.href)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150',
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
              title={`${item.name} - ${item.href} ${isActive ? '(aktiv)' : ''}`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}