'use client'

import { useState, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { PropertyForm } from '@/components/properties/property-form'
import { PropertiesTable } from '@/components/properties/properties-table'
import { PropertyFilters } from '@/components/filters/property-filters'
import { PageLoading } from '@/components/ui/page-loading'
import { Property, PropertyFilters as IPropertyFilters } from '@/types/property'
import { useCache } from '@/hooks/useCache'
import { invalidateCache } from '@/lib/cache'
import { useDebounce } from '@/hooks/useDebounce'

export default function PropertiesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filters, setFilters] = useState<IPropertyFilters>({})
  const [searchTerm, setSearchTerm] = useState('')

  // Debounce search to avoid too many filter operations
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Use cache hook for data fetching with enhanced error handling
  const { 
    data: allProperties, 
    isLoading, 
    error,
    refetch 
  } = useCache<Property[]>('/api/properties', {
    key: 'properties-list',
    ttl: 2 * 60 * 1000 // 2 minutes cache
  })

  // Enhanced error logging
  if (error) {
    console.error('Properties page error:', error)
    console.error('Error type:', typeof error)
    console.error('Error details:', JSON.stringify(error, null, 2))
  }

  // Ensure allProperties is always an array
  const safeAllProperties = allProperties || []

  // Highly optimized filtering with useMemo
  const filteredProperties = useMemo(() => {
    if (!safeAllProperties || safeAllProperties.length === 0) return []

    let result = safeAllProperties

    // Search filter - optimized
    if (debouncedSearchTerm && result) {
      const searchLower = debouncedSearchTerm.toLowerCase()
      result = result.filter((property) => {
        // Create searchable string once
        const searchableText = [
          property.documentNumber,
          property.district,
          property.streetAddress,
          property.owner.firstName,
          property.owner.lastName,
          property.owner.phone,
          property.agent.fullName
        ].join(' ').toLowerCase()
        
        return searchableText.includes(searchLower)
      })
    }

    // Apply filters efficiently
    if (Object.values(filters).some(v => v) && result) {
      result = result.filter((property) => {
        // Area filters
        if (filters.minArea && property.area < parseFloat(filters.minArea)) return false
        if (filters.maxArea && property.area > parseFloat(filters.maxArea)) return false
        
        // Exact match filters
        if (filters.district && property.district !== filters.district) return false
        if (filters.status && property.status !== filters.status) return false
        if (filters.propertyType && property.propertyType !== filters.propertyType) return false
        if (filters.purpose && property.purpose !== filters.purpose) return false
        if (filters.roomCount && property.roomCount !== filters.roomCount) return false
        
        return true
      })
    }

    return result
  }, [safeAllProperties, filters, debouncedSearchTerm])

  // Optimized callbacks
  const handlePropertyAdded = useCallback(() => {
    setIsDialogOpen(false)
    invalidateCache('properties')
    refetch()
  }, [refetch])

  const handleFiltersChange = useCallback((newFilters: IPropertyFilters) => {
    setFilters(newFilters)
  }, [])

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  if (isLoading) {
    return <PageLoading />
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-red-500 text-lg mb-4">
            Əmlaklar yüklənərkən xəta baş verdi
          </p>
          <p className="text-gray-600 text-sm mb-4">
            {error.includes('JSON') ? 
              'Server cavabında format xətası var. Lütfən, səhifəni yeniləyin.' : 
              error
            }
          </p>
          <div className="space-x-2">
            <Button onClick={() => refetch()}>Yenidən cəhd et</Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Səhifəni yenilə
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Əmlaklar</h1>
          <p className="text-gray-600">
            Ümumi {safeAllProperties.length} əmlak
            {filteredProperties && filteredProperties.length !== safeAllProperties.length && (
              <span>, göstərilir: {filteredProperties.length}</span>
            )}
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Əmlak Əlavə Et
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Yeni Əmlak Əlavə Et</DialogTitle>
            </DialogHeader>
            <PropertyForm onSuccess={handlePropertyAdded} />
          </DialogContent>
        </Dialog>
      </div>

      <PropertyFilters 
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
      />

      <PropertiesTable 
        properties={filteredProperties || []} 
        onPropertyUpdated={refetch}
      />
    </div>
  )
}