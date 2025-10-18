import { NextRequest } from 'next/server'
import { handleApiError, createSuccessResponse } from '@/lib/error-handler'
import { supabaseServer } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { filePath } = await request.json()

    if (!filePath) {
      return createSuccessResponse(null, 'Caminho do arquivo é obrigatório', 400)
    }

    // Create signed URL for the file
    const { data, error } = await supabaseServer.storage
      .from('memories-photos')
      .createSignedUrl(filePath, 3600) // 1 hour expiration

    if (error) {
      console.error('Error creating signed URL:', error)
      return createSuccessResponse(null, 'Erro ao gerar URL assinada', 500)
    }

    return createSuccessResponse({
      signedUrl: data.signedUrl
    }, 'URL assinada gerada com sucesso')

  } catch (error) {
    return handleApiError(error)
  }
}