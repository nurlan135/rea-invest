'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Toast as ToastType, ToastType as Type } from '@/hooks/useToast'

interface ToastProps {
  toast: ToastType
  onRemove: (id: string) => void
}

const toastIcons: Record<Type, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
}

const toastStyles: Record<Type, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800'
}

const iconStyles: Record<Type, string> = {
  success: 'text-green-400',
  error: 'text-red-400', 
  warning: 'text-yellow-400',
  info: 'text-blue-400'
}

function Toast({ toast, onRemove }: ToastProps) {
  const Icon = toastIcons[toast.type]

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id)
    }, toast.duration || 5000)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  return (
    <div className={cn(
      'max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto border',
      toastStyles[toast.type],
      'animate-in slide-in-from-right-full'
    )}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={cn('h-5 w-5', iconStyles[toast.type])} />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium">{toast.title}</p>
            {toast.description && (
              <p className="mt-1 text-sm opacity-90">{toast.description}</p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={cn(
                'rounded-md inline-flex hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2',
                iconStyles[toast.type]
              )}
              onClick={() => onRemove(toast.id)}
            >
              <span className="sr-only">Bağla</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastType[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 max-w-sm">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>,
    document.body
  )
}