'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { CustomersTable } from '@/components/customers/customers-table'
import { CustomerForm } from '@/components/customers/customer-form'
import { CustomerFilters } from '@/components/filters/customer-filters'
import { PageLoading } from '@/components/ui/page-loading'
import { Contact, CustomerFilters as ICustomerFilters } from '@/types/customer'
import { useCache } from '@/hooks/useCache'
import { invalidateCache } from '@/lib/cache'
import { useDebounce } from '@/hooks/useDebounce'

const defaultFilters: ICustomerFilters = {
  search: '',
  type: 'ALL',
  address: ''
}

export default function CustomersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filters, setFilters] = useState<ICustomerFilters>(defaultFilters)
  const debouncedFilters = useDebounce(filters, 300)

  const { data: customers, isLoading, error, refetch } = useCache<Contact[]>(
    '/api/contacts',
    { key: 'contacts' }
  )

  const safeCustomers = customers || []

  const filteredCustomers = useMemo(() => {
    if (!customers) return []
    
    return customers.filter(customer => {
      const matchesSearch = !debouncedFilters.search || 
        customer.firstName.toLowerCase().includes(debouncedFilters.search.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(debouncedFilters.search.toLowerCase()) ||
        customer.phone.includes(debouncedFilters.search)
      
      const matchesType = debouncedFilters.type === 'ALL' || customer.type === debouncedFilters.type
      
      const matchesAddress = !debouncedFilters.address || 
        (customer.address && customer.address.toLowerCase().includes(debouncedFilters.address.toLowerCase()))
      
      return matchesSearch && matchesType && matchesAddress
    })
  }, [customers, debouncedFilters])

  const handleSuccess = useCallback(() => {
    setIsDialogOpen(false)
    invalidateCache('contacts')
    refetch()
  }, [refetch])

  const handleFilterChange = useCallback((newFilters: Partial<ICustomerFilters>) => {
    setFilters((prev: ICustomerFilters) => ({ ...prev, ...newFilters }))
  }, [])

  // Auto-refresh when new contacts are added (e.g., from property form)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cache-invalidated' && e.newValue === 'contacts') {
        refetch()
      }
    }

    const handleFocus = () => {
      // Refresh data when user returns to the tab
      refetch()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [refetch])

  if (isLoading) {
    return <PageLoading />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-red-600 text-center">Müştərilər yüklənərkən xəta baş verdi</p>
        <Button onClick={() => refetch()} variant="outline">
          Yenidən cəhd et
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Müştərilər</h1>
          <p className="text-gray-600">Əmlak sahibləri və alıcıları idarə edin</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Müştəri
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni Müştəri Əlavə Et</DialogTitle>
            </DialogHeader>
            <CustomerForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <CustomerFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {filteredCustomers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {safeCustomers.length === 0 
              ? 'Hələ müştəri əlavə edilməyib' 
              : 'Axtarış şərtlərinə uyğun müştəri tapılmadı'
            }
          </p>
          {safeCustomers.length === 0 && (
            <Button onClick={() => setIsDialogOpen(true)}>
              İlk müştərini əlavə et
            </Button>
          )}
        </div>
      ) : (
        <CustomersTable 
          customers={filteredCustomers}
          onRefresh={refetch}
        />
      )}
    </div>
  )
}