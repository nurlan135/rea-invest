'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useToast, Toast, ToastType } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/toast'

interface ToastContextType {
  toast: {
    success: (title: string, description?: string) => string
    error: (title: string, description?: string) => string
    warning: (title: string, description?: string) => string
    info: (title: string, description?: string) => string
  }
  toasts: Toast[]
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, toast, removeToast } = useToast()

  return (
    <ToastContext.Provider value={{ toast, toasts, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider')
  }
  return context
}