import { NextRequest } from "next/server"
import { supabaseServer } from '@/lib/supabase'
import * as mercadopago from 'mercadopago'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const params = new URLSearchParams(body)
    const topic = params.get('topic')
    const id = params.get('id')

    if (!topic || !id) {
      return new Response('Missing parameters', { status: 400 })
    }

    // Configure Mercado Pago
    const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN
    if (!MERCADO_PAGO_ACCESS_TOKEN) {
      console.error('Mercado Pago access token not configured')
      return new Response('Server configuration error', { status: 500 })
    }

    const mercadopagoClient = require('mercadopago')
    mercadopagoClient.configure({
      access_token: MERCADO_PAGO_ACCESS_TOKEN
    })

    // Get payment details from Mercado Pago
    const paymentResponse = await mercadopagoClient.payment.get(id)
    const payment = paymentResponse.body

    if (!payment) {
      console.error('Payment not found:', id)
      return new Response('Payment not found', { status: 404 })
    }

    // Find memory by preference_id
    const { data: memory, error: fetchError } = await supabaseServer
      .from('memories')
      .select('*')
      .eq('preference_id', payment.preference_id)
      .single()

    if (fetchError || !memory) {
      console.error('Memory not found for preference_id:', payment.preference_id)
      return new Response('Memory not found', { status: 404 })
    }

    // Update payment status based on Mercado Pago status
    let newStatus: 'pending' | 'paid' | 'failed' | 'abandoned' = 'pending'

    switch (payment.status) {
      case 'approved':
        newStatus = 'paid'
        break
      case 'rejected':
      case 'cancelled':
        newStatus = 'failed'
        break
      case 'pending':
        newStatus = 'pending'
        break
      default:
        console.log('Unhandled payment status:', payment.status)
        return new Response('OK', { status: 200 })
    }

    // Update memory record
    const { error: updateError } = await supabaseServer
      .from('memories')
      .update({
        payment_status: newStatus,
        payment_id: payment.id.toString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', memory.id)

    if (updateError) {
      console.error('Error updating memory:', updateError)
      return new Response('Database update error', { status: 500 })
    }

    console.log(`Memory ${memory.slug} payment status updated to ${newStatus}`)
    return new Response('OK', { status: 200 })

  } catch (error) {
    console.error('IPN processing error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

// Handle GET requests for testing (optional)
export async function GET() {
  return new Response('IPN endpoint is working', { status: 200 })
}