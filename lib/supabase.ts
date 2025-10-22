import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// CRITICAL CONFIGURATION CHECK - Only for server-side operations
if (typeof window === 'undefined') {
  console.log('=== SUPABASE SERVER CONFIGURATION CHECK ===')
  console.log('SUPABASE_URL available:', !!supabaseUrl)
  console.log('SUPABASE_ANON_KEY available:', !!supabaseAnonKey)
  console.log('SUPABASE_SERVICE_ROLE_KEY available:', !!supabaseServiceRoleKey)

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    console.error('=== CRITICAL SUPABASE CONFIGURATION ERROR ===')
    console.error('SUPABASE_URL:', supabaseUrl ? 'OK' : 'MISSING')
    console.error('SUPABASE_ANON_KEY:', supabaseAnonKey ? 'OK' : 'MISSING')
    console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ?
      `OK (starts with: ${supabaseServiceRoleKey.substring(0, 10)}..., ends with: ${supabaseServiceRoleKey.slice(-10)})` :
      'MISSING')

    // Force deployment failure if critical config is missing
    if (!supabaseServiceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server operations')
    }
  }
}

console.log('=== SUPABASE CLIENTS INITIALIZING ===')

// Client for client-side operations (public) - Only uses public keys
let supabase: any = null
if (typeof window !== 'undefined') {
  supabase = createClient(supabaseUrl!, supabaseAnonKey!)
}
export { supabase }

// Client for server-side operations (admin) - Only available server-side
export const supabaseAdmin = typeof window === 'undefined' ? createClient(supabaseUrl!, supabaseServiceRoleKey!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : createClient(supabaseUrl!, supabaseAnonKey!) // Fallback for client-side

// Client for server actions and API routes - Only available server-side
export const supabaseServer = typeof window === 'undefined' ? createClient(supabaseUrl!, supabaseServiceRoleKey!) : createClient(supabaseUrl!, supabaseAnonKey!) // Fallback for client-side

console.log('=== SUPABASE CLIENTS INITIALIZED SUCCESSFULLY ===')