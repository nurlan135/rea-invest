'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'

export function SessionStatus() {
  const { data: session } = useSession()
  const [timeLeft, setTimeLeft] = useState<number>(30 * 60) // 30 dəqiqə

  useEffect(() => {
    if (!session) return

    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [session])

  if (!session || timeLeft > 5 * 60) return null // 5 dəqiqədən artıq qalıbsa göstərmə

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Badge variant="outline" className="text-orange-600 border-orange-300">
      <Clock className="h-3 w-3 mr-1" />
      Sessiya: {formatTime(timeLeft)}
    </Badge>
  )
}