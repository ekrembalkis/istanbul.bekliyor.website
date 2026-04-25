// Server-only Supabase client using the service-role key. RLS-bypass for
// inserts/upserts that anon clients are not allowed to perform.
//
// Lazy init so endpoints that don't need DB access don't pay the cost; also
// returns null when env is missing so callers can fall back gracefully in
// local dev.

import { createClient } from '@supabase/supabase-js'

let cached = null

export function adminClient() {
  if (cached !== null) return cached
  const url = process.env.VITE_SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !url.startsWith('https://') || !key) {
    cached = false  // negative sentinel — don't retry every request
    return null
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'X-Source': 'manifesto-api' } },
  })
  return cached
}
