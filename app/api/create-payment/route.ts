import { NextRequest } from "next/server"
import { handleApiError, createSuccessResponse, PaymentError } from '@/lib/error-handler'
import { validateAndSanitize, paymentSchema } from '@/lib/validation'
import { supabaseServer } from '@/lib/supabase'

// Verify we're using the correct client
console.log('=== SUPABASE CLIENT VERIFICATION ===')
console.log('Using supabaseServer client for database operations')
console.log('Client type check:', typeof supabaseServer)
console.log('Client has from method:', typeof supabaseServer.from)
import { MercadoPagoConfig, Preference } from 'mercadopago'

export async function POST(request: NextRequest) {
  try {
    console.log('=== CREATE PAYMENT API STARTED ===')
    console.log('Request method:', request.method)
    console.log('Content-Type:', request.headers.get('content-type'))

    // Read JSON body
    console.log('=== READING JSON BODY ===')
    const body = await request.json()
    console.log('CORPO RECEBIDO:', JSON.stringify(body))
    console.log('Request body keys:', Object.keys(body))

    // Extract fields from JSON with safe defaults
    const { pageData, customerEmail, customerName, skipPayment } = body
    const pageName = pageData?.pageName || ''
    const pageTitle = pageData?.pageTitle || ''
    const startDate = pageData?.startDate || null
    const loveText = pageData?.loveText || ''
    const youtubeUrl = pageData?.youtubeUrl || ''
    const photos = pageData?.photos || []

    console.log('=== EXTRACTED FORM FIELDS ===')
    console.log('pageName:', pageName)
    console.log('pageTitle:', pageTitle)
    console.log('startDate:', startDate)
    console.log('loveText:', loveText?.substring(0, 50) + '...')
    console.log('youtubeUrl:', youtubeUrl)
    console.log('customerEmail:', customerEmail)
    console.log('customerName:', customerName)

    // Generate slug from title with uniqueness check
    let baseSlug = pageName || (pageTitle ? pageTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : '')
    let generatedSlug = baseSlug
    let counter = 1

    // Check if slug exists and generate unique one
    while (true) {
      try {
        const { data: existingMemory } = await supabaseServer
          .from('memories')
          .select('id')
          .eq('slug', generatedSlug)
          .single()

        if (!existingMemory) {
          // Slug is available
          break
        }

        // Slug exists, increment counter
        generatedSlug = `${baseSlug}-${counter}`
        counter++
      } catch (error) {
        // If error (slug doesn't exist), it's available
        break
      }
    }

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

    // Process photos - now photos is an array of objects with uploaded URLs
    console.log('PHOTOS COUNT:', photos?.length || 0)

    // Extract photo URLs from the uploaded photos
    const uploadedPhotoUrls: string[] = []
    if (photos && photos.length > 0) {
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i]
        console.log('Processing uploaded photo', i + 1, ':', photo)

        // Photo should already be uploaded, just extract the URL
        if (photo && photo.preview) {
          uploadedPhotoUrls.push(photo.preview)
          console.log('Added photo URL:', photo.preview)
        } else {
          console.log('Photo', i + 1, 'has no preview URL, skipping')
        }
      }
    }
    console.log('=== PHOTO PROCESSING COMPLETE ===')
    console.log('Total processed photos:', uploadedPhotoUrls.length)

    // Create pageDataObject from form fields
    const pageDataObject = {
      pageName: generatedSlug,
      pageTitle,
      startDate: formattedDate,
      loveText,
      youtubeUrl: youtubeUrl || '',
      photos: (photos || []).map((photoObj: any, index: number) => ({
        preview: photoObj.preview,
        caption: photoObj.caption || `Foto ${index + 1}`,
        public_id: photoObj.public_id || ''
      }))
    }

    console.log('=== PAGEDATA CREATED ===')
    console.log('pageDataObject:', JSON.stringify(pageDataObject, null, 2))
    console.log('customerEmail:', customerEmail)
    console.log('customerName:', customerName)

    // Create memory record in Supabase
    console.log('=== CREATING MEMORY RECORD ===')
    const dataToInsert = {
      slug: generatedSlug,
      title: pageTitle,
      love_letter_content: loveText,
      relationship_start_date: formattedDate,
      photos_urls: uploadedPhotoUrls.length > 0 ? uploadedPhotoUrls : null,
      youtube_music_url: youtubeUrl || null,
      payment_status: skipPayment ? 'paid' : 'pending'
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

    // Skip Mercado Pago if skipPayment flag is set
    if (skipPayment) {
      console.log('=== SKIPPING MERCADO PAGO - RETURNING SUCCESS ===')
      return createSuccessResponse({
        slug: memoryData.slug,
      }, 'Página criada com sucesso')
    }

    // Mercado Pago API configuration (only if not skipping payment)
    let client: any = null
    if (!skipPayment) {
      const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN

      if (!MERCADO_PAGO_ACCESS_TOKEN) {
        throw new PaymentError('Mercado Pago não configurado')
      }

      // Configure Mercado Pago
      client = new MercadoPagoConfig({
        accessToken: MERCADO_PAGO_ACCESS_TOKEN
      })
    }

    // Create payment preference with IPN notification URL (only if client is configured)
    const preferenceData = {
      items: [
        {
          id: `memory-${memoryData.id}`,
          title: `Página de Amor: ${pageDataObject.pageTitle}`,
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
        slug: pageDataObject.pageName,
      },
    }

    const preference = new Preference(client)
    const preferenceResponse = await preference.create({ body: preferenceData })

    if (!preferenceResponse) {
      throw new PaymentError('Erro ao criar preferência de pagamento')
    }

    console.log('=== PREFERENCE RESPONSE ===')
    console.log('Response:', preferenceResponse)

    // Update memory with preference_id
    console.log('=== UPDATING MEMORY WITH PREFERENCE ID ===')
    console.log('Updating memory ID:', memoryData.id, 'with preference_id:', preferenceResponse.id)

    const { error: updateError } = await supabaseServer
      .from('memories')
      .update({ preference_id: preferenceResponse.id })
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
      init_point: preferenceResponse.init_point,
      preference_id: preferenceResponse.id,
    }, 'Preferência de pagamento criada com sucesso')
  } catch (error) {
    return handleApiError(error)
  }
}
