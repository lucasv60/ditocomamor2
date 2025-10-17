import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for client-side operations (public)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client for server-side operations (admin)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Client for server actions and API routes
export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey)