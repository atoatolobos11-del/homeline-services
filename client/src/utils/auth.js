// Real shopper auth backed by Supabase Auth.
//
// The same email + password signs in on localhost, Vercel, or any device —
// this replaces the old localStorage demo store, where accounts were trapped
// in a single browser (the reason logins "didn't exist" on Vercel).
//
// Display names live in the auth user's metadata, so no extra table or RLS
// policy is needed. Order history keeps working unchanged: the server's
// /api/orders/by-email matches on the verified email address.
//
// Session handling notes:
// - getCurrentUser() stays SYNCHRONOUS (last-known session from a module
//   cache) so route guards and headers keep working. main.jsx calls
//   initAuth() once at startup; App.jsx waits for isAuthReady() before
//   gating routes, then every change arrives via AUTH_EVENT.
// - Password reset goes through Supabase email: requestPasswordReset() sends
//   a link back to /login?recovery=1, and updatePassword() sets the new one
//   from that recovery session.

import { supabase, isSupabaseAuthConfigured } from './supabaseClient'

export const AUTH_EVENT = 'homeline-auth-changed'
export const isAuthConfigured = isSupabaseAuthConfigured

export const normalizeEmail = (email) => String(email || '').trim().toLowerCase()

export const notifyAuthChanged = () => {
  window.dispatchEvent(new Event(AUTH_EVENT))
}

const toPublicUser = (supabaseUser) => {
  if (!supabaseUser) return null
  const email = supabaseUser.email || ''
  return {
    id: supabaseUser.id,
    email,
    name: supabaseUser.user_metadata?.name || email.split('@')[0] || 'Shopper',
  }
}

let cachedUser = null
let authReady = false

const setCachedUser = (supabaseUser) => {
  cachedUser = toPublicUser(supabaseUser)
  notifyAuthChanged()
}

/** Last-known signed-in shopper (null when signed out or not yet loaded). */
export const getCurrentUser = () => cachedUser

/** True once the persisted session has been read (see initAuth). */
export const isAuthReady = () => authReady

const requireClient = () => {
  if (!supabase) {
    throw new Error('Login is not configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)')
  }
  return supabase
}

/** Call once at startup. Restores the persisted session and keeps the cache
 *  in sync for sign-ins, sign-outs, and recovery-link landings. */
export const initAuth = async () => {
  if (!supabase) {
    authReady = true
    notifyAuthChanged()
    return
  }
  try {
    const { data } = await supabase.auth.getSession()
    cachedUser = toPublicUser(data?.session?.user ?? null)
  } catch {
    cachedUser = null
  }
  authReady = true
  notifyAuthChanged()
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      cachedUser = null
    } else if (session?.user) {
      cachedUser = toPublicUser(session.user)
    }
    notifyAuthChanged()
  })
}

const friendlyError = (err, fallback) => {
  const msg = String(err?.message || '')
  if (/invalid login credentials/i.test(msg)) {
    return 'Incorrect email or password. Try again, or use Forgot password.'
  }
  if (/user already registered|already exists|already been registered/i.test(msg)) {
    return 'An account with this email already exists. Please log in instead.'
  }
  if (/password.*short|weak password/i.test(msg)) {
    return 'Password is too weak — use at least 6 characters.'
  }
  if (/rate limit|too many requests/i.test(msg)) {
    return 'Too many attempts. Wait a minute and try again.'
  }
  if (/network|fetch failed|failed to fetch/i.test(msg)) {
    return 'Network error — could not reach the login server.'
  }
  return msg || fallback
}

/**
 * Creates the account. Returns { user } when the session starts immediately,
 * { needsConfirmation } when Supabase requires the email link to be clicked
 * first (disable "Confirm email" in Supabase Auth settings for frictionless
 * demo logins), or { error }.
 */
export const registerUser = async ({ name, email, password }) => {
  try {
    const client = requireClient()
    const { data, error } = await client.auth.signUp({
      email: normalizeEmail(email),
      password,
      options: { data: { name: String(name).trim() } },
    })
    if (error) return { error: friendlyError(error, 'Could not create the account.') }
    if (data?.session?.user) {
      setCachedUser(data.session.user)
      return { user: getCurrentUser() }
    }
    return { needsConfirmation: true, email: normalizeEmail(email) }
  } catch (err) {
    return { error: friendlyError(err, 'Could not create the account.') }
  }
}

/** Returns { user } or { error }. Never reveals whether the email exists. */
export const checkCredentials = async (email, password) => {
  try {
    const client = requireClient()
    const { data, error } = await client.auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    })
    if (error) {
      if (/email not confirmed/i.test(String(error.message))) {
        return { error: 'This email is not confirmed yet — click the link in your inbox first.' }
      }
      return { error: friendlyError(error, 'Could not log in.') }
    }
    setCachedUser(data.user)
    return { user: getCurrentUser() }
  } catch (err) {
    return { error: friendlyError(err, 'Could not log in.') }
  }
}

export const signOutUser = async () => {
  try {
    if (supabase) await supabase.auth.signOut()
  } catch {
    /* ignore — local state is cleared regardless */
  }
  cachedUser = null
  notifyAuthChanged()
}

/**
 * Sends the Supabase recovery email (link returns to /login?recovery=1).
 * Supabase intentionally does not reveal whether the email exists, so callers
 * should always show the same "check your inbox" notice on success.
 */
export const requestPasswordReset = async (email) => {
  try {
    const client = requireClient()
    const redirectTo = `${window.location.origin}/login?recovery=1`
    const { error } = await client.auth.resetPasswordForEmail(normalizeEmail(email), { redirectTo })
    if (error) return { error: friendlyError(error, 'Could not send the reset email.') }
    return { ok: true }
  } catch (err) {
    return { error: friendlyError(err, 'Could not send the reset email.') }
  }
}

/** Sets a new password from a recovery session (or while signed in). */
export const updatePassword = async (newPassword) => {
  try {
    const client = requireClient()
    const { data, error } = await client.auth.updateUser({ password: newPassword })
    if (error) return { error: friendlyError(error, 'Could not update the password.') }
    setCachedUser(data.user)
    return { ok: true }
  } catch (err) {
    return { error: friendlyError(err, 'Could not update the password.') }
  }
}

/** Fires when a recovery link establishes its session (Login shows the reset form). */
export const onPasswordRecovery = (callback) => {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') callback()
  })
  return () => data.subscription.unsubscribe()
}

/**
 * Device-level factory reset: signs out, then removes every `homeline*` key
 * (cart, catalog cache, admin token) plus Supabase's `sb-*` session keys from
 * both storages. Reload afterwards for a clean logged-out state.
 */
export const factoryResetLocalData = async () => {
  try {
    if (supabase) await supabase.auth.signOut()
  } catch {
    /* ignore */
  }
  cachedUser = null
  for (const storage of [localStorage, sessionStorage]) {
    try {
      const doomed = []
      for (let i = 0; i < storage.length; i += 1) {
        const key = storage.key(i)
        if (key && (key.startsWith('homeline') || key.startsWith('sb-'))) doomed.push(key)
      }
      doomed.forEach((key) => storage.removeItem(key))
    } catch {
      /* storage blocked — nothing to clear */
    }
  }
  notifyAuthChanged()
}
