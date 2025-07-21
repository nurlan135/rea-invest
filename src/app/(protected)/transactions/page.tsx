'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { TransactionForm } from '@/components/transactions/transaction-form'
import { TransactionsTable } from '@/components/transactions/transactions-table'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions')
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error('Transactions fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const handleTransactionAdded = () => {
    setIsDialogOpen(false)
    fetchTransactions()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p>Yüklənir...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Əməliyyatlar</h1>
          <p className="text-gray-600">Maliyyə əməliyyatlarının idarə edilməsi</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Əməliyyat Əlavə Et
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Əməliyyat Əlavə Et</DialogTitle>
            </DialogHeader>
            <TransactionForm onSuccess={handleTransactionAdded} />
          </DialogContent>
        </Dialog>
      </div>

      <TransactionsTable transactions={transactions} />
    </div>
  )
}