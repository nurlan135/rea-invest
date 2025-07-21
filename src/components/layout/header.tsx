'use client'

import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, User } from 'lucide-react'
import { MobileNav } from './mobile-nav'
import { NotificationCenter } from '../notifications/notification-center'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="border-b bg-white px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <MobileNav />
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold text-gray-900">REA Invest</h1>
            <p className="text-sm text-gray-500">Əmlak İdarəetmə Sistemi</p>
          </div>
          <div className="md:hidden">
            <h1 className="text-xl font-bold text-gray-900">REA Invest</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <NotificationCenter />
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="text-sm hidden sm:block">
              <div className="font-medium">{session?.user?.name}</div>
              <div className="text-gray-500">{session?.user?.role}</div>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="hidden sm:flex"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Çıxış
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="sm:hidden"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}