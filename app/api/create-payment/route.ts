import { NextRequest } from "next/server"
import { handleApiError, createSuccessResponse, PaymentError } from '@/lib/error-handler'
import { validateAndSanitize, paymentSchema } from '@/lib/validation'
import { supabaseServer } from '@/lib/supabase'
import Stripe from 'stripe'

// Verify we're using the correct client
console.log('=== SUPABASE CLIENT VERIFICATION ===')
console.log('Using supabaseServer client for database operations')
console.log('Client type check:', typeof supabaseServer)
console.log('Client has from method:', typeof supabaseServer.from)

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
})

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

    // Create memory record in Supabase with UPSERT
    console.log('=== CREATING MEMORY RECORD WITH UPSERT ===')
    const dataToUpsert = {
      slug: generatedSlug,
      title: pageTitle,
      love_letter_content: loveText,
      relationship_start_date: formattedDate,
      photos_urls: uploadedPhotoUrls.length > 0 ? uploadedPhotoUrls : null,
      youtube_music_url: youtubeUrl || null,
      payment_status: skipPayment ? 'paid' : 'pending'
    }
    console.log('EXACT DATA TO UPSERT:', JSON.stringify(dataToUpsert, null, 2))

    let memoryData: any = null
    try {
      const { data, error: memoryError } = await supabaseServer
        .from('memories')
        .upsert(dataToUpsert, { onConflict: 'slug' })
        .select()
        .single()

      if (memoryError) {
        console.error('=== DATABASE UPSERT ERROR ===')
        console.error('Memory upsert failed with error:', memoryError)
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
      console.log('=== MEMORY RECORD CREATED/UPDATED SUCCESSFULLY ===')
      console.log('Memory data:', memoryData)
    } catch (upsertError) {
      console.error('=== UNEXPECTED UPSERT ERROR ===')
      console.error('Unexpected error during upsert:', upsertError)
      return new Response(JSON.stringify({
        success: false,
        error: 'Erro interno durante upsert no banco de dados',
        code: 'INTERNAL_ERROR',
        details: upsertError instanceof Error ? upsertError.message : String(upsertError)
      }), { status: 500 })
    }

    // Skip Stripe if skipPayment flag is set
    if (skipPayment) {
      console.log('=== SKIPPING STRIPE - RETURNING SUCCESS ===')
      return createSuccessResponse({
        slug: memoryData.slug,
      }, 'Página criada com sucesso')
    }

    // Create Stripe PaymentIntent
    console.log('=== CREATING STRIPE PAYMENT INTENT ===')
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 1000, // R$ 10,00 in cents
        currency: 'brl',
        metadata: {
          memory_slug: generatedSlug,
          memory_id: memoryData.id,
          customer_email: customerEmail,
          customer_name: customerName,
        },
        description: `Página de Amor: ${pageTitle}`,
        receipt_email: customerEmail,
      })

      console.log('=== PAYMENT INTENT CREATED ===')
      console.log('Payment Intent ID:', paymentIntent.id)
      console.log('Client Secret:', paymentIntent.client_secret)

      // Update memory with Stripe payment intent data
      console.log('=== UPDATING MEMORY WITH STRIPE DATA ===')
      const { error: updateError } = await supabaseServer
        .from('memories')
        .update({
          stripe_payment_intent_id: paymentIntent.id,
          stripe_client_secret: paymentIntent.client_secret,
        })
        .eq('id', memoryData.id)

      if (updateError) {
        console.error('=== UPDATE ERROR ===')
        console.error('Failed to update memory with Stripe data:', updateError)
        // Don't throw here as payment intent was created successfully
      } else {
        console.log('=== MEMORY UPDATED WITH STRIPE DATA ===')
      }

      return createSuccessResponse({
        stripe_client_secret: paymentIntent.client_secret,
        slug: generatedSlug,
      }, 'PaymentIntent criado com sucesso')

    } catch (stripeError) {
      console.error('=== STRIPE ERROR ===')
      console.error('Stripe error:', stripeError)
      return new Response(JSON.stringify({
        success: false,
        error: 'Erro ao criar PaymentIntent',
        code: 'STRIPE_ERROR',
        details: stripeError instanceof Error ? stripeError.message : String(stripeError)
      }), { status: 500 })
    }
  } catch (error) {
    return handleApiError(error)
  }
}
