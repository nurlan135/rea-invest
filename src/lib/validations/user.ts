import { z } from 'zod'

// User Role Enum
export const userRoleSchema = z.enum(['ADMIN', 'AGENT'])

// Password validation
export const passwordSchema = z.string()
  .min(8, 'Şifrə ən azı 8 simvol olmalıdır')
  .max(100, 'Şifrə maksimum 100 simvol ola bilər')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Şifrə ən azı bir kiçik hərf, bir böyük hərf və bir rəqəm ehtiva etməlidir')

// Create User Schema (Admin only)
export const createUserSchema = z.object({
  email: z.string()
    .email('Düzgün email ünvanı daxil edin')
    .max(100, 'Email maksimum 100 simvol ola bilər')
    .toLowerCase(),
  
  fullName: z.string()
    .min(2, 'Tam ad ən azı 2 hərf olmalıdır')
    .max(100, 'Tam ad maksimum 100 hərf ola bilər')
    .regex(/^[a-zA-ZəӘöÖüÜıIğĞşŞçÇ\s]+$/, 'Tam ad yalnız hərflərdən ibarət olmalıdır'),
  
  password: passwordSchema,
  
  role: userRoleSchema.default('AGENT')
})

// Update User Schema
export const updateUserSchema = z.object({
  id: z.number().int().positive(),
  
  email: z.string()
    .email('Düzgün email ünvanı daxil edin')
    .max(100, 'Email maksimum 100 simvol ola bilər')
    .toLowerCase()
    .optional(),
  
  fullName: z.string()
    .min(2, 'Tam ad ən azı 2 hərf olmalıdır')
    .max(100, 'Tam ad maksimum 100 hərf ola bilər')
    .regex(/^[a-zA-ZəӘöÖüÜıIğĞşŞçÇ\s]+$/, 'Tam ad yalnız hərflərdən ibarət olmalıdır')
    .optional(),
  
  role: userRoleSchema.optional(),
  
  isActive: z.boolean().optional()
})

// Change Password Schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Cari şifrə tələb olunur'),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Şifrələr eyni olmalıdır',
  path: ['confirmPassword']
})

// Login Schema
export const loginSchema = z.object({
  email: z.string()
    .email('Düzgün email ünvanı daxil edin')
    .toLowerCase(),
  
  password: z.string().min(1, 'Şifrə tələb olunur')
})

// User Query Schema
export const userQuerySchema = z.object({
  search: z.string().optional(),
  role: userRoleSchema.optional(),
  isActive: z.string().transform((val) => val === 'true').optional(),
  page: z.string().transform(Number).pipe(z.number().int().positive()).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).default('10')
}).optional()

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UserQueryInput = z.infer<typeof userQuerySchema>