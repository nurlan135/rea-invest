import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface SessionValidationResult {
  valid: boolean
  error?: string
  serverTime?: number
  lastCheck?: number
}

interface UseSessionValidationOptions {
  checkInterval?: number // milliseconds (default: 30 seconds)
  onInvalidSession?: () => void
  onValidationError?: (error: string) => void
  enabled?: boolean
}

export function useSessionValidation(options: UseSessionValidationOptions = {}) {
  const {
    checkInterval = 30 * 1000, // 30 seconds
    onInvalidSession,
    onValidationError,
    enabled = true
  } = options

  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [validationResult, setValidationResult] = useState<SessionValidationResult>({
    valid: true
  })
  const [isValidating, setIsValidating] = useState(false)

  const validateSession = useCallback(async () => {
    if (!session || !enabled || status !== 'authenticated') {
      return
    }

    setIsValidating(true)
    
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })

      const result = await response.json()
      const validationData: SessionValidationResult = {
        valid: response.ok && result.valid,
        error: result.error,
        serverTime: result.serverTime,
        lastCheck: Date.now()
      }

      setValidationResult(validationData)

      if (!validationData.valid) {
        console.warn('Session validation failed:', validationData.error)
        
        if (onInvalidSession) {
          onInvalidSession()
        } else {
          // Default behavior: sign out and redirect
          await signOut({ callbackUrl: '/login' })
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Session validation request failed'
      console.error('Session validation error:', errorMessage)
      
      setValidationResult({
        valid: false,
        error: errorMessage,
        lastCheck: Date.now()
      })

      if (onValidationError) {
        onValidationError(errorMessage)
      }
    } finally {
      setIsValidating(false)
    }
  }, [session, enabled, status, onInvalidSession, onValidationError])

  const refreshSession = useCallback(async () => {
    if (!session || !enabled) {
      return false
    }

    try {
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        setValidationResult({
          valid: true,
          serverTime: result.serverTime,
          lastCheck: Date.now()
        })
        return true
      } else {
        console.warn('Session refresh failed:', result.error)
        return false
      }
    } catch (error) {
      console.error('Session refresh error:', error)
      return false
    }
  }, [session, enabled])

  // Periodic validation
  useEffect(() => {
    if (!enabled || status !== 'authenticated') {
      return
    }

    // Initial validation
    validateSession()

    // Set up periodic checks
    const interval = setInterval(validateSession, checkInterval)
    
    return () => clearInterval(interval)
  }, [validateSession, checkInterval, enabled, status])

  // Validate on visibility change (when user returns to tab)
  useEffect(() => {
    if (!enabled) return

    const handleVisibilityChange = () => {
      if (!document.hidden && session) {
        validateSession()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [validateSession, session, enabled])

  return {
    isValid: validationResult.valid,
    isValidating,
    lastError: validationResult.error,
    lastCheck: validationResult.lastCheck,
    serverTime: validationResult.serverTime,
    validateSession,
    refreshSession
  }
}