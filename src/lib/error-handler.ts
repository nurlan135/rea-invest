import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

// Error types
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR'
}

// Custom error class
export class AppError extends Error {
  public readonly type: ErrorType
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly details?: Record<string, unknown>

  constructor(
    message: string,
    type: ErrorType,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: Record<string, unknown>
  ) {
    super(message)
    this.type = type
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.details = details

    Error.captureStackTrace(this, this.constructor)
  }
}

// Error response interface
interface ErrorResponse {
  error: string
  type?: ErrorType
  details?: Record<string, unknown>
  timestamp: string
  path?: string
}

// Main error handler function
export function handleApiError(
  error: unknown,
  path?: string
): NextResponse<ErrorResponse> {
  console.error('API Error:', {
    error,
    path,
    timestamp: new Date().toISOString(),
    stack: error instanceof Error ? error.stack : undefined
  })

  // Handle custom AppError
  if (error instanceof AppError) {
    return NextResponse.json({
      error: error.message,
      type: error.type,
      details: error.details,
      timestamp: new Date().toISOString(),
      path
    }, { status: error.statusCode })
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json({
      error: 'Validasiya xətası',
      type: ErrorType.VALIDATION_ERROR,
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      })),
      timestamp: new Date().toISOString(),
      path
    }, { status: 400 })
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        return NextResponse.json({
          error: 'Bu məlumat artıq mövcuddur',
          type: ErrorType.CONFLICT,
          details: {
            target: error.meta?.target,
            code: error.code
          },
          timestamp: new Date().toISOString(),
          path
        }, { status: 409 })

      case 'P2025': // Record not found
        return NextResponse.json({
          error: 'Axtarılan məlumat tapılmadı',
          type: ErrorType.NOT_FOUND,
          details: {
            code: error.code
          },
          timestamp: new Date().toISOString(),
          path
        }, { status: 404 })

      case 'P2003': // Foreign key constraint violation
        return NextResponse.json({
          error: 'Əlaqəli məlumat mövcud olduğu üçün bu əməliyyat yerinə yetirilə bilməz',
          type: ErrorType.DATABASE_ERROR,
          details: {
            field: error.meta?.field_name,
            code: error.code
          },
          timestamp: new Date().toISOString(),
          path
        }, { status: 400 })

      default:
        return NextResponse.json({
          error: 'Verilənlər bazası xətası',
          type: ErrorType.DATABASE_ERROR,
          details: {
            code: error.code
          },
          timestamp: new Date().toISOString(),
          path
        }, { status: 500 })
    }
  }

  // Handle other Prisma errors
  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return NextResponse.json({
      error: 'Verilənlər bazası ilə əlaqədə naməlum xəta',
      type: ErrorType.DATABASE_ERROR,
      timestamp: new Date().toISOString(),
      path
    }, { status: 500 })
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return NextResponse.json({
      error: 'Verilənlər bazası xidməti xətası',
      type: ErrorType.DATABASE_ERROR,
      timestamp: new Date().toISOString(),
      path
    }, { status: 500 })
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return NextResponse.json({
      error: 'Verilənlər bazası inisilaizasiya xətası',
      type: ErrorType.DATABASE_ERROR,
      timestamp: new Date().toISOString(),
      path
    }, { status: 500 })
  }

  // Handle generic errors
  if (error instanceof Error) {
    return NextResponse.json({
      error: process.env.NODE_ENV === 'production' 
        ? 'Daxili server xətası' 
        : error.message,
      type: ErrorType.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path
    }, { status: 500 })
  }

  // Handle unknown errors
  return NextResponse.json({
    error: 'Naməlum xəta baş verdi',
    type: ErrorType.INTERNAL_SERVER_ERROR,
    timestamp: new Date().toISOString(),
    path
  }, { status: 500 })
}

// Convenience functions for common errors
export const createAuthError = (message: string = 'İcazə yoxdur') => 
  new AppError(message, ErrorType.AUTHENTICATION_ERROR, 401)

export const createAuthorizationError = (message: string = 'Bu əməliyyat üçün icazəniz yoxdur') => 
  new AppError(message, ErrorType.AUTHORIZATION_ERROR, 403)

export const createNotFoundError = (resource: string = 'Məlumat') => 
  new AppError(`${resource} tapılmadı`, ErrorType.NOT_FOUND, 404)

export const createConflictError = (message: string) => 
  new AppError(message, ErrorType.CONFLICT, 409)

export const createValidationError = (message: string, details?: Record<string, unknown>) => 
  new AppError(message, ErrorType.VALIDATION_ERROR, 400, true, details)

export const createRateLimitError = (message: string = 'Çox sayda sorğu göndərdiniz. Bir az gözləyin.') => 
  new AppError(message, ErrorType.RATE_LIMIT_ERROR, 429)

// Wrapper function for API routes
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      // Extract path from request if available
      let path: string | undefined
      if (args[0] && typeof args[0] === 'object' && 'url' in args[0]) {
        const request = args[0] as { url: string }
        path = new URL(request.url).pathname
      }
      
      return handleApiError(error, path)
    }
  }
}