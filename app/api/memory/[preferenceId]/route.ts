import { NextRequest } from "next/server"
import { supabaseServer } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { preferenceId: string } }
) {
  try {
    const { preferenceId } = params

    if (!preferenceId) {
      return new Response(JSON.stringify({ error: 'Preference ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Fetch memory data by preference_id or slug
    let query = supabaseServer
      .from('memories')
      .select('id, slug, title, payment_status')

    // Check if preferenceId looks like a slug (contains letters) or preference_id (numeric)
    if (isNaN(Number(preferenceId))) {
      // It's a slug
      query = query.eq('slug', preferenceId)
    } else {
      // It's a preference_id
      query = query.eq('preference_id', preferenceId)
    }

    const { data: memory, error } = await query.single()

    if (error || !memory) {
      return new Response(JSON.stringify({ error: 'Memory not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(memory), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error fetching memory:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { preferenceId: string } }
) {
  try {
    const { preferenceId } = params

    console.log('PATCH called with preferenceId:', preferenceId)

    if (!preferenceId) {
      console.log('No preferenceId provided')
      return new Response(JSON.stringify({ error: 'Preference ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const body = await request.json()
    const { payment_status } = body

    console.log('Payment status to update:', payment_status)

    if (!payment_status) {
      console.log('No payment_status provided')
      return new Response(JSON.stringify({ error: 'payment_status is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Update memory by preference_id or slug
    let query = supabaseServer
      .from('memories')
      .update({ payment_status })
      .select('id, slug, title, payment_status')

    // Check if preferenceId looks like a slug (contains letters) or preference_id (numeric)
    if (isNaN(Number(preferenceId))) {
      // It's a slug
      console.log('Updating by slug:', preferenceId)
      query = query.eq('slug', preferenceId)
    } else {
      // It's a preference_id
      console.log('Updating by preference_id:', preferenceId)
      query = query.eq('preference_id', preferenceId)
    }

    const { data: memory, error } = await query.single()

    console.log('Update result - data:', memory, 'error:', error)

    if (error || !memory) {
      console.error('Failed to update memory:', error)
      return new Response(JSON.stringify({ error: 'Failed to update memory' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('Memory updated successfully:', memory)
    return new Response(JSON.stringify(memory), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error updating memory:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}