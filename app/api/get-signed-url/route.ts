import { NextRequest } from 'next/server'
import { handleApiError, createSuccessResponse } from '@/lib/error-handler'
import { supabaseServer } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { filePath } = await request.json()

    console.log('Received filePath:', filePath)

    if (!filePath) {
      return createSuccessResponse(null, 'Caminho do arquivo é obrigatório', 400)
    }

    // Create signed URL for the file
    const { data, error } = await supabaseServer.storage
      .from('memories-photos')
      .createSignedUrl(filePath, 3600) // 1 hour expiration

    if (error) {
      console.error('Error creating signed URL for filePath:', filePath, 'Error:', error)
      return createSuccessResponse(null, `Erro ao gerar URL assinada: ${error.message}`, 500)
    }

    console.log('Generated signed URL for filePath:', filePath, 'Signed URL:', data.signedUrl)

    return createSuccessResponse({
      signedUrl: data.signedUrl
    }, 'URL assinada gerada com sucesso')

  } catch (error) {
    console.error('Unexpected error in get-signed-url:', error)
    return handleApiError(error)
  }
}