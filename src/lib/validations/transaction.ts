import { z } from 'zod'

// Decimal validation helper
const decimalSchema = z.number()
  .nonnegative('Məbləğ mənfi ola bilməz')
  .max(999999999, 'Məbləğ çox böyükdür')
  .multipleOf(0.01, 'Məbləğ ən çox 2 onluq yer ola bilər')

// Create Transaction Schema
export const createTransactionSchema = z.object({
  propertyId: z.number()
    .int('Əmlak ID-si tam ədəd olmalıdır')
    .positive('Əmlak ID-si müsbət olmalıdır'),
  
  purchasePrice: decimalSchema
    .positive('Alış qiyməti müsbət olmalıdır')
    .optional(),
  
  repairExpense: decimalSchema
    .default(0),
  
  documentationExpense: decimalSchema
    .default(0),
  
  interestExpense: decimalSchema
    .default(0),
  
  otherExpense: decimalSchema
    .default(0),
  
  salePrice: decimalSchema
    .positive('Satış qiyməti müsbət olmalıdır')
    .optional(),
  
  serviceFee: decimalSchema
    .default(0),
  
  saleDate: z.string()
    .datetime('Düzgün tarix formatı daxil edin')
    .optional()
    .transform((date) => date ? new Date(date) : undefined),
  
  buyerId: z.number()
    .int('Alıcının ID-si tam ədəd olmalıdır')
    .positive('Alıcının ID-si müsbət olmalıdır')
    .optional(),
  
  purchasingEntity: z.string()
    .min(1, 'Alıcı təşkilat adı boş ola bilməz')
    .max(100, 'Alıcı təşkilat adı maksimum 100 simvol ola bilər')
    .default('REA INVEST')
})

// Update Transaction Schema
export const updateTransactionSchema = createTransactionSchema.partial().extend({
  id: z.number().int().positive()
})

// Deposit Schema
export const createDepositSchema = z.object({
  transactionId: z.number()
    .int('Əməliyyat ID-si tam ədəd olmalıdır')
    .positive('Əməliyyat ID-si müsbət olmalıdır'),
  
  amount: decimalSchema
    .positive('Beh məbləği müsbət olmalıdır'),
  
  depositDate: z.string()
    .datetime('Düzgün tarix formatı daxil edin')
    .transform((date) => new Date(date)),
  
  deadline: z.string()
    .datetime('Düzgün tarix formatı daxil edin')
    .transform((date) => new Date(date))
})
.refine((data) => data.deadline > data.depositDate, {
  message: 'Beh müddəti beh tarixindən sonra olmalıdır',
  path: ['deadline']
})

// Transaction Query Schema
export const transactionQuerySchema = z.object({
  search: z.string().optional(),
  hasSale: z.string().transform((val) => val === 'true').optional(),
  minProfit: z.string().transform(Number).pipe(z.number()).optional(),
  maxProfit: z.string().transform(Number).pipe(z.number()).optional(),
  dateFrom: z.string().datetime().optional().transform((date) => date ? new Date(date) : undefined),
  dateTo: z.string().datetime().optional().transform((date) => date ? new Date(date) : undefined),
  page: z.string().transform(Number).pipe(z.number().int().positive()).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).default('10')
}).optional()

// Type exports
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
export type CreateDepositInput = z.infer<typeof createDepositSchema>
export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>