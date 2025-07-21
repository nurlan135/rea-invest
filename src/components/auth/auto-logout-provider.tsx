'use client'

import { useState } from 'react'
import { useAutoLogout } from '@/hooks/useAutoLogout'
import { SessionWarningModal } from './session-warning-modal'
import { signOut } from 'next-auth/react'

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

  const { extendSession, timeRemaining } = useAutoLogout({
    timeout: timeoutMinutes * 60 * 1000,
    warningTime: warningMinutes * 60 * 1000,
    onWarning: () => {
      setShowWarning(true)
    },
    onLogout: () => {
      setShowWarning(false)
      signOut({ callbackUrl: '/login' })
    }
  })

  const handleExtend = () => {
    setShowWarning(false)
    extendSession()
  }

  const handleLogout = () => {
    setShowWarning(false)
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