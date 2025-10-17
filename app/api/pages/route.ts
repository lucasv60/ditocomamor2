import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, createSuccessResponse } from '@/lib/error-handler'
import { validateAndSanitize, createPageSchema } from '@/lib/validation'
import { invalidatePageCache } from '@/lib/cache'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate and sanitize input
    const validation = validateAndSanitize(createPageSchema, body)
    if (!validation.success) {
      return createSuccessResponse(null, `Dados inválidos: ${validation.errors.join(', ')}`, 400)
    }

    const pageData = validation.data

    const page = await prisma.lovePage.create({
      data: {
        pageName: pageData.pageName,
        pageTitle: pageData.pageTitle,
        startDate: pageData.startDate,
        loveText: pageData.loveText,
        youtubeUrl: pageData.youtubeUrl || null,
        photos: JSON.stringify(pageData.photos),
      },
    })

    // Invalidate cache for this page
    invalidatePageCache(page.pageName)

    return createSuccessResponse(page, 'Página criada com sucesso')
  } catch (error) {
    return handleApiError(error)
  }
}