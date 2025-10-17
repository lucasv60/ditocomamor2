import { z } from 'zod'

// Page creation validation schema
export const createPageSchema = z.object({
  pageName: z.string()
    .min(3, 'Nome da página deve ter pelo menos 3 caracteres')
    .max(50, 'Nome da página deve ter no máximo 50 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Nome da página deve conter apenas letras minúsculas, números e hífens')
    .regex(/^[a-z0-9]/, 'Nome da página deve começar com letra ou número')
    .regex(/[a-z0-9]$/, 'Nome da página deve terminar com letra ou número'),

  pageTitle: z.string()
    .min(1, 'Título da página é obrigatório')
    .max(100, 'Título da página deve ter no máximo 100 caracteres')
    .trim(),

  startDate: z.string()
    .refine((date) => {
      const parsedDate = new Date(date)
      return !isNaN(parsedDate.getTime()) && parsedDate <= new Date()
    }, 'Data de início deve ser válida e não pode ser no futuro'),

  loveText: z.string()
    .min(10, 'Carta de amor deve ter pelo menos 10 caracteres')
    .max(2000, 'Carta de amor deve ter no máximo 2000 caracteres')
    .trim(),

  youtubeUrl: z.string()
    .optional()
    .refine((url) => {
      if (!url || url.trim() === '') return true
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/
      return youtubeRegex.test(url.trim())
    }, 'URL do YouTube deve ser válida'),

  photos: z.array(z.object({
    file: z.instanceof(File).optional(),
    preview: z.string().url('URL da foto deve ser válida'),
    caption: z.string().max(200, 'Legenda deve ter no máximo 200 caracteres').optional(),
    public_id: z.string().optional()
  }))
  .min(1, 'Pelo menos uma foto é obrigatória')
  .max(10, 'Máximo de 10 fotos permitidas')
})

// Payment validation schema
export const paymentSchema = z.object({
  pageData: createPageSchema,
  customerEmail: z.string()
    .email('Email deve ser válido')
    .max(254, 'Email muito longo'),
  customerName: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços')
    .trim()
})

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'Arquivo deve ter no máximo 5MB')
    .refine((file) => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type),
      'Tipo de arquivo deve ser JPG, PNG, GIF ou WebP')
})

// Sanitization functions
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
}

export const sanitizeUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url)
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Protocolo não permitido')
    }
    return parsedUrl.toString()
  } catch {
    throw new Error('URL inválida')
  }
}

// Rate limiting helper (basic implementation)
class RateLimiter {
  private requests: Map<string, number[]> = new Map()

  isAllowed(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now()
    const windowStart = now - windowMs

    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, [])
    }

    const userRequests = this.requests.get(identifier)!
    // Remove old requests outside the window
    const recentRequests = userRequests.filter(time => time > windowStart)

    if (recentRequests.length >= maxRequests) {
      return false
    }

    recentRequests.push(now)
    this.requests.set(identifier, recentRequests)
    return true
  }
}

export const rateLimiter = new RateLimiter()

// Input validation helper
export const validateAndSanitize = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => err.message)
      return { success: false, errors }
    }
    return { success: false, errors: ['Erro de validação desconhecido'] }
  }
}