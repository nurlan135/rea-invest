'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'

interface Property {
  id: number
  status: string
  notes?: string
  lastFollowUpDate?: string
  documentNumber: string
  district: string
  streetAddress: string
}

interface StatusUpdateModalProps {
  property: Property | null
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

const statusOptions = [
  { value: 'YENI', label: 'Yeni', color: 'bg-blue-500' },
  { value: 'GOZLEMEDE', label: 'Gözləmədə', color: 'bg-yellow-500' },
  { value: 'BEH_VERILIB', label: 'Beh Verilib', color: 'bg-orange-500' },
  { value: 'SATILIB', label: 'Satılıb', color: 'bg-green-500' },
  { value: 'ICAREYE_VERILIB', label: 'İcarəyə Verilib', color: 'bg-purple-500' }
]

export function StatusUpdateModal({ property, isOpen, onClose, onUpdate }: StatusUpdateModalProps) {
  const [status, setStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [lastFollowUpDate, setLastFollowUpDate] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Property dəyişdikdə state-ləri yenilə
  useEffect(() => {
    if (property) {
      setStatus(property.status || '')
      setNotes(property.notes || '')
      setLastFollowUpDate(
        property.lastFollowUpDate ? new Date(property.lastFollowUpDate) : null
      )
    } else {
      // Property null olduqda state-ləri təmizlə
      setStatus('')
      setNotes('')
      setLastFollowUpDate(null)
    }
  }, [property])

  const handleSubmit = async () => {
    // Property null olub-olmadığını yoxla
    if (!property) {
      console.error('Property is null')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          notes,
          lastFollowUpDate: lastFollowUpDate?.toISOString()
        })
      })

      if (response.ok) {
        onUpdate()
        onClose()
      } else {
        console.error('Status update failed')
      }
    } catch (error) {
      console.error('Status update error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Property null-dursa modal-ı göstərmə
  if (!property) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Status və Məlumat Yeniləmə</DialogTitle>
          <DialogDescription>
            {property.documentNumber} - {property.district}, {property.streetAddress}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Status seçimi */}
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status seçin" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${option.color}`} />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Son əlaqə tarixi */}
          <div>
            <label className="text-sm font-medium mb-2 block">Son Əlaqə Tarixi</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {lastFollowUpDate ? format(lastFollowUpDate, 'dd/MM/yyyy') : 'Tarix seçin'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={lastFollowUpDate || undefined}
                  onSelect={(date: Date | undefined) => setLastFollowUpDate(date || null)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Qeydlər */}
          <div>
            <label className="text-sm font-medium mb-2 block">Qeydlər</label>
            <Textarea
              placeholder="Əlavə qeydlər və məlumatlar..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Ləğv et
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Yenilənir...' : 'Yenilə'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}