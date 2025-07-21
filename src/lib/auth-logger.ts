interface AuthLogEvent {
  type: 'login_attempt' | 'login_success' | 'login_failure' | 'logout' | 'session_refresh' | 'session_expire' | 'rate_limit' | 'error'
  userId?: string
  email?: string
  ip?: string
  userAgent?: string
  timestamp: number
  details?: Record<string, any>
  error?: string
}

class AuthLogger {
  private logs: AuthLogEvent[] = []
  private maxLogs = 1000 // Keep last 1000 events
  private enabled = true

  constructor() {
    this.enabled = process.env.NODE_ENV === 'development' || process.env.ENABLE_AUTH_LOGS === 'true'
  }

  private addLog(event: Omit<AuthLogEvent, 'timestamp'>) {
    if (!this.enabled) return

    const logEvent: AuthLogEvent = {
      ...event,
      timestamp: Date.now()
    }

    this.logs.push(logEvent)
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Console output in development
    if (process.env.NODE_ENV === 'development') {
      const emoji = this.getEmoji(event.type)
      const message = this.formatLogMessage(logEvent)
      
      switch (event.type) {
        case 'error':
        case 'login_failure':
        case 'rate_limit':
          console.error(`${emoji} ${message}`)
          break
        case 'session_expire':
          console.warn(`${emoji} ${message}`)
          break
        default:
          console.log(`${emoji} ${message}`)
      }
    }
  }

  private getEmoji(type: AuthLogEvent['type']): string {
    const emojiMap = {
      login_attempt: '🔐',
      login_success: '✅',
      login_failure: '❌',
      logout: '👋',
      session_refresh: '🔄',
      session_expire: '⏰',
      rate_limit: '🚫',
      error: '💥'
    }
    return emojiMap[type] || '📝'
  }

  private formatLogMessage(event: AuthLogEvent): string {
    const baseInfo = [
      event.email ? `Email: ${event.email}` : null,
      event.userId ? `User: ${event.userId}` : null,
      event.ip ? `IP: ${event.ip}` : null
    ].filter(Boolean).join(' | ')

    let message = `${event.type.toUpperCase()}`
    if (baseInfo) {
      message += ` - ${baseInfo}`
    }
    
    if (event.error) {
      message += ` - Error: ${event.error}`
    }

    if (event.details && Object.keys(event.details).length > 0) {
      message += ` - Details: ${JSON.stringify(event.details)}`
    }

    return message
  }

  logLoginAttempt(email: string, ip?: string, userAgent?: string) {
    this.addLog({
      type: 'login_attempt',
      email,
      ip,
      userAgent
    })
  }

  logLoginSuccess(userId: string, email: string, ip?: string, userAgent?: string) {
    this.addLog({
      type: 'login_success',
      userId,
      email,
      ip,
      userAgent
    })
  }

  logLoginFailure(email: string, reason: string, ip?: string, userAgent?: string) {
    this.addLog({
      type: 'login_failure',
      email,
      error: reason,
      ip,
      userAgent
    })
  }

  logLogout(userId: string, email: string, reason?: string) {
    this.addLog({
      type: 'logout',
      userId,
      email,
      details: reason ? { reason } : undefined
    })
  }

  logSessionRefresh(userId: string, email: string) {
    this.addLog({
      type: 'session_refresh',
      userId,
      email
    })
  }

  logSessionExpire(userId: string, email: string, reason?: string) {
    this.addLog({
      type: 'session_expire',
      userId,
      email,
      details: reason ? { reason } : undefined
    })
  }

  logRateLimit(email: string, ip?: string, remaining?: number) {
    this.addLog({
      type: 'rate_limit',
      email,
      ip,
      details: remaining !== undefined ? { remaining } : undefined
    })
  }

  logError(error: string, context?: Record<string, any>) {
    this.addLog({
      type: 'error',
      error,
      details: context
    })
  }

  // Get logs for debugging/admin purposes
  getLogs(limit?: number): AuthLogEvent[] {
    const recentLogs = [...this.logs].reverse() // Most recent first
    return limit ? recentLogs.slice(0, limit) : recentLogs
  }

  // Get logs by type
  getLogsByType(type: AuthLogEvent['type'], limit?: number): AuthLogEvent[] {
    const filtered = this.logs.filter(log => log.type === type)
    return limit ? filtered.slice(-limit) : filtered
  }

  // Get failed login attempts for specific email
  getFailedAttempts(email: string, withinMinutes: number = 15): AuthLogEvent[] {
    const cutoff = Date.now() - (withinMinutes * 60 * 1000)
    return this.logs.filter(log => 
      log.type === 'login_failure' && 
      log.email === email && 
      log.timestamp > cutoff
    )
  }

  // Get statistics
  getStats(): {
    total: number
    byType: Record<string, number>
    recentActivity: number
    uniqueUsers: number
  } {
    const byType: Record<string, number> = {}
    const uniqueUsers = new Set<string>()
    const oneHourAgo = Date.now() - (60 * 60 * 1000)
    let recentActivity = 0

    for (const log of this.logs) {
      byType[log.type] = (byType[log.type] || 0) + 1
      
      if (log.userId) {
        uniqueUsers.add(log.userId)
      }
      
      if (log.timestamp > oneHourAgo) {
        recentActivity++
      }
    }

    return {
      total: this.logs.length,
      byType,
      recentActivity,
      uniqueUsers: uniqueUsers.size
    }
  }

  // Clear logs (for admin use)
  clearLogs() {
    this.logs = []
    console.log('🧹 Auth logs cleared')
  }
}

// Singleton instance
export const authLogger = new AuthLogger()