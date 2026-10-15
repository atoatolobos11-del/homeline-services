// One-time admin bootstrap: creates the admin Supabase Auth user (or confirms
// it if it already exists), bypassing self-signup restrictions such as email
// domain allow-lists.
//
// Usage (from the server/ directory):
//   node scripts/create-admin.mjs [email] [display-name]
//
// Required env (server/.env):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_INITIAL_PASSWORD
// The password is only used when the account is created. Delete
// ADMIN_INITIAL_PASSWORD from .env afterwards, or leave it blank.
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: new URL('../.env', import.meta.url) })

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server/.env — see server/.env.example.')
  process.exit(1)
}

const email = String(process.argv[2] || 'admin2026@gmail.com').toLowerCase().trim()
const displayName = process.argv[3] || 'Admin'
const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || ''

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const findExisting = async () => {
  // listUsers pages (default 50/page) — walk pages until the email is found.
  let page = 1
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 })
    if (error) throw error
    const hit = (data?.users || []).find((u) => String(u.email || '').toLowerCase() === email)
    if (hit) return hit
    if (!data?.users?.length || (data.users.length < 100)) return null
    page += 1
  }
}

const run = async () => {
  const existing = await findExisting()
  if (existing) {
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      email_confirm: true,
      user_metadata: { ...(existing.user_metadata || {}), name: displayName },
    })
    if (error) throw error
    console.log(JSON.stringify({ ok: true, created: false, email, id: existing.id, note: 'Account already existed — confirmed email and display name.' }))
    return
  }
  if (!initialPassword || initialPassword.length < 6) {
    console.error('Account does not exist yet — set ADMIN_INITIAL_PASSWORD (min 6 chars) in server/.env first.')
    process.exit(1)
  }
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: initialPassword,
    email_confirm: true,
    user_metadata: { name: displayName },
  })
  if (error) throw error
  console.log(JSON.stringify({ ok: true, created: true, email, id: data?.user?.id || null }))
}

run().catch((err) => {
  console.error(`create-admin failed: ${err?.message || err}`)
  process.exit(1)
})
