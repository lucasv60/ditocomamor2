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

    // Extract fields from JSON
    const { memoryId, customerEmail, customerName, skipPayment } = body

    console.log('=== EXTRACTED PAYMENT FIELDS ===')
    console.log('memoryId:', memoryId)
    console.log('customerEmail:', customerEmail)
    console.log('customerName:', customerName)
    console.log('skipPayment:', skipPayment)

    // Validate required fields
    if (!memoryId) {
      console.error('=== VALIDATION FAILED ===')
      console.error('Missing memoryId')
      return new Response(JSON.stringify({
        success: false,
        error: 'Campos obrigatórios não preenchidos: memoryId',
        code: 'VALIDATION_ERROR'
      }), { status: 400 })
    }

    // Fetch existing memory from Supabase
    console.log('=== FETCHING EXISTING MEMORY ===')
    const { data: memoryData, error: fetchError } = await supabaseServer
      .from('memories')
      .select('id, slug, title, payment_status')
      .eq('id', memoryId)
      .single()

    if (fetchError || !memoryData) {
      console.error('=== MEMORY FETCH ERROR ===')
      console.error('Memory fetch failed:', fetchError)
      return new Response(JSON.stringify({
        success: false,
        error: 'Memória não encontrada',
        code: 'NOT_FOUND'
      }), { status: 404 })
    }

    console.log('=== MEMORY FOUND ===')
    console.log('Memory data:', memoryData)

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
        amount: 100, // R$ 1,00 in cents
        currency: 'brl',
        metadata: {
          memory_slug: memoryData.slug,
          memory_id: memoryData.id,
          customer_email: customerEmail,
          customer_name: customerName,
        },
        description: `Página de Amor: ${memoryData.title}`,
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
        slug: memoryData.slug,
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
