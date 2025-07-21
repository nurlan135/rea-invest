import { useEffect, useCallback, useRef } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface UseAutoLogoutOptions {
  timeout?: number // milliseconds (default: 30 minutes)
  warningTime?: number // milliseconds (default: 5 minutes before timeout)
  onWarning?: () => void
  onLogout?: () => void
}

export function useAutoLogout(options: UseAutoLogoutOptions = {}) {
  const {
    timeout = 30 * 60 * 1000, // 30 dəqiqə
    warningTime = 5 * 60 * 1000, // 5 dəqiqə xəbərdarlıq
    onWarning,
    onLogout
  } = options

  const { data: session } = useSession()
  const router = useRouter()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  const logout = useCallback(async () => {
    if (onLogout) {
      onLogout()
    }
    await signOut({ callbackUrl: '/login' })
  }, [onLogout])

  const showWarning = useCallback(() => {
    if (onWarning) {
      onWarning()
    }
  }, [onWarning])

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now()

    // Köhnə timer-ləri təmizlə
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current)
    }

    // Yeni timer-lər qur
    if (session) {
      // Xəbərdarlıq timer-i
      warningRef.current = setTimeout(() => {
        showWarning()
      }, timeout - warningTime)

      // Logout timer-i
      timeoutRef.current = setTimeout(() => {
        logout()
      }, timeout)
    }
  }, [session, timeout, warningTime, showWarning, logout])

  // User aktivlik olayları
  useEffect(() => {
    if (!session) return

    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ]

    const handleActivity = () => {
      resetTimer()
    }

    // Event listener-ləri əlavə et
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    // İlk timer qur
    resetTimer()

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current)
      }
    }
  }, [session, resetTimer])

  // Manual timer sıfırlama
  const extendSession = useCallback(() => {
    resetTimer()
  }, [resetTimer])

  return {
    extendSession,
    timeRemaining: () => {
      const elapsed = Date.now() - lastActivityRef.current
      return Math.max(0, timeout - elapsed)
    }
  }
}