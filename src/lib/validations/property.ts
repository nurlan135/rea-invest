import { z } from 'zod'

// Enum Schemas
export const documentTypeSchema = z.enum(['CIXARIS', 'MUQAVILE', 'SERENCAM'])
export const repairStatusSchema = z.enum(['TEMIRLI', 'TEMIRSIZ'])
export const propertyTypeSchema = z.enum(['HEYET_EVI', 'OBYEKT', 'MENZIL', 'TORPAQ'])
export const propertyPurposeSchema = z.enum(['SATIS', 'ICARE'])
export const propertyStatusSchema = z.enum(['YENI', 'GOZLEMEDE', 'BEH_VERILIB', 'SATILIB', 'ICAREYE_VERILIB'])

// Districts (Hardcoded for now - should be moved to database later)
const districts = [
  'Binəqədi', 'Sabunçu', 'Suraxanı', 'Xətai', 'Yasamal', 'Nəsimi', 'Nərimanov', 
  'Nizami', 'Səbail', 'Xəzər', 'Pirallahı', 'Qaradağ', 'Ramana', 'Abşeron'
] as const
export const districtSchema = z.enum(districts)

// Create Property Schema
export const createPropertySchema = z.object({
  district: districtSchema,
  
  projectName: z.string()
    .max(100, 'Layihə adı maksimum 100 simvol ola bilər')
    .optional(),
  
  streetAddress: z.string()
    .min(5, 'Ünvan ən azı 5 simvol olmalıdır')
    .max(200, 'Ünvan maksimum 200 simvol ola bilər'),
  
  apartmentNumber: z.string()
    .max(10, 'Mənzil nömrəsi maksimum 10 simvol ola bilər')
    .optional(),
  
  roomCount: z.string()
    .regex(/^[1-9]\d*$/, 'Otaq sayı müsbət tam ədəd olmalıdır'),
  
  area: z.number()
    .positive('Sahə müsbət rəqəm olmalıdır')
    .max(10000, 'Sahə maksimum 10000 m² ola bilər'),
  
  floor: z.number()
    .int('Mərtəbə tam ədəd olmalıdır')
    .min(-5, 'Mərtəbə -5-dən kiçik ola bilməz')
    .max(100, 'Mərtəbə 100-dən böyük ola bilməz'),
  
  documentType: documentTypeSchema,
  repairStatus: repairStatusSchema,
  propertyType: propertyTypeSchema,
  purpose: propertyPurposeSchema,
  status: propertyStatusSchema.default('YENI'),
  
  notes: z.string()
    .max(500, 'Qeydlər maksimum 500 simvol ola bilər')
    .optional(),
  
  ownerId: z.number()
    .int('Sahibin ID-si tam ədəd olmalıdır')
    .positive('Sahibin ID-si müsbət olmalıdır'),
  
  lastFollowUpDate: z.string()
    .datetime('Düzgün tarix formatı daxil edin')
    .optional()
    .transform((date) => date ? new Date(date) : undefined)
})

// Update Property Schema
export const updatePropertySchema = createPropertySchema.partial().extend({
  id: z.number().int().positive()
})

// Property Query Schema
export const propertyQuerySchema = z.object({
  search: z.string().optional(),
  district: districtSchema.optional(),
  propertyType: propertyTypeSchema.optional(),
  purpose: propertyPurposeSchema.optional(),
  status: propertyStatusSchema.optional(),
  minArea: z.string().optional().transform((val) => val ? Number(val) : undefined),
  maxArea: z.string().optional().transform((val) => val ? Number(val) : undefined),
  page: z.string().optional().default('1').transform(Number).pipe(z.number().int().positive()),
  limit: z.string().optional().default('10').transform(Number).pipe(z.number().int().positive().max(100))
}).optional()

// Type exports
export type CreatePropertyInput = z.infer<typeof createPropertySchema>
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>
export type PropertyQueryInput = z.infer<typeof propertyQuerySchema>