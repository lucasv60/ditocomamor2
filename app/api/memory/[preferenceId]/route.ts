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

    // Fetch memory data by preference_id
    const { data: memory, error } = await supabaseServer
      .from('memories')
      .select('id, slug, title, payment_status')
      .eq('preference_id', preferenceId)
      .single()

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