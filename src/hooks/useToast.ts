import { useState, useCallback } from 'react'

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

  const toast = {
    success: useCallback((title: string, description?: string) => 
      addToast({ type: 'success', title, description }), [addToast]),
    error: useCallback((title: string, description?: string) => 
      addToast({ type: 'error', title, description }), [addToast]),
    warning: useCallback((title: string, description?: string) => 
      addToast({ type: 'warning', title, description }), [addToast]),
    info: useCallback((title: string, description?: string) => 
      addToast({ type: 'info', title, description }), [addToast])
  }

  return {
    toasts,
    toast,
    removeToast,
    addToast
  }
}