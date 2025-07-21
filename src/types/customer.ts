export interface Contact {
  id: number
  firstName: string
  lastName: string
  fatherName?: string
  phone: string
  address?: string
  type: 'OWNER' | 'BUYER'
  createdAt: string
  updatedAt: string
  ownedProperties?: {
    id: number
    documentNumber: string
    district: string
    streetAddress: string
    status: string
  }[]
  boughtTransactions?: {
    id: number
    salePrice: number
    saleDate: string
    property: {
      documentNumber: string
      district: string
      streetAddress: string
    }
  }[]
}

export interface CustomerFilters {
  search: string
  type: 'ALL' | 'OWNER' | 'BUYER'
  address: string
}

export interface CreateContactRequest {
  firstName: string
  lastName: string
  fatherName?: string
  phone: string
  address?: string
  type: 'OWNER' | 'BUYER'
}

export interface UpdateContactRequest {
  firstName?: string
  lastName?: string
  fatherName?: string
  phone?: string
  address?: string
  type?: 'OWNER' | 'BUYER'
}