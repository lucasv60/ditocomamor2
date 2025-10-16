import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

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
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de arquivo não suportado' }, { status: 400 })
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande (máximo 5MB)' }, { status: 400 })
    }

    // Converter arquivo para buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    if (useLocalStorage || !cloudinary) {
      // Fallback: salvar localmente
      const filename = `${Date.now()}-${file.name}`
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
      return NextResponse.json({
        url,
        public_id: filename
      })
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
            if (error) reject(error)
            else resolve(result)
          }
        ).end(buffer)
      })

      return NextResponse.json({
        url: (result as any).secure_url,
        public_id: (result as any).public_id
      })
    }

  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}