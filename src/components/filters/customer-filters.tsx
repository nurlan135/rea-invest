'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Filter } from 'lucide-react'
import { CustomerFilters as ICustomerFilters } from '@/types/customer'

interface CustomerFiltersProps {
  filters: ICustomerFilters
  onFilterChange: (filters: Partial<ICustomerFilters>) => void
}

export function CustomerFilters({ filters, onFilterChange }: CustomerFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Axtarış */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Ad, soyad və ya telefon nömrəsi ilə axtarın..."
                value={filters.search}
                onChange={(e) => onFilterChange({ search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          {/* Ünvan axtarışı */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Ünvan ilə axtarın..."
                value={filters.address}
                onChange={(e) => onFilterChange({ address: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          {/* Müştəri növü */}
          <div className="w-full sm:w-48">
            <Select 
              value={filters.type} 
              onValueChange={(value: 'ALL' | 'OWNER' | 'BUYER') => onFilterChange({ type: value })}
            >
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Növ" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Bütün müştərilər</SelectItem>
                <SelectItem value="OWNER">Əmlak sahibləri</SelectItem>
                <SelectItem value="BUYER">Alıcılar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Aktiv filtrlər göstəricisi */}
        {(filters.search || filters.type !== 'ALL') && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.search && (
              <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center gap-1">
                <Search className="h-3 w-3" />
                Axtarış: "{filters.search}"
              </div>
            )}
            {filters.type !== 'ALL' && (
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm flex items-center gap-1">
                <Filter className="h-3 w-3" />
                Növ: {filters.type === 'OWNER' ? 'Əmlak sahibləri' : 'Alıcılar'}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}