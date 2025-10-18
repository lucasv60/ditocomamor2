import { NextRequest } from 'next/server'
import { handleApiError, createSuccessResponse, UploadError } from '@/lib/error-handler'
import { validateAndSanitize, fileUploadSchema } from '@/lib/validation'
import { supabaseServer } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      throw new UploadError('Nenhum arquivo enviado')
    }

    // Validate file using schema
    const validation = validateAndSanitize(fileUploadSchema, { file })
    if (!validation.success) {
      return createSuccessResponse(null, `Arquivo inválido: ${validation.errors.join(', ')}`, 400)
    }

    // Converter arquivo para buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload para Supabase Storage
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`
    const { data: uploadData, error: uploadError } = await supabaseServer.storage
      .from('memories-photos')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new UploadError('Erro ao fazer upload da foto')
    }

    const { data: { publicUrl } } = supabaseServer.storage
      .from('memories-photos')
      .getPublicUrl(fileName)

    return createSuccessResponse({
      url: publicUrl,
      public_id: fileName
    }, 'Arquivo enviado com sucesso')

  } catch (error) {
    return handleApiError(error)
  }
}