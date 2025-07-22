// Central export file for all validation schemas
export * from './contact'
export * from './property'
export * from './transaction'
export * from './user'

// Common validation utilities
import { z } from 'zod'

// Common ID validation
export const idSchema = z.object({
  id: z.string().transform(Number).pipe(z.number().int().positive())
})

// Pagination schema
export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).default('10')
})

// Date range validation
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().transform((date) => new Date(date)),
  endDate: z.string().datetime().transform((date) => new Date(date))
}).refine((data) => data.endDate > data.startDate, {
  message: 'Bitiş tarixi başlama tarixindən sonra olmalıdır',
  path: ['endDate']
})

// Export types
export type IdInput = z.infer<typeof idSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type DateRangeInput = z.infer<typeof dateRangeSchema>