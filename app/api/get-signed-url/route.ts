import { NextRequest } from 'next/server'
import { handleApiError, createSuccessResponse } from '@/lib/error-handler'
import { supabaseServer } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { filePath } = await request.json()

    console.log('=== GET-SIGNED-URL API CALLED ===')
    console.log('Received filePath:', filePath)

    if (!filePath) {
      console.error('ERROR: filePath is empty or null')
      return new Response(JSON.stringify({
        success: false,
        error: 'Caminho do arquivo é obrigatório',
        code: 'MISSING_FILEPATH'
      }), { status: 400 })
    }

    console.log('About to call createSignedUrl with filePath:', filePath)

    // Create signed URL for the file
    const { data, error } = await supabaseServer.storage
      .from('memories-photos')
      .createSignedUrl(filePath, 3600) // 1 hour expiration

    if (error) {
      console.error('=== SUPABASE ERROR ===')
      console.error('Error creating signed URL for filePath:', filePath)
      console.error('Supabase error details:', error)
      console.error('Error message:', error.message)
      console.error('Error details:', JSON.stringify(error, null, 2))

      return new Response(JSON.stringify({
        success: false,
        error: `Erro ao gerar URL assinada: ${error.message}`,
        code: 'SUPABASE_ERROR',
        details: error
      }), { status: 500 })
    }

    if (!data || !data.signedUrl) {
      console.error('=== NO SIGNED URL RETURNED ===')
      console.error('Supabase returned data:', data)
      return new Response(JSON.stringify({
        success: false,
        error: 'URL assinada não foi gerada',
        code: 'NO_SIGNED_URL'
      }), { status: 500 })
    }

    console.log('=== SUCCESS ===')
    console.log('Generated signed URL for filePath:', filePath)
    console.log('Signed URL:', data.signedUrl)

    return new Response(JSON.stringify({
      success: true,
      data: {
        signedUrl: data.signedUrl
      },
      message: 'URL assinada gerada com sucesso'
    }), { status: 200 })

  } catch (error) {
    console.error('=== UNEXPECTED ERROR ===')
    console.error('Unexpected error in get-signed-url:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')

    return new Response(JSON.stringify({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR',
      details: error instanceof Error ? error.message : String(error)
    }), { status: 500 })
  }
}