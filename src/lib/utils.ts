import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { NextResponse } from 'next/server'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as a currency string.
 * @param amount The number to format.
 * @param currency The currency code (e.g., 'USD', 'EUR', 'AZN').
 * @param locale The locale to use for formatting (e.g., 'en-US', 'de-DE', 'az-AZ').
 * @returns The formatted currency string.
 */
export function formatCurrency(
  amount: number,
  currency: string = 'AZN',
  locale: string = 'az-AZ'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formats a date into a more readable string.
 * @param date The date to format (can be a Date object, string, or number).
 * @param locale The locale to use for formatting.
 * @returns The formatted date string.
 */
export function formatDate(
  date: Date | string | number,
  locale: string = 'az-AZ'
): string {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Generates a URL-friendly slug from a string.
 * @param text The string to convert to a slug.
 * @returns The slugified string.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
}

/**
 * Truncates a string to a specified length and adds an ellipsis.
 * @param text The string to truncate.
 * @param maxLength The maximum length of the string.
 * @returns The truncated string.
 */
export function truncate(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.slice(0, maxLength) + '...'
}

/**
 * Creates a delay for a specified amount of time.
 * @param ms The number of milliseconds to wait.
 * @returns A promise that resolves after the delay.
 */
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * A simple utility to handle API responses consistently.
 * @param status The HTTP status code.
 * @param data The response data or error object.
 * @returns A Next.js NextResponse object.
 */
export function apiResponse(status: number, data: any) {
  return NextResponse.json(data, { status })
}
