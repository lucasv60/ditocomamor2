import { NextRequest } from "next/server"
import { supabaseServer } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Only allow service role or admin access
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // In production, validate the token properly
    // For now, we'll allow any bearer token (implement proper auth later)

    // Call the cleanup function
    const { data, error } = await supabaseServer.rpc('cleanup_abandoned_memories')

    if (error) {
      console.error('Cleanup error:', error)
      return new Response(JSON.stringify({ error: 'Failed to cleanup abandoned memories' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log(`Cleaned up ${data} abandoned memories`)

    return new Response(JSON.stringify({
      success: true,
      message: `Cleaned up ${data} abandoned memories`,
      count: data
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Cleanup API error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Optional: GET endpoint to check cleanup status
export async function GET() {
  try {
    // Count pending memories older than 24 hours
    const { count, error } = await supabaseServer
      .from('memories')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'pending')
      .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (error) {
      console.error('Count error:', error)
      return new Response(JSON.stringify({ error: 'Failed to count abandoned memories' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      abandoned_count: count || 0,
      message: `${count || 0} memories pending cleanup (older than 24 hours)`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Status check error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}