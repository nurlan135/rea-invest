'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Home, Building, Users, Receipt, BarChart3, Settings, ContactRound } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Əmlaklar', href: '/properties', icon: Building },
  { name: 'Agentlər', href: '/agents', icon: Users },
  { name: 'Müştərilər', href: '/customers', icon: ContactRound },
  { name: 'Əməliyyatlar', href: '/transactions', icon: Receipt },
  { name: 'Hesabatlar', href: '/reports', icon: BarChart3 },
  { name: 'Parametrlər', href: '/settings', icon: Settings },
]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Preload next likely page based on current location
  useEffect(() => {
    const currentIndex = navigation.findIndex(item => item.href === pathname)
    if (currentIndex !== -1 && currentIndex < navigation.length - 1) {
      const nextPage = navigation[currentIndex + 1]
      // Preload next page
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = nextPage.href
      document.head.appendChild(link)
    }
  }, [pathname])

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu açı</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="bg-gray-900 text-white h-full">
          <div className="p-6">
            <h2 className="text-lg font-semibold">REA Invest</h2>
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
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}