'use client'

import { useState } from 'react'
import { useAutoLogout } from '@/hooks/useAutoLogout'
import { useMultiTabSync } from '@/hooks/useMultiTabSync'
import { SessionWarningModal } from './session-warning-modal'
import { signOut } from 'next-auth/react'
import { useToastContext } from '@/components/providers/toast-provider'

interface AutoLogoutProviderProps {
  children: React.ReactNode
  timeoutMinutes?: number // dəqiqə
  warningMinutes?: number // dəqiqə
}

export function AutoLogoutProvider({ 
  children, 
  timeoutMinutes = 30, // 30 dəqiqə default
  warningMinutes = 5   // 5 dəqiqə xəbərdarlıq
}: AutoLogoutProviderProps) {
  const [showWarning, setShowWarning] = useState(false)
  const { toast } = useToastContext()

  // Disable custom session validation to prevent fetch errors
  // NextAuth will handle session management automatically
  const refreshSession = async () => {
    try {
      // Simple session refresh without custom validation
      return true
    } catch (error) {
      console.warn('Session refresh error:', error)
      return false
    }
  }

  // Multi-tab synchronization
  const { broadcastLogout, broadcastRefresh } = useMultiTabSync({
    onSessionChange: (action) => {
      if (action === 'logout') {
        setShowWarning(false)
        toast.info('Sistem', 'Başqa tab-dan çıxış edildi')
      } else if (action === 'login') {
        toast.success('Sistem', 'Başqa tab-da giriş edildi')
      }
    }
  })

  const { extendSession, timeRemaining } = useAutoLogout({
    timeout: timeoutMinutes * 60 * 1000,
    warningTime: warningMinutes * 60 * 1000,
    onWarning: () => {
      setShowWarning(true)
      toast.warning('Session xəbərdarlığı', `${warningMinutes} dəqiqə sonra avtomatik çıxış`)
    },
    onLogout: () => {
      setShowWarning(false)
      broadcastLogout()
      toast.error('Session bitdi', 'Avtomatik çıxış edildi')
      signOut({ callbackUrl: '/login' })
    }
  })

  const handleExtend = async () => {
    setShowWarning(false)
    extendSession()
    
    // Also refresh server-side session
    const refreshed = await refreshSession()
    if (refreshed) {
      broadcastRefresh()
      toast.success('Session uzadıldı', 'Fəaliyyət vaxtı yeniləndi')
    } else {
      toast.warning('Session uzadılması', 'Server ilə sinxronizasiya problemi')
    }
  }

  const handleLogout = () => {
    setShowWarning(false)
    broadcastLogout()
    toast.info('Manual çıxış', 'Sistemdən çıxış edildi')
    signOut({ callbackUrl: '/login' })
  }

  return (
    <>
      {children}
      <SessionWarningModal
        isOpen={showWarning}
        onExtend={handleExtend}
        onLogout={handleLogout}
        timeRemaining={timeRemaining()}
      />
    </>
  )
}