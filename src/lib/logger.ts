interface LogData {
  [key: string]: unknown
}

export const logger = {
  info: (message: string, data?: LogData) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${message}`, data || '')
    }
  },
  error: (message: string, error?: Error | unknown) => {
    console.error(`[ERROR] ${message}`, error || '')
  },
  warn: (message: string, data?: LogData) => {
    console.warn(`[WARN] ${message}`, data || '')
  }
}