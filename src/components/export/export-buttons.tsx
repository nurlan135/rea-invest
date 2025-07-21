'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, FileSpreadsheet } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function ExportButtons() {
  const [isExporting, setIsExporting] = useState('')
  const [error, setError] = useState('')

  const handleExport = async (type: 'properties' | 'transactions') => {
    setIsExporting(type)
    setError('')

    try {
      const response = await fetch(`/api/export/${type}`)
      
      if (!response.ok) {
        throw new Error('Export uğursuz oldu')
      }

      // Fayl yüklə
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      // Fayl adını response header-dən götür
      const contentDisposition = response.headers.get('content-disposition')
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `${type}-${new Date().toISOString().split('T')[0]}.xlsx`
      
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Export zamanı xəta baş verdi')
    } finally {
      setIsExporting('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button
          onClick={() => handleExport('properties')}
          disabled={isExporting === 'properties'}
          variant="outline"
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          {isExporting === 'properties' ? 'Yüklənir...' : 'Əmlakları Excel-ə Yüklə'}
        </Button>

        <Button
          onClick={() => handleExport('transactions')}
          disabled={isExporting === 'transactions'}
          variant="outline"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting === 'transactions' ? 'Yüklənir...' : 'Əməliyyatları Excel-ə Yüklə'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}