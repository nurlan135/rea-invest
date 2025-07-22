import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, slugify, truncate, wait } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format currency with default AZN', () => {
      const result1 = formatCurrency(1500)
      expect(result1).toContain('1.500,00')
      expect(result1).toContain('₼')
      
      const result2 = formatCurrency(0)
      expect(result2).toContain('0,00')
      expect(result2).toContain('₼')
      
      const result3 = formatCurrency(99.99)
      expect(result3).toContain('99,99')
      expect(result3).toContain('₼')
    })

    it('should format currency with custom currency', () => {
      expect(formatCurrency(1500, 'USD', 'en-US')).toBe('$1,500.00')
      
      const result = formatCurrency(1500, 'EUR', 'de-DE')
      expect(result).toContain('1.500,00')
      expect(result).toContain('€')
    })

    it('should handle large numbers', () => {
      const result = formatCurrency(1000000)
      expect(result).toContain('1.000.000,00')
      expect(result).toContain('₼')
    })

    it('should handle decimal numbers correctly', () => {
      const result = formatCurrency(123.456)
      expect(result).toContain('123,46') // Rounds to 2 decimal places
      expect(result).toContain('₼')
    })
  })

  describe('formatDate', () => {
    it('should format date with default Azerbaijani locale', () => {
      const date = new Date('2023-12-25')
      const formatted = formatDate(date)
      // The exact format depends on locale, but should contain day, month, year
      expect(formatted).toContain('2023')
      expect(formatted).toContain('25')
    })

    it('should format date with custom locale', () => {
      const date = new Date('2023-12-25')
      const formatted = formatDate(date, 'en-US')
      expect(formatted).toContain('December')
      expect(formatted).toContain('25')
      expect(formatted).toContain('2023')
    })

    it('should handle string dates', () => {
      const formatted = formatDate('2023-12-25')
      expect(formatted).toContain('2023')
    })

    it('should handle timestamp numbers', () => {
      const timestamp = new Date('2023-12-25').getTime()
      const formatted = formatDate(timestamp)
      expect(formatted).toContain('2023')
    })
  })

  describe('slugify', () => {
    it('should create URL-friendly slugs', () => {
      expect(slugify('Hello World')).toBe('hello-world')
      expect(slugify('Special Characters!@#')).toBe('special-characters')
      expect(slugify('Multiple   Spaces')).toBe('multiple-spaces')
    })

    it('should handle Azerbaijani characters', () => {
      // These tests check that special characters are removed/converted
      const result1 = slugify('Əmlak İdarəetməsi')
      expect(result1).toMatch(/^[a-z0-9-]+$/) // Should only contain lowercase letters, numbers, and dashes
      
      const result2 = slugify('Gözəl Şəhər')
      expect(result2).toMatch(/^[a-z0-9-]+$/)
    })

    it('should handle empty strings', () => {
      expect(slugify('')).toBe('')
      expect(slugify('   ')).toBe('')
    })

    it('should remove multiple dashes', () => {
      expect(slugify('hello---world')).toBe('hello-world')
      expect(slugify('test--case')).toBe('test-case')
    })
  })

  describe('truncate', () => {
    it('should truncate long strings', () => {
      const longText = 'This is a very long text that should be truncated'
      expect(truncate(longText, 20)).toBe('This is a very long ...')
    })

    it('should not truncate short strings', () => {
      const shortText = 'Short text'
      expect(truncate(shortText, 20)).toBe('Short text')
    })

    it('should use default length of 50', () => {
      const text = 'A'.repeat(60)
      const result = truncate(text)
      expect(result).toHaveLength(53) // 50 chars + '...'
      expect(result.endsWith('...')).toBe(true)
    })

    it('should handle exact length matches', () => {
      const text = 'A'.repeat(20)
      expect(truncate(text, 20)).toBe(text)
    })

    it('should handle empty strings', () => {
      expect(truncate('')).toBe('')
    })
  })

  describe('wait', () => {
    it('should resolve after specified time', async () => {
      const start = Date.now()
      await wait(50) // Wait 50ms
      const end = Date.now()
      
      // Allow some tolerance for timing
      expect(end - start).toBeGreaterThanOrEqual(45)
      expect(end - start).toBeLessThan(100)
    })

    it('should resolve immediately with 0ms', async () => {
      const start = Date.now()
      await wait(0)
      const end = Date.now()
      
      // Allow more tolerance for timing in test environment
      expect(end - start).toBeLessThan(50)
    })
  })
})