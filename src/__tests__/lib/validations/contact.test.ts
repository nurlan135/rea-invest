import { describe, it, expect } from 'vitest'
import { 
  createContactSchema, 
  updateContactSchema, 
  contactQuerySchema,
  type CreateContactInput 
} from '@/lib/validations/contact'

describe('Contact Validations', () => {
  describe('createContactSchema', () => {
    it('should validate valid contact data', () => {
      const validData: CreateContactInput = {
        firstName: 'Memmed',
        lastName: 'Eliyev', 
        fatherName: 'Hesen',
        phone: '+994501234567',
        address: 'Bakı şəhəri, Nəsimi rayonu',
        type: 'OWNER'
      }

      const result = createContactSchema.parse(validData)
      expect(result).toEqual({
        ...validData,
        phone: '+994501234567' // Phone should be cleaned
      })
    })

    it('should clean phone number by removing spaces', () => {
      const data = {
        firstName: 'Memmed',
        lastName: 'Eliyev',
        phone: '+994 50 123 45 67',
        type: 'OWNER'
      }

      const result = createContactSchema.parse(data)
      expect(result.phone).toBe('+994501234567')
    })

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '123456789',           // Too short
        '+1234567890123',      // Wrong country code
        '+994401234567',       // Invalid operator code
        'invalid-phone'        // Non-numeric
      ]

      invalidPhones.forEach(phone => {
        const data = {
          firstName: 'Test',
          lastName: 'User',
          phone,
          type: 'OWNER' as const
        }
        
        expect(() => createContactSchema.parse(data)).toThrow()
      })
    })

    it('should reject names with invalid characters', () => {
      const invalidNames = [
        'Məmməd123',          // Contains numbers
        'Test@User',          // Contains symbols
        'A',                  // Too short
        'A'.repeat(51)        // Too long
      ]

      invalidNames.forEach(name => {
        const data = {
          firstName: name,
          lastName: 'Valid',
          phone: '+994501234567',
          type: 'OWNER' as const
        }
        
        expect(() => createContactSchema.parse(data)).toThrow()
      })
    })

    it('should validate optional fields', () => {
      const minimalData = {
        firstName: 'Memmed',
        lastName: 'Eliyev',
        phone: '+994501234567',
        type: 'OWNER' as const
      }

      const result = createContactSchema.parse(minimalData)
      expect(result).toEqual(minimalData)
    })
  })

  describe('updateContactSchema', () => {
    it('should allow partial updates', () => {
      const partialData = {
        id: 1,
        firstName: 'Updated Name'
      }

      const result = updateContactSchema.parse(partialData)
      expect(result).toEqual(partialData)
    })

    it('should require valid ID', () => {
      const invalidIds = [-1, 0, 'invalid', 1.5]

      invalidIds.forEach(id => {
        const data = { id, firstName: 'Test' }
        expect(() => updateContactSchema.parse(data)).toThrow()
      })
    })
  })

  describe('contactQuerySchema', () => {
    it('should parse valid query parameters', () => {
      const queryParams = {
        search: 'Memmed',
        type: 'OWNER',
        page: '2',
        limit: '20'
      }

      const result = contactQuerySchema.parse(queryParams)
      expect(result).toEqual({
        search: 'Memmed',
        type: 'OWNER',
        page: 2,
        limit: 20
      })
    })

    it('should use default values for pagination', () => {
      const result = contactQuerySchema.parse({})
      expect(result?.page).toBe(1)
      expect(result?.limit).toBe(10)
    })

    it('should reject invalid pagination values', () => {
      const invalidQueries = [
        { page: '0' },        // Page must be positive
        { limit: '0' },       // Limit must be positive
        { limit: '101' }      // Limit too high
      ]

      invalidQueries.forEach(query => {
        expect(() => contactQuerySchema.parse(query)).toThrow()
      })
    })

    it('should handle undefined input', () => {
      const result = contactQuerySchema.parse(undefined)
      expect(result).toBeUndefined()
    })
  })
})