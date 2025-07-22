import { useEffect, useCallback, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'

interface MultiTabSyncOptions {
  storageKey?: string
  syncInterval?: number
  onSessionChange?: (action: 'login' | 'logout' | 'refresh') => void
  enabled?: boolean
}

interface SessionSyncData {
  action: 'login' | 'logout' | 'refresh' | 'heartbeat'
  timestamp: number
  sessionId: string
  userId?: string
  tabId: string
}

export function useMultiTabSync(options: MultiTabSyncOptions = {}) {
  const {
    storageKey = 'rea-session-sync',
    syncInterval = 5000, // 5 seconds
    onSessionChange,
    enabled = true
  } = options

  const { data: session, status } = useSession()
  const tabIdRef = useRef<string | undefined>(undefined)
  const lastHeartbeatRef = useRef<number>(0)

  // Generate unique tab ID
  useEffect(() => {
    if (!tabIdRef.current) {
      tabIdRef.current = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }, [])

  const broadcastSessionEvent = useCallback((action: SessionSyncData['action']) => {
    if (!enabled || !tabIdRef.current) return

    const syncData: SessionSyncData = {
      action,
      timestamp: Date.now(),
      sessionId: session?.user?.id || '',
      userId: session?.user?.id,
      tabId: tabIdRef.current
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(syncData))
      
      // Clean up after a short delay to avoid accumulation
      setTimeout(() => {
        const current = localStorage.getItem(storageKey)
        if (current === JSON.stringify(syncData)) {
          localStorage.removeItem(storageKey)
        }
      }, 100)
    } catch (error) {
      console.warn('Failed to broadcast session event:', error)
    }
  }, [enabled, session, storageKey])

  const sendHeartbeat = useCallback(() => {
    if (!enabled || status !== 'authenticated') return
    
    const now = Date.now()
    // Only send heartbeat every 30 seconds to reduce noise
    if (now - lastHeartbeatRef.current < 30000) return
    
    lastHeartbeatRef.current = now
    broadcastSessionEvent('heartbeat')
  }, [enabled, status, broadcastSessionEvent])

  // Handle storage events from other tabs
  useEffect(() => {
    if (!enabled) return

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== storageKey || !event.newValue) return

      try {
        const syncData: SessionSyncData = JSON.parse(event.newValue)
        
        // Ignore events from the same tab
        if (syncData.tabId === tabIdRef.current) return

        // Ignore old events (older than 30 seconds)
        if (Date.now() - syncData.timestamp > 30000) return

        console.log(`Multi-tab sync: ${syncData.action} from tab ${syncData.tabId}`)

        switch (syncData.action) {
          case 'logout':
            if (session) {
              console.log('Other tab logged out, signing out this tab')
              signOut({ callbackUrl: '/login' })
            }
            break
            
          case 'login':
            if (!session && syncData.userId) {
              console.log('Other tab logged in, refreshing this tab')
              window.location.reload()
            }
            break
            
          case 'refresh':
            if (session && session.user && session.user.id && syncData.userId === session.user.id) {
              console.log('Session refreshed in other tab')
              // Could trigger a session refresh here if needed
            }
            break
            
          case 'heartbeat':
            // Just acknowledge that other tabs are active
            break
        }

        if (onSessionChange && syncData.action !== 'heartbeat') {
          onSessionChange(syncData.action)
        }
      } catch (error) {
        console.warn('Failed to parse session sync data:', error)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [enabled, session, storageKey, onSessionChange])

  // Broadcast session events
  useEffect(() => {
    if (!enabled) return

    if (status === 'authenticated' && session) {
      broadcastSessionEvent('login')
    } else if (status === 'unauthenticated') {
      broadcastSessionEvent('logout')
    }
  }, [enabled, status, session, broadcastSessionEvent])

  // Send periodic heartbeats
  useEffect(() => {
    if (!enabled || status !== 'authenticated') return

    const interval = setInterval(sendHeartbeat, syncInterval)
    return () => clearInterval(interval)
  }, [enabled, status, sendHeartbeat, syncInterval])

  // Broadcast logout when tab closes
  useEffect(() => {
    if (!enabled) return

    const handleBeforeUnload = () => {
      if (session && session.user && session.user.id) {
        // Use synchronous localStorage for beforeunload
        const syncData: SessionSyncData = {
          action: 'logout',
          timestamp: Date.now(),
          sessionId: session.user.id,
          userId: session.user.id,
          tabId: tabIdRef.current || 'unknown'
        }
        try {
          localStorage.setItem(`${storageKey}_closing`, JSON.stringify(syncData))
        } catch (error) {
          // Ignore errors during page unload
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [enabled, session, storageKey])

  return {
    tabId: tabIdRef.current,
    broadcastLogin: () => broadcastSessionEvent('login'),
    broadcastLogout: () => broadcastSessionEvent('logout'),
    broadcastRefresh: () => broadcastSessionEvent('refresh'),
    sendHeartbeat
  }
}