import { NextRequest } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { handleApiError, createSuccessResponse } from '@/lib/error-handler'

export async function POST(request: NextRequest) {
  try {
    console.log('=== UPLOAD PHOTO API STARTED ===')

    const formData = await request.formData()
    const file = formData.get('file') as File
    const caption = formData.get('caption') as string || ''

    if (!file) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Arquivo não encontrado',
        code: 'MISSING_FILE'
      }), { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Tipo de arquivo não suportado. Use apenas JPG, PNG, GIF ou WebP',
        code: 'INVALID_FILE_TYPE'
      }), { status: 400 })
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Arquivo muito grande. Tamanho máximo: 5MB',
        code: 'FILE_TOO_LARGE'
      }), { status: 400 })
    }

    // Generate unique filename
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`
    console.log('Generated filename:', fileName)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseServer.storage
      .from('memories-photos')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('=== PHOTO UPLOAD ERROR ===')
      console.error('Upload error for file:', fileName, 'Error:', uploadError)
      return new Response(JSON.stringify({
        success: false,
        error: 'Erro ao fazer upload da foto',
        code: 'UPLOAD_ERROR',
        details: uploadError
      }), { status: 500 })
    }

    // Get signed URL for secure access
    const { data: signedUrlData, error: signedUrlError } = await supabaseServer.storage
      .from('memories-photos')
      .createSignedUrl(fileName, 60 * 60 * 24) // 24 hours

    if (signedUrlError) {
      console.error('=== SIGNED URL ERROR ===')
      console.error('Signed URL error for file:', fileName, 'Error:', signedUrlError)
      return new Response(JSON.stringify({
        success: false,
        error: 'Erro ao gerar URL segura da foto',
        code: 'SIGNED_URL_ERROR',
        details: signedUrlError
      }), { status: 500 })
    }

    console.log('Photo uploaded successfully. Signed URL:', signedUrlData.signedUrl)

    return createSuccessResponse({
      url: signedUrlData.signedUrl,
      fileName: fileName,
      caption: caption
    }, 'Foto enviada com sucesso')

  } catch (error) {
    console.error('=== UNEXPECTED ERROR ===')
    console.error('Unexpected error in upload:', error)
    return handleApiError(error)
  }
}