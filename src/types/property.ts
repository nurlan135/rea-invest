export interface Property {
  id: number
  documentNumber: string
  registrationDate: string
  district: string
  projectName?: string
  streetAddress: string
  apartmentNumber?: string
  roomCount: string
  area: number
  floor: number
  documentType: string
  repairStatus: string
  propertyType: string
  purpose: string
  status: string
  lastFollowUpDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
  owner: {
    id: number
    firstName: string
    lastName: string
    fatherName?: string
    phone: string
  }
  agent: {
    id: number
    fullName: string
    email: string
  }
  transaction?: {
    id: number
    purchasePrice?: number
    salePrice?: number
    serviceFee?: number
    profit?: number
    saleDate?: string
    buyer?: {
      id: number
      firstName: string
      lastName: string
      phone: string
    }
    deposit?: {
      id: number
      amount: number
      depositDate: string
      deadline: string
      isExpired: boolean
    }
  }
}

export interface PropertyFilters {
  district?: string
  status?: string
  propertyType?: string
  purpose?: string
  minArea?: string
  maxArea?: string
  roomCount?: string
}

export interface Contact {
  id: number
  firstName: string
  lastName: string
  fatherName?: string
  phone: string
  type: 'OWNER' | 'BUYER'
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: number
  propertyId: number
  purchasePrice?: number
  repairExpense?: number
  documentationExpense?: number
  interestExpense?: number
  otherExpense?: number
  salePrice?: number
  serviceFee?: number
  profit?: number
  saleDate?: string
  buyerId?: number
  purchasingEntity: string
  agentId: number
  createdAt: string
  updatedAt: string
  property: {
    id: number
    documentNumber: string
    district: string
    streetAddress: string
    owner: Contact
  }
  buyer?: Contact
  agent: {
    id: number
    fullName: string
    email: string
  }
  deposit?: {
    id: number
    amount: number
    depositDate: string
    deadline: string
    isExpired: boolean
  }
}