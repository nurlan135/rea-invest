'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertTriangle, Clock } from 'lucide-react'

interface SessionWarningModalProps {
  isOpen: boolean
  onExtend: () => void
  onLogout: () => void
  timeRemaining: number // seconds
}

export function SessionWarningModal({ 
  isOpen, 
  onExtend, 
  onLogout, 
  timeRemaining: initialTime 
}: SessionWarningModalProps) {
  const [timeLeft, setTimeLeft] = useState(Math.floor(initialTime / 1000))

  useEffect(() => {
    if (!isOpen) return

    setTimeLeft(Math.floor(initialTime / 1000))

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onLogout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isOpen, initialTime, onLogout])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <DialogTitle>Sessiya Vaxtı Bitir</DialogTitle>
              <DialogDescription>
                İcraat və əmriyyatlarınızı yadda saxlamaq üçün sessiyaınızı uzatın
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="text-center py-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-orange-500" />
            <span className="text-2xl font-mono font-bold text-orange-600">
              {formatTime(timeLeft)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Bu müddət ərzində heç bir fəaliyyət olmazsa, təhlükəsizlik üçün sistemdən avtomatik çıxış ediləcək.
          </p>
          
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onLogout}>
              İndi Çıx
            </Button>
            <Button onClick={onExtend} className="bg-blue-600 hover:bg-blue-700">
              Sessiyaı Uzat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}