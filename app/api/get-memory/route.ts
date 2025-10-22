import { NextRequest } from "next/server"
import { handleApiError, createSuccessResponse } from '@/lib/error-handler'
import { supabaseServer } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memoryId = searchParams.get('id')

    if (!memoryId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'ID da memória é obrigatório',
        code: 'VALIDATION_ERROR'
      }), { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from('memories')
      .select('*')
      .eq('id', memoryId)
      .single()

    if (error || !data) {
      console.error('Erro ao buscar memória:', error)
      return new Response(JSON.stringify({
        success: false,
        error: 'Memória não encontrada',
        code: 'NOT_FOUND'
      }), { status: 404 })
    }

    return createSuccessResponse(data, 'Memória encontrada com sucesso')
  } catch (error) {
    return handleApiError(error)
  }
}