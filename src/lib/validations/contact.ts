import { z } from 'zod'

// Contact Type Enum
export const contactTypeSchema = z.enum(['OWNER', 'BUYER', 'TENANT'])

// Create Contact Schema
export const createContactSchema = z.object({
  firstName: z.string()
    .min(2, 'Ad ən azı 2 hərf olmalıdır')
    .max(50, 'Ad maksimum 50 hərf ola bilər')
    .regex(/^[a-zA-Z\u0259\u018F\u00F6\u00D6\u00FC\u00DC\u0131\u0049\u011F\u011E\u015F\u015E\u00E7\u00C7\s\-]+$/, 'Ad yalnız hərflərdən ibarət olmalıdır'),
  
  lastName: z.string()
    .min(2, 'Soyad ən azı 2 hərf olmalıdır')
    .max(50, 'Soyad maksimum 50 hərf ola bilər')
    .regex(/^[a-zA-Z\u0259\u018F\u00F6\u00D6\u00FC\u00DC\u0131\u0049\u011F\u011E\u015F\u015E\u00E7\u00C7\s\-]+$/, 'Soyad yalnız hərflərdən ibarət olmalıdır'),
  
  fatherName: z.string()
    .min(2, 'Ata adı ən azı 2 hərf olmalıdır')
    .max(50, 'Ata adı maksimum 50 hərf ola bilər')
    .regex(/^[a-zA-Z\u0259\u018F\u00F6\u00D6\u00FC\u00DC\u0131\u0049\u011F\u011E\u015F\u015E\u00E7\u00C7\s\-]+$/, 'Ata adı yalnız hərflərdən ibarət olmalıdır')
    .optional(),
  
  phone: z.string()
    .transform((phone) => phone.replace(/\s/g, '')) // Remove spaces first
    .pipe(z.string().regex(/^(\+994|0)(50|51|55|70|77|99)[0-9]{7}$/, 'Düzgün telefon nömrəsi daxil edin (məs: +994501234567)')),
  
  address: z.string()
    .max(200, 'Ünvan maksimum 200 simvol ola bilər')
    .optional(),
  
  type: contactTypeSchema
})

// Update Contact Schema
export const updateContactSchema = createContactSchema.partial().extend({
  id: z.number().int().positive()
})

// Contact Query Schema
export const contactQuerySchema = z.object({
  search: z.string().optional(),
  type: contactTypeSchema.optional(),
  page: z.string().optional().default('1').transform(Number).pipe(z.number().int().positive()),
  limit: z.string().optional().default('10').transform(Number).pipe(z.number().int().positive().max(100))
}).optional()

// Type exports
export type CreateContactInput = z.infer<typeof createContactSchema>
export type UpdateContactInput = z.infer<typeof updateContactSchema>
export type ContactQueryInput = z.infer<typeof contactQuerySchema>