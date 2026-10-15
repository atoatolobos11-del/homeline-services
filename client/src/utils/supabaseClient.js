import { createClient } from '@supabase/supabase-js'

// Shopper auth talks to Supabase Auth directly from the browser using the
// publishable anon key (public by design — row-level security, not the key,
// is what protects data; this client only touches the managed auth API, no
// tables). Required env (see client/.env.example):
//   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseAuthConfigured = Boolean(url && anonKey)

if (!isSupabaseAuthConfigured) {
  console.warn(
    '[auth] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing — login and registration are disabled until they are set.',
  )
}

/** Null when unconfigured so callers can fail with a clear message. */
export const supabase = isSupabaseAuthConfigured ? createClient(url, anonKey) : null
