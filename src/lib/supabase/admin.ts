import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Admin Supabase client using the service-role key — bypasses RLS.
// Use ONLY in trusted server contexts: Stripe webhooks, CRON jobs,
// auth-verified API routes that need to mutate other users' rows.
// Never expose this client to user-controlled inputs.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  }
  return createSupabaseClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
