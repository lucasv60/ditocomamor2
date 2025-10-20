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