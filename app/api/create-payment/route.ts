import { NextRequest } from "next/server"
import { handleApiError, createSuccessResponse, PaymentError } from '@/lib/error-handler'
import { validateAndSanitize, paymentSchema } from '@/lib/validation'
import { supabaseServer } from '@/lib/supabase'

// Verify we're using the correct client
console.log('=== SUPABASE CLIENT VERIFICATION ===')
console.log('Using supabaseServer client for database operations')
console.log('Client type check:', typeof supabaseServer)
console.log('Client has from method:', typeof supabaseServer.from)
import * as mercadopago from 'mercadopago'

export async function POST(request: NextRequest) {
  try {
    console.log('=== CREATE PAYMENT API STARTED ===')
    console.log('Request method:', request.method)
    console.log('Content-Type:', request.headers.get('content-type'))

    // Read JSON body
    console.log('=== READING JSON BODY ===')
    const body = await request.json()
    console.log('Request body keys:', Object.keys(body))

    // Extract fields from JSON
    const { pageName, pageTitle, startDate, loveText, youtubeUrl, customerEmail, customerName, photos } = body

    console.log('=== EXTRACTED FORM FIELDS ===')
    console.log('pageName:', pageName)
    console.log('pageTitle:', pageTitle)
    console.log('startDate:', startDate)
    console.log('loveText:', loveText?.substring(0, 50) + '...')
    console.log('youtubeUrl:', youtubeUrl)
    console.log('customerEmail:', customerEmail)
    console.log('customerName:', customerName)

    // Generate slug from title
    const generatedSlug = pageName || pageTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    console.log('SLUG GERADO:', generatedSlug)

    // Validate required fields
    if (!generatedSlug || !pageTitle || !loveText) {
      console.error('=== VALIDATION FAILED ===')
      console.error('Missing required fields')
      return new Response(JSON.stringify({
        success: false,
        error: 'Campos obrigatórios não preenchidos',
        code: 'VALIDATION_ERROR'
      }), { status: 400 })
    }

    // Format date
    let formattedDate = null
    if (startDate) {
      try {
        const date = new Date(startDate)
        formattedDate = date.toISOString().split('T')[0] // YYYY-MM-DD format
        console.log('FORMATTED DATE:', formattedDate)
      } catch (dateError) {
        console.error('Date parsing error:', dateError)
        formattedDate = null
      }
    }

    // Process photos - now photos is an array of File objects from JSON
    console.log('PHOTOS COUNT:', photos?.length || 0)

    // Create pageData object from form fields
    const pageData = {
      pageName: generatedSlug,
      pageTitle,
      startDate: formattedDate,
      loveText,
      youtubeUrl: youtubeUrl || '',
      photos: (photos || []).map((file: File, index: number) => ({
        file,
        preview: '', // Will be set after upload
        caption: `Foto ${index + 1}`,
        public_id: ''
      }))
    }

    console.log('=== PAGEDATA CREATED ===')
    console.log('pageData:', JSON.stringify(pageData, null, 2))
    console.log('=== VALIDATION PASSED ===')
    console.log('pageData:', JSON.stringify(pageData, null, 2))
    console.log('customerEmail:', customerEmail)
    console.log('customerName:', customerName)

    // Mercado Pago API configuration
    const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN

    if (!MERCADO_PAGO_ACCESS_TOKEN) {
      throw new PaymentError('Mercado Pago não configurado')
    }

    // Configure Mercado Pago
    const mercadopagoClient = require('mercadopago')
    mercadopagoClient.configure({
      access_token: MERCADO_PAGO_ACCESS_TOKEN
    })

    // Upload photos to Supabase Storage
    console.log('=== STARTING PHOTO UPLOAD ===')
    const uploadedPhotoUrls: string[] = []
    if (photos && photos.length > 0) {
      console.log('Found', photos.length, 'photos to upload')
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i]
        console.log('Processing photo', i + 1, ':', photo.name, 'size:', photo.size, 'type:', photo.type)

        if (photo && photo.size > 0) {
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${photo.name.split('.').pop()}`
          console.log('Generated filename:', fileName)

          const { data: uploadData, error: uploadError } = await supabaseServer.storage
            .from('memories-photos')
            .upload(fileName, photo, {
              contentType: photo.type,
              upsert: false
            })

          if (uploadError) {
            console.error('=== PHOTO UPLOAD ERROR ===')
            console.error('Upload error for file:', fileName, 'Error:', uploadError)
            return new Response(JSON.stringify({
              success: false,
              error: 'Erro ao fazer upload das fotos',
              code: 'UPLOAD_ERROR',
              details: uploadError
            }), { status: 500 })
          }

          const { data: { publicUrl } } = supabaseServer.storage
            .from('memories-photos')
            .getPublicUrl(fileName)

          console.log('Photo uploaded successfully. Public URL:', publicUrl)
          uploadedPhotoUrls.push(publicUrl)
        } else {
          console.log('Photo', i + 1, 'has no data or zero size, skipping')
        }
      }
    } else {
      console.log('No photos to upload')
    }
    console.log('=== PHOTO UPLOAD COMPLETE ===')
    console.log('Total uploaded photos:', uploadedPhotoUrls.length)

    // Create memory record in Supabase
    console.log('=== CREATING MEMORY RECORD ===')
    const dataToInsert = {
      slug: generatedSlug,
      title: pageTitle,
      love_letter_content: loveText,
      relationship_start_date: formattedDate,
      photos_urls: uploadedPhotoUrls.length > 0 ? uploadedPhotoUrls : null,
      youtube_music_url: youtubeUrl || null,
      payment_status: 'pending'
    }
    console.log('EXACT DATA TO INSERT:', JSON.stringify(dataToInsert, null, 2))

    let memoryData: any = null
    try {
      const { data, error: memoryError } = await supabaseServer
        .from('memories')
        .insert(dataToInsert)
        .select()
        .single()

      if (memoryError) {
        console.error('=== DATABASE INSERT ERROR ===')
        console.error('Memory insert failed with error:', memoryError)
        console.error('Error code:', memoryError.code)
        console.error('Error message:', memoryError.message)
        console.error('Error details:', memoryError.details)
        console.error('Error hint:', memoryError.hint)
        return new Response(JSON.stringify({
          success: false,
          error: `Erro ao salvar dados da memória: ${memoryError.message}`,
          code: 'DATABASE_ERROR',
          details: memoryError
        }), { status: 500 })
      }

      memoryData = data
      console.log('=== MEMORY RECORD CREATED SUCCESSFULLY ===')
      console.log('Created memory:', memoryData)
    } catch (insertError) {
      console.error('=== UNEXPECTED INSERT ERROR ===')
      console.error('Unexpected error during insert:', insertError)
      return new Response(JSON.stringify({
        success: false,
        error: 'Erro interno durante inserção no banco de dados',
        code: 'INTERNAL_ERROR',
        details: insertError instanceof Error ? insertError.message : String(insertError)
      }), { status: 500 })
    }

    // This code block is now inside the try-catch above

    // Create payment preference with IPN notification URL
    const preference = {
      items: [
        {
          title: `Página de Amor: ${pageData.pageTitle}`,
          description: "Página de amor personalizada com fotos e mensagens",
          quantity: 1,
          unit_price: 1.0,
          currency_id: "BRL",
        },
      ],
      payer: {
        email: customerEmail,
        name: customerName,
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/pagamento/sucesso`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/pagamento/falha`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/pagamento/pendente`,
      },
      auto_return: "approved",
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercadopago-ipn`,
      external_reference: memoryData.id,
      metadata: {
        memory_id: memoryData.id,
        slug: pageData.pageName,
      },
    }

    const preferenceResponse = await mercadopagoClient.preferences.create(preference)

    if (!preferenceResponse || !preferenceResponse.body) {
      throw new PaymentError('Erro ao criar preferência de pagamento')
    }

    const preferenceData = preferenceResponse.body

    // Update memory with preference_id
    console.log('=== UPDATING MEMORY WITH PREFERENCE ID ===')
    console.log('Updating memory ID:', memoryData.id, 'with preference_id:', preferenceData.id)

    const { error: updateError } = await supabaseServer
      .from('memories')
      .update({ preference_id: preferenceData.id })
      .eq('id', memoryData.id)

    if (updateError) {
      console.error('=== UPDATE ERROR ===')
      console.error('Failed to update memory with preference_id:', updateError)
      console.error('Error code:', updateError.code)
      console.error('Error message:', updateError.message)
      // Don't throw here as payment preference was created successfully
    } else {
      console.log('=== MEMORY UPDATED SUCCESSFULLY ===')
    }

    return createSuccessResponse({
      init_point: preferenceData.init_point,
      preference_id: preferenceData.id,
    }, 'Preferência de pagamento criada com sucesso')
  } catch (error) {
    return handleApiError(error)
  }
}
