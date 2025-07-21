'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter, X } from 'lucide-react'
import { PropertyFilters as IPropertyFilters } from '@/types/property'

interface PropertyFiltersProps {
  onFiltersChange: (filters: IPropertyFilters) => void
  onSearch: (searchTerm: string) => void
}

const districts = [
  'Abşeron', 'Binəqədi', 'Xətai', 'Xəzər', 'Yasamal', 'Nizami', 
  'Nərimanov', 'Nəsimi', 'Sabunçu', 'Suraxanı', 'Səbail'
]

const statusOptions = [
  { value: 'YENI', label: 'Yeni' },
  { value: 'GOZLEMEDE', label: 'Gözləmədə' },
  { value: 'BEH_VERILIB', label: 'Beh Verilib' },
  { value: 'SATILIB', label: 'Satılıb' },
  { value: 'ICAREYE_VERILIB', label: 'İcarəyə Verilib' }
]

const propertyTypes = [
  { value: 'MENZIL', label: 'Mənzil' },
  { value: 'HEYET_EVI', label: 'Həyət Evi' },
  { value: 'OBYEKT', label: 'Obyekt' },
  { value: 'TORPAQ', label: 'Torpaq' }
]

const purposes = [
  { value: 'SATIS', label: 'Satış' },
  { value: 'ICARE', label: 'İcarə' }
]

export function PropertyFilters({ onFiltersChange, onSearch }: PropertyFiltersProps) {
  const [filters, setFilters] = useState<IPropertyFilters>({
    district: '',
    status: '',
    propertyType: '',
    purpose: '',
    minArea: '',
    maxArea: '',
    roomCount: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const handleFilterChange = (key: keyof IPropertyFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    onSearch(value)
  }

  const clearFilters = () => {
    const emptyFilters: IPropertyFilters = {
      district: '',
      status: '',
      propertyType: '',
      purpose: '',
      minArea: '',
      maxArea: '',
      roomCount: ''
    }
    setFilters(emptyFilters)
    setSearchTerm('')
    onFiltersChange(emptyFilters)
    onSearch('')
  }

  const activeFiltersCount = Object.values(filters).filter(value => value !== '').length

  return (
    <div className="space-y-4">
      {/* Axtarış və Filter Toggle */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Əmlak axtar... (sənəd nömrəsi, ünvan, sahib adı)"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtrlər
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 bg-blue-500 text-white text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        {activeFiltersCount > 0 && (
          <Button variant="outline" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Təmizlə
          </Button>
        )}
      </div>

      {/* Filtrlər */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ətraflı Filtrlər</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Rayon */}
              <div>
                <label className="text-sm font-medium mb-1 block">Rayon</label>
                <Select value={filters.district || ''} onValueChange={(value: string) => handleFilterChange('district', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rayon seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Hamısı</SelectItem>
                    {districts.map(district => (
                      <SelectItem key={district} value={district}>{district}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={filters.status || ''} onValueChange={(value: string) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Hamısı</SelectItem>
                    {statusOptions.map(status => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Əmlak Növü */}
              <div>
                <label className="text-sm font-medium mb-1 block">Əmlak Növü</label>
                <Select value={filters.propertyType || ''} onValueChange={(value: string) => handleFilterChange('propertyType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Növ seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Hamısı</SelectItem>
                    {propertyTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Təyinat */}
              <div>
                <label className="text-sm font-medium mb-1 block">Təyinat</label>
                <Select value={filters.purpose || ''} onValueChange={(value: string) => handleFilterChange('purpose', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Təyinat seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Hamısı</SelectItem>
                    {purposes.map(purpose => (
                      <SelectItem key={purpose.value} value={purpose.value}>{purpose.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sahə aralığı */}
              <div>
                <label className="text-sm font-medium mb-1 block">Min Sahə (m²)</label>
                <Input
                  type="number"
                  placeholder="50"
                  value={filters.minArea || ''}
                  onChange={(e) => handleFilterChange('minArea', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Max Sahə (m²)</label>
                <Input
                  type="number"
                  placeholder="200"
                  value={filters.maxArea || ''}
                  onChange={(e) => handleFilterChange('maxArea', e.target.value)}
                />
              </div>

              {/* Otaq sayı */}
              <div>
                <label className="text-sm font-medium mb-1 block">Otaq Sayı</label>
                <Select value={filters.roomCount || ''} onValueChange={(value: string) => handleFilterChange('roomCount', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Otaq sayı" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Hamısı</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="2-dən 3-ə">2-dən 3-ə</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="3-dən 4-ə">3-dən 4-ə</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aktiv filtrlər */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null
            
            let label = value
            if (key === 'district') label = `Rayon: ${value}`
            if (key === 'status') label = `Status: ${statusOptions.find(s => s.value === value)?.label || value}`
            if (key === 'propertyType') label = `Növ: ${propertyTypes.find(t => t.value === value)?.label || value}`
            if (key === 'purpose') label = `Təyinat: ${purposes.find(p => p.value === value)?.label || value}`
            if (key === 'minArea') label = `Min sahə: ${value}m²`
            if (key === 'maxArea') label = `Max sahə: ${value}m²`
            if (key === 'roomCount') label = `Otaq: ${value}`

            return (
              <Badge key={key} variant="secondary" className="px-3 py-1">
                {label}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => handleFilterChange(key as keyof IPropertyFilters, '')}
                />
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}