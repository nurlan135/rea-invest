'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Bell, AlertTriangle, Clock, CheckCircle } from 'lucide-react'

interface Notification {
  id: string
  type: 'warning' | 'info' | 'success'
  title: string
  message: string
  date: Date
  read: boolean
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      // Mock məlumatlar - real API hazır olmasa belə işləsin
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'warning',
          title: 'Vaxtı Keçmiş Depozit',
          message: 'REA-0001 - Depozit vaxtı keçib',
          date: new Date(),
          read: false
        }
      ]
      setNotifications(mockNotifications)
    } catch (error) {
      console.error('Notifications fetch error:', error)
      // Xəta halında boş massiv
      setNotifications([])
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'info': return <Clock className="h-4 w-4 text-blue-500" />
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-5 h-5 flex items-center justify-center p-0">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Bildirişlər</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="secondary">
                  {unreadCount} yeni
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                Yeni bildiriş yoxdur
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">
                        {notification.title}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        {notification.date.toLocaleDateString('az-AZ')}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}