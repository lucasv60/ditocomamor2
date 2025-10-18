import { NextRequest } from "next/server"
import { handleApiError, createSuccessResponse, PaymentError } from '@/lib/error-handler'
import { validateAndSanitize, paymentSchema } from '@/lib/validation'
import { supabaseServer } from '@/lib/supabase'
import * as mercadopago from 'mercadopago'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = validateAndSanitize(paymentSchema, body)
    if (!validation.success) {
      return createSuccessResponse(null, `Dados inválidos: ${validation.errors.join(', ')}`, 400)
    }

    const { pageData, customerEmail, customerName } = validation.data

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
    const uploadedPhotoUrls: string[] = []
    if (pageData.photos && pageData.photos.length > 0) {
      for (const photo of pageData.photos) {
        if (photo.file) {
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${photo.file.name.split('.').pop()}`
          const { data: uploadData, error: uploadError } = await supabaseServer.storage
            .from('memories-photos')
            .upload(fileName, photo.file)

          if (uploadError) {
            console.error('Upload error:', uploadError)
            throw new PaymentError('Erro ao fazer upload das fotos')
          }

          const { data: { publicUrl } } = supabaseServer.storage
            .from('memories-photos')
            .getPublicUrl(fileName)

          uploadedPhotoUrls.push(publicUrl)
        }
      }
    }

    // Create memory record in Supabase
    console.log('=== CREATING MEMORY RECORD ===')
    console.log('Insert data:', {
      slug: pageData.pageName,
      title: pageData.pageTitle,
      love_letter_content: pageData.loveText,
      relationship_start_date: pageData.startDate ? new Date(pageData.startDate).toISOString().split('T')[0] : null,
      photos_urls: uploadedPhotoUrls.length > 0 ? uploadedPhotoUrls : null,
      youtube_music_url: pageData.youtubeUrl || null,
      payment_status: 'pending'
    })

    const { data: memoryData, error: memoryError } = await supabaseServer
      .from('memories')
      .insert({
        slug: pageData.pageName,
        title: pageData.pageTitle,
        love_letter_content: pageData.loveText,
        relationship_start_date: pageData.startDate ? new Date(pageData.startDate).toISOString().split('T')[0] : null,
        photos_urls: uploadedPhotoUrls.length > 0 ? uploadedPhotoUrls : null,
        youtube_music_url: pageData.youtubeUrl || null,
        payment_status: 'pending'
      })
      .select()
      .single()

    if (memoryError) {
      console.error('=== DATABASE INSERT ERROR ===')
      console.error('Memory insert failed with error:', memoryError)
      console.error('Error code:', memoryError.code)
      console.error('Error message:', memoryError.message)
      console.error('Error details:', memoryError.details)
      console.error('Error hint:', memoryError.hint)
      throw new PaymentError(`Erro ao salvar dados da memória: ${memoryError.message}`)
    }

    console.log('=== MEMORY RECORD CREATED SUCCESSFULLY ===')
    console.log('Created memory:', memoryData)

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
