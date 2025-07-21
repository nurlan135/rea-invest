import { useState, useCallback, useMemo } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = { id, ...toast }
    
    setToasts(prev => [...prev, newToast])
    
    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useMemo(() => {
    const safeAddToast = (type: ToastType, title: string, description?: string) => {
      try {
        return addToast({ type, title, description })
      } catch (error) {
        console.error('Toast error:', error)
        return ''
      }
    }

    return {
      success: (title: string, description?: string) => 
        safeAddToast('success', title, description),
      error: (title: string, description?: string) => 
        safeAddToast('error', title, description),
      warning: (title: string, description?: string) => 
        safeAddToast('warning', title, description),
      info: (title: string, description?: string) => 
        safeAddToast('info', title, description)
    }
  }, [addToast])

  return {
    toasts,
    toast,
    removeToast,
    addToast
  }
}