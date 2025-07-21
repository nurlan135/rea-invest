import { UserRole } from '@prisma/client'

export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  isActive: boolean
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

declare module 'next-auth' {
  interface Session {
    user: AuthUser
  }
  
  interface User {
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
  }
}