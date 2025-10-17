import React from 'react'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { ApiError } from './types'

// Custom error classes
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code: string = 'VALIDATION_ERROR'
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code: string = 'DATABASE_ERROR',
    public originalError?: any
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class UploadError extends Error {
  constructor(
    message: string,
    public code: string = 'UPLOAD_ERROR',
    public fileName?: string
  ) {
    super(message)
    this.name = 'UploadError'
  }
}

export class PaymentError extends Error {
  constructor(
    message: string,
    public code: string = 'PAYMENT_ERROR',
    public provider?: string
  ) {
    super(message)
    this.name = 'PaymentError'
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string = 'Muitas tentativas. Tente novamente mais tarde.',
    public code: string = 'RATE_LIMIT_EXCEEDED'
  ) {
    super(message)
    this.name = 'RateLimitError'
  }
}

// Error response helper
export function createErrorResponse(
  error: Error | string,
  statusCode: number = 500
): NextResponse<ApiError> {
  const errorMessage = error instanceof Error ? error.message : error
  const errorCode = error instanceof Error && 'code' in error ? (error as any).code : 'INTERNAL_ERROR'

  console.error(`[${errorCode}] ${errorMessage}`, error instanceof Error ? error.stack : '')

  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
      code: errorCode,
      message: errorMessage,
    } as ApiError,
    { status: statusCode }
  )
}

// Success response helper
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status: statusCode }
  )
}

// Global error handler for API routes
export function handleApiError(error: unknown): NextResponse<ApiError> {
  // Zod validation errors
  if (error instanceof ZodError) {
    const validationErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }))

    return NextResponse.json(
      {
        success: false,
        error: 'Dados de entrada inválidos',
        code: 'VALIDATION_ERROR',
        message: 'Dados de entrada inválidos',
        details: validationErrors,
      } as ApiError,
      { status: 400 }
    )
  }

  // Custom application errors
  if (error instanceof ValidationError) {
    return createErrorResponse(error, 400)
  }

  if (error instanceof DatabaseError) {
    return createErrorResponse(error, 500)
  }

  if (error instanceof UploadError) {
    return createErrorResponse(error, 400)
  }

  if (error instanceof PaymentError) {
    return createErrorResponse(error, 400)
  }

  if (error instanceof RateLimitError) {
    return createErrorResponse(error, 429)
  }

  // Generic error handling
  if (error instanceof Error) {
    // Database connection errors
    if (error.message.includes('connect') || error.message.includes('ECONNREFUSED')) {
      return createErrorResponse(
        new DatabaseError('Erro de conexão com o banco de dados'),
        503
      )
    }

    // File system errors
    if (error.message.includes('ENOENT') || error.message.includes('EACCES')) {
      return createErrorResponse(
        new UploadError('Erro ao processar arquivo'),
        500
      )
    }

    // Generic server error
    return createErrorResponse(error, 500)
  }

  // Unknown error
  return createErrorResponse(
    new Error('Erro interno do servidor'),
    500
  )
}

// Client-side error handler
export function handleClientError(error: unknown): {
  message: string
  code: string
} {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return {
        message: 'Erro de conexão. Verifique sua internet e tente novamente.',
        code: 'NETWORK_ERROR',
      }
    }

    // Validation errors
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return {
        message: 'Dados inválidos. Verifique as informações e tente novamente.',
        code: 'VALIDATION_ERROR',
      }
    }

    return {
      message: error.message,
      code: 'CLIENT_ERROR',
    }
  }

  return {
    message: 'Erro desconhecido ocorreu',
    code: 'UNKNOWN_ERROR',
  }
}

// Logging helper
export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString()
  const contextInfo = context ? `[${context}] ` : ''

  if (error instanceof Error) {
    console.error(`${timestamp} ${contextInfo}Error: ${error.message}`, {
      stack: error.stack,
      name: error.name,
    })
  } else {
    console.error(`${timestamp} ${contextInfo}Unknown error:`, error)
  }
}

// Error boundary helper for React components
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: React.ComponentType<{ error: Error }>
) {
  return class ErrorBoundary extends React.Component<T, { hasError: boolean; error?: Error }> {
    constructor(props: T) {
      super(props)
      this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      logError(error, 'React Error Boundary')
      console.error('Error Info:', errorInfo)
    }

    render() {
      if (this.state.hasError) {
        if (fallback) {
          const FallbackComponent = fallback
          return React.createElement(FallbackComponent, { error: this.state.error! })
        }

        return React.createElement(
          'div',
          { className: 'min-h-screen flex items-center justify-center bg-red-50' },
          React.createElement(
            'div',
            { className: 'text-center p-8' },
            React.createElement(
              'h2',
              { className: 'text-2xl font-bold text-red-600 mb-4' },
              'Algo deu errado'
            ),
            React.createElement(
              'p',
              { className: 'text-red-500 mb-4' },
              'Ocorreu um erro inesperado. Tente recarregar a página.'
            ),
            React.createElement(
              'button',
              {
                onClick: () => window.location.reload(),
                className: 'bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700'
              },
              'Recarregar Página'
            )
          )
        )
      }

      return React.createElement(Component, this.props)
    }
  }
}