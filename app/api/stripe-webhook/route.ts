import { NextRequest } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { supabaseServer } from '@/lib/supabase'
import { handleApiError, createSuccessResponse } from '@/lib/error-handler'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const sig = headers().get('stripe-signature')

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig!, endpointSecret!)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response(JSON.stringify({ error: 'Webhook signature verification failed' }), {
        status: 400,
      })
    }

    console.log('=== STRIPE WEBHOOK RECEIVED ===')
    console.log('Event type:', event.type)
    console.log('Event ID:', event.id)

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('PaymentIntent succeeded:', paymentIntent.id)

      // Extract metadata
      const memorySlug = paymentIntent.metadata.memory_slug
      const memoryId = paymentIntent.metadata.memory_id

      console.log('Memory slug from metadata:', memorySlug)
      console.log('Memory ID from metadata:', memoryId)

      if (!memorySlug && !memoryId) {
        console.error('No memory identifier found in PaymentIntent metadata')
        return new Response(JSON.stringify({ error: 'No memory identifier found' }), {
          status: 400,
        })
      }

      // Update memory payment status
      let updateQuery = supabaseServer.from('memories').update({ payment_status: 'paid' })

      if (memoryId) {
        updateQuery = updateQuery.eq('id', memoryId)
      } else if (memorySlug) {
        updateQuery = updateQuery.eq('slug', memorySlug)
      }

      const { error: updateError } = await updateQuery

      if (updateError) {
        console.error('Failed to update memory payment status:', updateError)
        return new Response(JSON.stringify({ error: 'Failed to update payment status' }), {
          status: 500,
        })
      }

      console.log('Memory payment status updated to paid')

    } else {
      console.log(`Unhandled event type: ${event.type}`)
    }

    return createSuccessResponse({ received: true }, 'Webhook processed successfully')

  } catch (error) {
    console.error('Webhook processing error:', error)
    return handleApiError(error)
  }
}