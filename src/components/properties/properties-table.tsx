'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { Property } from '@/types/property'
import { ExportButtons } from '@/components/export/export-buttons'
import { PropertyEditForm } from './property-edit-form'
import { PropertyView } from './property-view'

const statusColors = {
  YENI: 'bg-blue-500',
  GOZLEMEDE: 'bg-yellow-500', 
  BEH_VERILIB: 'bg-orange-500',
  SATILIB: 'bg-green-500',
  ICAREYE_VERILIB: 'bg-purple-500'
} as const

const statusLabels = {
  YENI: 'Yeni',
  GOZLEMEDE: 'Gözləmədə',
  BEH_VERILIB: 'Beh Verilib',
  SATILIB: 'Satılıb',
  ICAREYE_VERILIB: 'İcarəyə Verilib'
} as const

interface PropertiesTableProps {
  properties: Property[]
  onPropertyUpdated?: () => void
}

export function PropertiesTable({ properties, onPropertyUpdated }: PropertiesTableProps) {
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [viewingPropertyId, setViewingPropertyId] = useState<string | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const handleViewClick = (propertyId: string) => {
    setViewingPropertyId(propertyId)
    setIsViewDialogOpen(true)
  }

  const handleEditClick = (propertyId: string) => {
    setEditingPropertyId(propertyId)
    setIsEditDialogOpen(true)
  }

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false)
    setEditingPropertyId(null)
    onPropertyUpdated?.()
  }

  const handleEditCancel = () => {
    setIsEditDialogOpen(false)
    setEditingPropertyId(null)
  }

  const handleViewClose = () => {
    setIsViewDialogOpen(false)
    setViewingPropertyId(null)
  }

  const handleViewEdit = () => {
    setIsViewDialogOpen(false)
    setViewingPropertyId(null)
    if (viewingPropertyId) {
      handleEditClick(viewingPropertyId)
    }
  }
  if (properties.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500 text-lg">Hələ heç bir əmlak əlavə edilməyib</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Əmlak Siyahısı</CardTitle>
            <CardDescription>Ümumi {properties.length} əmlak</CardDescription>
          </div>
          <ExportButtons />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Sənəd №</th>
                <th className="text-left p-3">Ünvan</th>
                <th className="text-left p-3">Otaq/Sahə</th>
                <th className="text-left p-3">Sahib</th>
                <th className="text-left p-3">Agent</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-sm">{property.documentNumber}</td>
                  <td className="p-3">
                    <div>
                      <div className="font-medium">{property.district}</div>
                      <div className="text-sm text-gray-500">{property.streetAddress}</div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm">
                      <div>{property.roomCount} otaq</div>
                      <div className="text-gray-500">{property.area} m²</div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div>
                      <div className="font-medium">
                        {property.owner.firstName} {property.owner.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{property.owner.phone}</div>
                    </div>
                  </td>
                  <td className="p-3 text-sm">{property.agent.fullName}</td>
                  <td className="p-3">
                    <Badge 
                      className={`${statusColors[property.status as keyof typeof statusColors]} text-white`}
                    >
                      {statusLabels[property.status as keyof typeof statusLabels]}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewClick(property.id.toString())}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditClick(property.id.toString())}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Əmlak Məlumatları</DialogTitle>
          </DialogHeader>
          {viewingPropertyId && (
            <PropertyView
              propertyId={viewingPropertyId}
              onEdit={handleViewEdit}
              onClose={handleViewClose}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Əmlakı Redaktə Et</DialogTitle>
          </DialogHeader>
          {editingPropertyId && (
            <PropertyEditForm
              propertyId={editingPropertyId}
              onSuccess={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}