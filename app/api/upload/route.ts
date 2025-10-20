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

    // Get public URL
    const { data: { publicUrl } } = supabaseServer.storage
      .from('memories-photos')
      .getPublicUrl(fileName)

    console.log('Photo uploaded successfully. Public URL:', publicUrl)

    return createSuccessResponse({
      url: publicUrl,
      fileName: fileName,
      caption: caption
    }, 'Foto enviada com sucesso')

  } catch (error) {
    console.error('=== UNEXPECTED ERROR ===')
    console.error('Unexpected error in upload:', error)
    return handleApiError(error)
  }
}