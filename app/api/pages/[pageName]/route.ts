import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, createSuccessResponse } from '@/lib/error-handler'
import { withApiMiddleware } from '@/lib/middleware'
import { pageCache } from '@/lib/cache'

export async function GET(
  request: NextRequest,
  { params }: { params: { pageName: string } }
) {
  try {
    const pageName = params.pageName

    // Check cache first
    const cacheKey = `page:${pageName}`
    const cachedPage = pageCache.get(cacheKey)
    if (cachedPage) {
      return createSuccessResponse(cachedPage)
    }

    const page = await prisma.lovePage.findUnique({
      where: { pageName }
    })

    if (!page) {
      return createSuccessResponse(null, 'Página não encontrada', 404)
    }

    // Cache the result
    pageCache.set(cacheKey, page)

    return createSuccessResponse(page)
  } catch (error) {
    return handleApiError(error)
  }
}