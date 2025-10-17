import { NextRequest } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { handleApiError, createSuccessResponse, UploadError } from '@/lib/error-handler'
import { validateAndSanitize, fileUploadSchema } from '@/lib/validation'

// Fallback para local storage se Cloudinary não estiver configurado
const useLocalStorage = !process.env.CLOUDINARY_CLOUD_NAME

let cloudinary: any = null

if (!useLocalStorage) {
  try {
    const cloudinaryModule = require('cloudinary')
    cloudinary = cloudinaryModule.v2
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
  } catch (error) {
    console.warn('Cloudinary não disponível, usando local storage')
  }
}

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

    if (useLocalStorage || !cloudinary) {
      // Fallback: salvar localmente
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filepath = join(process.cwd(), 'public', 'uploads', filename)

      // Criar diretório se não existir
      const fs = await import('fs')
      const path = await import('path')
      const dir = path.dirname(filepath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      await writeFile(filepath, buffer)

      const url = `/uploads/${filename}`
      return createSuccessResponse({
        url,
        public_id: filename
      }, 'Arquivo enviado com sucesso')
    } else {
      // Upload para Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'ditocomamor',
            resource_type: 'image',
            transformation: [
              { width: 1200, height: 1200, crop: 'limit' },
              { quality: 'auto' }
            ]
          },
          (error: any, result: any) => {
            if (error) reject(new UploadError(`Erro no upload: ${error.message}`))
            else resolve(result)
          }
        ).end(buffer)
      })

      return createSuccessResponse({
        url: (result as any).secure_url,
        public_id: (result as any).public_id
      }, 'Arquivo enviado com sucesso')
    }

  } catch (error) {
    return handleApiError(error)
  }
}