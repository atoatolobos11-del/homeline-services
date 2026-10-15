import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

const serverDir = path.dirname(fileURLToPath(import.meta.url))
// The built React app. In production both are served from one process; when
// running the API on its own (npm run dev) this directory simply won't exist
// and the static handlers are skipped.
const clientDist = path.join(serverDir, '..', 'client', 'dist')
const clientDistExists = fs.existsSync(path.join(clientDist, 'index.html'))

// Supabase client — the single source of truth.
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

app.use(cors())
app.use(express.json())

// Map snake_case DB rows to the camelCase shape the frontend expects.
//
// costPrice is supplier margin and is only included when the caller asks for it
// (admin routes). It used to be on every product response, which meant the public
// /api/products endpoint handed out cost prices to anyone.
const mapProduct = (row, { includeCost = false } = {}) => {
  const product = {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: Number(row.price),
    category: row.category,
    badge: row.badge,
    description: row.description,
    image: row.image,
    colors: row.colors ?? [],
    featured: row.featured,
    bestSeller: row.best_seller,
    newArrival: row.new_arrival,
    stock: Number(row.stock ?? 0),
    sku: row.sku ?? null,
    reorderLevel: Number(row.reorder_level ?? 0),
  }
  if (includeCost) {
    product.costPrice = row.cost_price != null ? Number(row.cost_price) : null
  }
  return product
}

// Deliberately pragmatic rather than RFC 5322-complete: one @, a dot in the
// domain, no whitespace. Enough to keep junk like "plainstring" or "a@b" out of
// the subscribers table without rejecting legitimate addresses.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const generateSku = () =>
  `HML-${String(Date.now()).slice(-5)}${Math.floor(Math.random() * 90 + 10)}`

const DEFAULT_PRODUCT_IMAGE =
  'https://images.pexels.com/photos/12115340/pexels-photo-12115340.jpeg?auto=compress&cs=tinysrgb&w=900'

const requireSupabase = (_req, res) => {
  if (!supabase) {
    res.status(503).json({ error: 'Supabase is not configured (set SUPABASE_URL and SUPABASE_ANON_KEY)' })
    return null
  }
  return supabase
}

// ---------- Admin authorization ----------
//
// The Inventory dashboard is admin-only, and that has to be enforced here rather
// than in the React router: a client-side check is only a hidden button, and the
// API stays reachable. Every route below carries customer PII (names, emails) or
// supplier cost prices, so all of them verify the caller first.
//
// Two ways in. Both default to denying when unconfigured, so a fresh checkout
// cannot come up wide open:
//
//   1. Session token — Authorization: Bearer <token from /api/admin/session>.
//      Issued only after a password check, HMAC-signed with
//      ADMIN_SESSION_SECRET, and expiring. This is what the dashboard uses.
//   2. X-Admin-Secret — matches ADMIN_API_KEY. For scripts and
//      server-to-server calls. Disabled entirely when ADMIN_API_KEY is blank.
//
// A Supabase access token is also accepted on the Bearer path and revalidated
// with auth.getUser(), so a real Supabase session works without a second login.
//
// Nothing here is logged, and the secret is compared in constant time.
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin2026@gmail.com').toLowerCase()
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || ''
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || ''
const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000 // 8 hours
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''

const denyAdmin = (res, reason) => {
  res.status(401).json({ error: reason || 'Admin access required' })
  return false
}

// Constant-time compare, so a wrong value can't be discovered byte by byte.
const safeEqual = (a, b) => {
  const bufA = Buffer.from(String(a))
  const bufB = Buffer.from(String(b))
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

// ---- Signed session tokens (stateless, no server-side session store) ----
const b64url = (buf) => Buffer.from(buf).toString('base64url')
const signSession = (payloadObj) => {
  const payload = b64url(JSON.stringify({ ...payloadObj, exp: Date.now() + ADMIN_SESSION_TTL_MS }))
  const sig = crypto.createHmac('sha256', ADMIN_SESSION_SECRET).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

const verifySession = (token) => {
  if (!ADMIN_SESSION_SECRET) return null
  const parts = String(token).split('.')
  if (parts.length !== 2) return null
  const [payload, sig] = parts
  const expected = crypto.createHmac('sha256', ADMIN_SESSION_SECRET).update(payload).digest('base64url')
  if (!safeEqual(sig, expected)) return null
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (!data?.exp || Number(data.exp) < Date.now()) return null
    return data
  } catch {
    return null
  }
}

// Classifies the caller. Returns true (admin), or false with a reason — it never
// writes to the response, so routes that are public but richer for admins (like
// GET /api/promos) can ask without the check turning into a 401.
const checkAdmin = async (req) => {
  const secret = req.get('x-admin-secret')
  if (secret) {
    if (!ADMIN_API_KEY) return { ok: false, reason: 'Admin API key is not configured on this server' }
    if (!safeEqual(secret, ADMIN_API_KEY)) return { ok: false, reason: 'Invalid admin credentials' }
    return { ok: true }
  }

  const auth = req.get('authorization') || ''
  const token = /^Bearer\s+(.+)$/i.exec(auth)?.[1]
  if (!token) return { ok: false, reason: 'Admin access required' }

  // Our own signed session token first — no network call needed.
  const session = verifySession(token)
  if (session) {
    const email = String(session.email || '').toLowerCase()
    if (email === ADMIN_EMAIL || session.role === 'admin') return { ok: true }
    return { ok: false, reason: 'This account is not an admin' }
  }

  // Otherwise treat it as a Supabase access token. getUser() revalidates the JWT
  // with the auth server — a decoded-but-unverified payload proves nothing, so
  // this is the step that actually establishes identity.
  if (!supabase) return { ok: false, reason: 'Admin access required' }
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user) return { ok: false, reason: 'Invalid or expired session' }
  const email = String(data.user.email || '').toLowerCase()
  const role = data.user.app_metadata?.role
  if (email !== ADMIN_EMAIL && role !== 'admin') return { ok: false, reason: 'This account is not an admin' }
  return { ok: true }
}

// Same check, but sends the 401 for you, so guarded routes stay one line.
const isAdminRequest = async (req, res) => {
  const result = await checkAdmin(req)
  if (result.ok) return true
  return denyAdmin(res, result.reason)
}

// Password login for the dashboard. Rate limited per IP in-process: enough to
// blunt online guessing on a single-instance deploy. A multi-instance deployment
// needs a shared limiter (Redis) or an edge rate limiter in front of this.
const loginAttempts = new Map()
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const LOGIN_MAX_ATTEMPTS = 8

const loginRateLimited = (ip) => {
  const now = Date.now()
  const entry = loginAttempts.get(ip)
  if (!entry || now - entry.first > LOGIN_WINDOW_MS) {
    loginAttempts.set(ip, { count: 0, first: now })
    return false
  }
  return entry.count >= LOGIN_MAX_ATTEMPTS
}

const recordLoginFailure = (ip) => {
  const entry = loginAttempts.get(ip)
  if (entry) entry.count += 1
}

const clearLoginFailures = (ip) => loginAttempts.delete(ip)

// Best-effort client IP. Behind Render/Heroku this is the first hop they add.
const clientIp = (req) =>
  String(req.get('x-forwarded-for') || '').split(',')[0].trim() ||
  req.socket?.remoteAddress ||
  'unknown'

app.post('/api/admin/session', async (req, res) => {
  if (!ADMIN_PASSWORD || !ADMIN_SESSION_SECRET) {
    res.status(503).json({
      error: 'Admin sign-in is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET.',
    })
    return
  }

  const ip = clientIp(req)
  if (loginRateLimited(ip)) {
    res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' })
    return
  }

  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  const emailOk = safeEqual(email, ADMIN_EMAIL)
  const passwordOk = safeEqual(password, ADMIN_PASSWORD)

  if (!emailOk || !passwordOk) {
    recordLoginFailure(ip)
    // Same message either way, so this can't be used to discover the admin email.
    res.status(401).json({ error: 'Incorrect email or password' })
    return
  }

  clearLoginFailures(ip)
  res.json({
    ok: true,
    token: signSession({ email, role: 'admin' }),
    expiresIn: ADMIN_SESSION_TTL_MS,
    email,
  })
})

// Lets the dashboard confirm a stored token is still valid on load, without
// having to trigger a real admin query to find out.
app.get('/api/admin/session', async (req, res) => {
  if (!(await isAdminRequest(req, res))) return
  res.json({ ok: true, email: ADMIN_EMAIL })
})

app.delete('/api/admin/session', (_req, res) => {
  // Tokens are stateless, so sign-out just tells the client to drop it. Expiry
  // and rotation bound the damage if a token leaks.
  res.json({ ok: true })
})

// Every data route is mounted under /api. This banner lives at /api rather than
// at / because in a single-service deploy the root must serve the React app.
app.get('/api', (_req, res) => {
  res.json({
    service: 'Homeline API',
    status: supabase ? 'ok' : 'degraded',
    database: supabase ? 'supabase' : 'unconfigured',
    health: '/api/health',
    endpoints: [
      'GET  /api/products',
      'GET  /api/products/:id',
      'GET  /api/categories',
      'GET  /api/reviews',
      'GET  /api/promos',
      'GET  /api/inventory',
      'GET  /api/inventory/movements',
      'GET  /api/orders                (admin)',
      'GET  /api/orders/:orderNumber   (public tracking)',
      'POST /api/orders',
      'POST /api/orders/cancel',
      'POST /api/products               (admin)',
      'PATCH /api/products/:id          (admin)',
      'PATCH /api/promos/:id            (admin)',
      'POST /api/newsletter',
      'POST /api/contact',
      'GET  /api/health                 (public)',
      'GET  /api/products               (public)',
      'GET  /api/categories             (public)',
      'GET  /api/reviews                (public)',
      'GET  /api/promos                 (public, active codes only)',
    ],
  })
})

app.get('/api/health', async (_req, res) => {
  if (!supabase) {
    res.json({ ok: true, database: 'unconfigured' })
    return
  }
  // Actually ping the database so a bad SUPABASE_URL / key / paused project
  // shows up here instead of surfacing later as an empty storefront.
  try {
    const { error } = await supabase.from('products').select('id', { head: true, count: 'exact' }).limit(1)
    if (error) throw error
    res.json({ ok: true, database: 'supabase' })
  } catch (err) {
    res.json({ ok: false, database: 'unreachable', error: 'Cannot reach Supabase — check SUPABASE_URL and SUPABASE_ANON_KEY' })
  }
})

const supabaseErrorStatus = (err) => {
  const msg = String(err?.message || '')
  // fetch failed / ENOTFOUND / EAI_AGAIN = the URL is wrong or the project
  // is gone — that is a server misconfiguration, not a client error.
  if (/fetch failed|ENOTFOUND|EAI_AGAIN|getaddrinfo|network|timeout/i.test(msg)) return 503
  return 500
}

const supabaseErrorMessage = (err) => {
  const msg = String(err?.message || 'Database query failed')
  if (/fetch failed|ENOTFOUND|EAI_AGAIN|getaddrinfo/i.test(msg)) {
    return 'Cannot reach Supabase (DNS/network failure). Check SUPABASE_URL — the host does not resolve — and verify SUPABASE_ANON_KEY is the full publishable key.'
  }
  return msg
}

// Short in-memory cache for the hot catalog reads. Supabase Nano cold-starts
// after idle, so every uncached navigation paid the wake-up penalty. 30s TTL
// keeps the storefront snappy; every write path below invalidates it.
const catalogCache = {
  products: { at: 0, data: null },
  categories: { at: 0, data: null },
}
const CATALOG_TTL_MS = 30 * 1000
const catalogCached = (entry) => entry.data && Date.now() - entry.at < CATALOG_TTL_MS
const invalidateCatalog = () => {
  catalogCache.products = { at: 0, data: null }
  catalogCache.categories = { at: 0, data: null }
}

app.get('/api/products', async (_req, res) => {
  const client = requireSupabase(_req, res)
  if (!client) return
  if (catalogCached(catalogCache.products)) {
    res.set('Cache-Control', 'public, max-age=30')
    res.set('X-Cache', 'HIT')
    res.json(catalogCache.products.data)
    return
  }
  try {
    const { data, error } = await client.from('products').select('*').order('sort_order', { ascending: true })
    if (error) throw error
    const body = (data || []).map(mapProduct)
    catalogCache.products = { at: Date.now(), data: body }
    res.set('Cache-Control', 'public, max-age=30')
    res.set('X-Cache', 'MISS')
    res.json(body)
  } catch (err) {
    res.status(supabaseErrorStatus(err)).json({ error: supabaseErrorMessage(err) })
  }
})

app.get('/api/products/:id', async (req, res) => {
  const client = requireSupabase(req, res)
  if (!client) return
  const { id } = req.params
  try {
    const { data, error } = await client.from('products').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    if (!data) {
      res.status(404).json({ error: 'Product not found' })
      return
    }
    res.json(mapProduct(data))
  } catch (err) {
    res.status(supabaseErrorStatus(err)).json({ error: supabaseErrorMessage(err) })
  }
})

// ---------- Inventory ----------

// Admin-only: exposes costPrice. Public product data comes from /api/products.
app.get('/api/inventory', async (req, res) => {
  const client = requireSupabase(req, res)
  if (!client) return
  if (!(await isAdminRequest(req, res))) return
  const { data, error } = await client.from('products').select('*').order('sort_order', { ascending: true })
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json(data.map((row) => mapProduct(row, { includeCost: true })))
})

// Audit trail of every stock change (sales, restocks, adjustments)
app.get('/api/inventory/movements', async (req, res) => {
  const client = requireSupabase(req, res)
  if (!client) return
  if (!(await isAdminRequest(req, res))) return
  const { data, error } = await client
    .from('stock_movements')
    .select('*, product:products(name, image)')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json(data)
})

// Manual stock edit from the Inventory dashboard: set an exact stock number.
// Every change is logged as an "adjustment" movement with a reason.
app.patch('/api/inventory/:id', async (req, res) => {
  const client = requireSupabase(req, res)
  if (!client) return
  if (!(await isAdminRequest(req, res))) return
  const stock = Number(req.body?.stock)
  if (!Number.isInteger(stock) || stock < 0 || stock > 99999) {
    res.status(400).json({ error: 'Stock must be a whole number between 0 and 99999' })
    return
  }

  const { data: current } = await client
    .from('products')
    .select('stock')
    .eq('id', req.params.id)
    .maybeSingle()
  if (!current) {
    res.status(404).json({ error: 'Product not found' })
    return
  }

  const delta = stock - Number(current.stock ?? 0)
  if (delta === 0) {
    res.json({ ok: true, id: req.params.id, stock, unchanged: true })
    return
  }

  const { data, error } = await client.rpc('adjust_stock', {
    p_product_id: req.params.id,
    p_delta: delta,
    p_change_type: 'adjustment',
    p_reason: String(req.body?.reason || 'Manual adjustment').slice(0, 200),
  })
  if (error) {
    res.status(400).json({ error: error.message })
    return
  }
  invalidateCatalog()
  res.json({ ok: true, id: req.params.id, stock: data, delta })
})

// Quick restock from the Inventory dashboard — logged as a "restock" movement.
app.post('/api/inventory/restock', async (req, res) => {
  const client = requireSupabase(req, res)
  if (!client) return
  if (!(await isAdminRequest(req, res))) return
  const { id, quantity, reason } = req.body ?? {}
  if (typeof id !== 'string' || !Number.isInteger(quantity) || quantity < 1 || quantity > 10000) {
    res.status(400).json({ error: 'id (string) and quantity (1–10000) are required' })
    return
  }
  const { data, error } = await client.rpc('adjust_stock', {
    p_product_id: id,
    p_delta: quantity,
    p_change_type: 'restock',
    p_reason: String(reason || 'Restock').slice(0, 200),
  })
  if (error) {
    res.status(400).json({ error: error.message })
    return
  }
  invalidateCatalog()
  res.json({ ok: true, id, stock: data, delta: quantity })
})

// ---------- Orders ----------

// Called at checkout. One atomic DB transaction: validates stock, creates the
// order + line items, reduces stock, logs a "sale" movement per product.
app.post('/api/orders', async (req, res) => {
  const client = requireSupabase(req, res)
  if (!client) return
  const { customerName, customerEmail, total, items } = req.body ?? {}
  if (typeof customerName !== 'string' || !customerName.trim()) {
    res.status(400).json({ error: 'customerName is required' })
    return
  }
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'items must be a non-empty array' })
    return
  }
  const cleanItems = []
  for (const item of items) {
    if (
      !item ||
      typeof item.id !== 'string' ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      !(Number(item.price) >= 0)
    ) {
      res.status(400).json({ error: 'Each item needs id, price, and a quantity of at least 1' })
      return
    }
    cleanItems.push({
      id: item.id,
      name: String(item.name || item.id).slice(0, 120),
      price: Number(item.price),
      quantity: item.quantity,
    })
  }

  const result = await client.rpc('record_order', {
    p_customer_name: customerName.trim().slice(0, 120),
    p_customer_email: typeof customerEmail === 'string' && customerEmail.trim() ? customerEmail.trim().slice(0, 200) : null,
    p_total: Number(total) >= 0 ? Number(total) : 0,
    p_items: cleanItems,
  })
  if (result.error) {
    res.status(400).json({ error: result.error.message })
    return
  }
  if (result.data?.ok === false) {
    res.status(409).json({
      error: 'Not enough stock for one or more items',
      insufficient: result.data.insufficient ?? [],
    })
    return
  }
  // The RPC returns snake_case; normalize to the camelCase shape every other
  // endpoint returns so clients only ever deal with one shape.
  invalidateCatalog()
  res.status(201).json({
    ok: true,
    total: Number(result.data?.total ?? 0),
    orderId: result.data?.order_id ?? null,
    orderNumber: result.data?.order_number ?? null,
  })
})

// Sales history for the Inventory dashboard, with per-order line items.
// Admin-only: this is every customer in the database, including emails.
app.get('/api/orders', async (req, res) => {
  const client = requireSupabase(req, res)
  if (!client) return
  if (!(await isAdminRequest(req, res))) return
  const { data: orders, error } = await client
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  const ids = (orders || []).map((order) => order.id)
  const itemsByOrder = new Map()
  if (ids.length > 0) {
    const { data: items, error: itemsError } = await client
      .from('order_items')
      .select('*')
      .in('order_id', ids)
      .order('id', { ascending: true })
    if (itemsError) {
      res.status(500).json({ error: itemsError.message })
      return
    }
    for (const item of items || []) {
      const list = itemsByOrder.get(item.order_id) || []
      list.push(item)
      itemsByOrder.set(item.order_id, list)
    }
  }

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const summary = { orders: 0, revenue: 0, itemsSold: 0, todayOrders: 0, todayRevenue: 0, weekRevenue: 0 }

  const rows = (orders || []).map((order) => {
    const created = new Date(order.created_at)
    const total = Number(order.total ?? 0)
    const items = itemsByOrder.get(order.id) || []
    summary.orders += 1
    summary.revenue += total
    summary.itemsSold += items.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0)
    if (created >= startOfToday) {
      summary.todayOrders += 1
      summary.todayRevenue += total
    }
    if (created >= weekAgo) {
      summary.weekRevenue += total
    }
    return {
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      total,
      status: order.status,
      createdAt: order.created_at,
      items: items.map((item) => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        unitPrice: Number(item.unit_price),
        costPrice: Number(item.cost_price),
        quantity: item.quantity,
        subtotal: Number(item.subtotal),
        profit: Math.round((Number(item.unit_price) - Number(item.cost_price || 0)) * Number(item.quantity || 0) * 100) / 100,
      })),
    }
  })

  res.json({ orders: rows, summary })
})

// A shopper's own order history, for the Profile page.
//
// This exists because /api/orders is admin-only. It is scoped by POST body
// rather than by session, which is a deliberate limitation: storefront accounts
// are localStorage-only, so there is no credential to check. That means anyone
// who knows an email can list that email's orders — which is still far better
// than the previous behaviour of serving every customer to every caller, but it
// is not real authentication. Move storefront auth onto Supabase Auth (or
// similar) before this handles live customer data, then key this off the
// verified session instead of a posted email.
app.post('/api/orders/by-email', async (req, res) => {
  const client = requireSupabase(req, res)
  if (!client) return

  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const name = typeof req.body?.name === 'string' ? req.body.name.trim().toLowerCase() : ''
  if (!email && !name) {
    res.status(400).json({ error: 'email or name is required' })
    return
  }
  if (email && !EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'Enter a valid email address' })
    return
  }

  let query = client.from('orders').select('*')
  query = email ? query.eq('customer_email', email) : query.eq('customer_name', name)
  const { data: orders, error } = await query
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  const ids = (orders || []).map((order) => order.id)
  const itemsByOrder = new Map()
  if (ids.length > 0) {
    const { data: items } = await client
      .from('order_items')
      .select('*')
      .in('order_id', ids)
      .order('id', { ascending: true })
    for (const item of items || []) {
      const list = itemsByOrder.get(item.order_id) || []
      list.push(item)
      itemsByOrder.set(item.order_id, list)
    }
  }

  // No costPrice or profit here: a shopper should not see supplier margins.
  const rows = (orders || []).map((order) => ({
    id: order.id,
    orderNumber: order.order_number,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    total: Number(order.total ?? 0),
    status: order.status,
    createdAt: order.created_at,
    items: (itemsByOrder.get(order.id) || []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      unitPrice: Number(item.unit_price),
      quantity: item.quantity,
      subtotal: Number(item.subtotal),
    })),
  }))

  res.json({ orders: rows })
})

// Public order lookup by order number (for the Track / Cancel Order page).
app.get('/api/orders/:orderNumber', async (req, res) => {
  const client = requireSupabase(req, res)
  if (!client) return
  const orderNumber = String(req.params.orderNumber || '').trim().toUpperCase()
  if (!orderNumber) {
    res.status(400).json({ error: 'orderNumber is required' })
    return
  }
  const { data: orders, error } = await client
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .limit(1)
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  const order = orders?.[0]
  if (!order) {
    res.status(404).json({ error: 'Order not found — double-check the order number.' })
    return
  }
  const { data: items, error: itemsError } = await client
    .from('order_items')
    .select('*')
    .eq('order_id', order.id)
    .order('id', { ascending: true })
  if (itemsError) {
    res.status(500).json({ error: itemsError.message })
    return
  }
  res.json({
    id: order.id,
    orderNumber: order.order_number,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    total: Number(order.total ?? 0),
    status: order.status,
    createdAt: order.created_at,
    // costPrice/profit omitted: this is the public tracking route, reachable by
    // anyone who knows an order number.
    items: (items || []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      unitPrice: Number(item.unit_price),
      quantity: item.quantity,
      subtotal: Number(item.subtotal),
    })),
  })
})

// Customer cancellation: restores stock and marks the order cancelled.
app.post('/api/orders/cancel', async (req, res) => {
  const client = requireSupabase(req, res)
  if (!client) return
  const orderNumber = typeof req.body?.orderNumber === 'string' ? req.body.orderNumber.trim().toUpperCase() : ''
  if (!orderNumber) {
    res.status(400).json({ error: 'orderNumber is required' })
    return
  }
  const result = await client.rpc('cancel_order', { p_order_number: orderNumber })
  if (result.error) {
    res.status(400).json({ error: result.error.message })
    return
  }
  if (result.data?.ok === false) {
    res.status(409).json({ error: result.data.message || 'This order cannot be cancelled.' })
    return
  }
  // The RPC returns snake_case; every other endpoint is camelCase. Normalize here
  // so clients can rely on one shape.
  invalidateCatalog()
  res.json({
    ok: true,
    status: result.data?.status ?? 'cancelled',
    orderNumber: result.data?.order_number ?? orderNumber,
  })
})

app.get('/api/categories', async (_req, res) => {
  const client = requireSupabase(_req, res)
  if (!client) return
  if (catalogCached(catalogCache.categories)) {
    res.set('Cache-Control', 'public, max-age=60')
    res.set('X-Cache', 'HIT')
    res.json(catalogCache.categories.data)
    return
  }
  try {
    const { data, error } = await client.from('categories').select('*').order('sort_order', { ascending: true })
    if (error) throw error
    const body = data || []
    catalogCache.categories = { at: Date.now(), data: body }
    res.set('Cache-Control', 'public, max-age=60')
    res.set('X-Cache', 'MISS')
    res.json(body)
  } catch (err) {
    res.status(supabaseErrorStatus(err)).json({ error: supabaseErrorMessage(err) })
  }
})

// ---------- Product reviews ----------

// One-shot rating summary for every product: { productId: { count, average } }.
// Product cards use this instead of firing one request per card (24 requests
// would have undone the catalog speed work).
let reviewSummaryCache = { at: 0, data: null }
const REVIEW_SUMMARY_TTL_MS = 60 * 1000

app.get('/api/reviews/summary', async (_req, res) => {
  const client = requireSupabase(_req, res)
  if (!client) return
  if (reviewSummaryCache.data && Date.now() - reviewSummaryCache.at < REVIEW_SUMMARY_TTL_MS) {
    res.set('Cache-Control', 'public, max-age=60')
    res.set('X-Cache', 'HIT')
    res.json(reviewSummaryCache.data)
    return
  }
  try {
    const { data, error } = await client.from('reviews').select('product_id, rating')
    if (error) throw error
    const summary = {}
    for (const row of data || []) {
      const entry = summary[row.product_id] || { count: 0, total: 0 }
      entry.count += 1
      entry.total += Number(row.rating) || 0
      summary[row.product_id] = entry
    }
    const body = {}
    for (const [productId, entry] of Object.entries(summary)) {
      body[productId] = {
        count: entry.count,
        average: Math.round((entry.total / entry.count) * 10) / 10,
      }
    }
    reviewSummaryCache = { at: Date.now(), data: body }
    res.set('Cache-Control', 'public, max-age=60')
    res.set('X-Cache', 'MISS')
    res.json(body)
  } catch (err) {
    res.status(supabaseErrorStatus(err)).json({ error: supabaseErrorMessage(err) })
  }
})

app.get('/api/reviews', async (req, res) => {
  const client = requireSupabase(req, res)
  if (!client) return
  let query = client.from('reviews').select('*').order('created_at', { ascending: false })
  const productId = req.query.productId
  if (productId) query = query.eq('product_id', String(productId).trim())
  const { data, error } = await query
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json(data || [])
})

app.post('/api/reviews', async (req, res) => {
  const client = requireSupabase(req, res)
  if (!client) return
  const { productId, customerName, rating, comment } = req.body ?? {}
  if (typeof productId !== 'string' || !productId.trim()) {
    res.status(400).json({ error: 'productId is required' })
    return
  }
  if (typeof customerName !== 'string' || !customerName.trim()) {
    res.status(400).json({ error: 'customerName is required' })
    return
  }
  const value = Number(rating)
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    res.status(400).json({ error: 'rating must be a whole number from 1 to 5' })
    return
  }
  const { data, error } = await client
    .from('reviews')
    .insert({
      product_id: productId.trim(),
      customer_name: customerName.trim().slice(0, 80),
      rating: value,
      comment: typeof comment === 'string' ? comment.trim().slice(0, 500) : null,
    })
    .select()
    .single()
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  reviewSummaryCache = { at: 0, data: null }
  res.status(201).json(data)
})

// ---------- Promo codes (Inventory > Promos) ----------

// Promo codes must be readable by shoppers (checkout validates a code the
// customer typed), so this stays public — but it only ever returns codes that
// are active and unexpired. Drafts and disabled codes are admin-only, returned
// to an authenticated admin on the same route.
app.get('/api/promos', async (req, res) => {
  const client = requireSupabase(req, res)
  if (!client) return
  const { data, error } = await client.from('promo_codes').select('*').order('created_at', { ascending: false })
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  const all = data || []
  const { ok: isAdmin } = await checkAdmin(req)
  if (isAdmin) {
    res.json(all)
    return
  }
  const now = Date.now()
  res.json(
    all.filter(
      (p) => p.active === true && (!p.expires_at || new Date(p.expires_at).getTime() > now),
    ),
  )
})

app.post('/api/promos', async (req, res) => {
  const client = requireSupabase(req, res)
  if (!client) return
  if (!(await isAdminRequest(req, res))) return
  const { id, discountType, value, minSpend, expiresAt } = req.body ?? {}
  const code = typeof id === 'string' ? id.trim().toUpperCase() : ''
  if (!code) {
    res.status(400).json({ error: 'Promo code is required' })
    return
  }
  const type = discountType === 'fixed' ? 'fixed' : 'percent'
  const discountValue = Number(value)
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    res.status(400).json({ error: 'value must be a positive number' })
    return
  }
  const minimumSpend = Number(minSpend) >= 0 ? Number(minSpend) : 0
  let expiry = null
  if (expiresAt) {
    expiry = new Date(expiresAt)
    if (Number.isNaN(expiry.getTime())) {
      res.status(400).json({ error: 'expiresAt is not a valid date' })
      return
    }
    expiry = expiry.toISOString()
  }
  const { data, error } = await client
    .from('promo_codes')
    .insert({
      id: code,
      discount_type: type,
      value: discountValue,
      min_spend: minimumSpend,
      expires_at: expiry,
      active: true,
    })
    .select()
    .single()
  if (error) {
    res.status(400).json({ error: error.message })
    return
  }
  res.status(201).json(data)
})

app.patch('/api/promos/:id', async (req, res) => {
  const client = requireSupabase(req, res)
  if (!client) return
  if (!(await isAdminRequest(req, res))) return
  const code = String(req.params.id || '').trim()
  if (!code) {
    res.status(400).json({ error: 'Promo code is required' })
    return
  }
  const { active } = req.body ?? {}
  if (typeof active !== 'boolean') {
    res.status(400).json({ error: 'active must be a boolean' })
    return
  }
  const { data, error } = await client
    .from('promo_codes')
    .update({ active })
    .eq('id', code)
    .select()
    .single()
  if (error) {
    res.status(400).json({ error: error.message })
    return
  }
  res.json(data)
})

// ---------- Product management (add / edit from the dashboard) ----------

app.post('/api/products', async (req, res) => {
  const client = requireSupabase(req, res)
  if (!client) return
  if (!(await isAdminRequest(req, res))) return
  const body = req.body ?? {}
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const price = Number(body.price)
  const category = typeof body.category === 'string' ? body.category.trim() : ''
  if (!name || !Number.isFinite(price) || price < 0 || !category) {
    res.status(400).json({ error: 'name, price (≥ 0), and category are required' })
    return
  }

  const baseSlug = slugify(name) || 'product'
  // Keep the public slug unique in case two products share a name
  const slug = `${baseSlug}-${String(Date.now()).slice(-6)}`
  const row = {
    id: slug,
    name,
    slug,
    price,
    category,
    badge: body.badge || null,
    description: body.description ? String(body.description).slice(0, 2000) : null,
    image: body.image || DEFAULT_PRODUCT_IMAGE,
    colors: Array.isArray(body.colors) ? body.colors : [],
    featured: Boolean(body.featured),
    best_seller: Boolean(body.bestSeller),
    new_arrival: Boolean(body.newArrival),
    sku: typeof body.sku === 'string' && body.sku.trim() ? body.sku.trim() : generateSku(),
    reorder_level: Number.isInteger(body.reorderLevel) && body.reorderLevel >= 0 ? body.reorderLevel : 3,
    cost_price: Number.isFinite(Number(body.costPrice)) && Number(body.costPrice) >= 0 ? Number(body.costPrice) : null,
    stock: Number.isInteger(body.stock) && body.stock >= 0 ? body.stock : 0,
    sort_order: 99,
  }

  const { data, error } = await client.from('products').insert(row).select().single()
  if (error) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'A product with this name/slug already exists' })
      return
    }
    res.status(500).json({ error: error.message })
    return
  }
  invalidateCatalog()
  res.status(201).json(mapProduct(data, { includeCost: true }))
})

app.patch('/api/products/:id', async (req, res) => {
  const client = requireSupabase(req, res)
  if (!client) return
  if (!(await isAdminRequest(req, res))) return
  const body = req.body ?? {}
  const updates = {}

  const stringFields = ['name', 'category', 'badge', 'description', 'image', 'sku']
  for (const field of stringFields) {
    if (body[field] !== undefined) updates[field] = String(body[field] ?? '') || null
  }
  if (body.price !== undefined) {
    const price = Number(body.price)
    if (!Number.isFinite(price) || price < 0) {
      res.status(400).json({ error: 'price must be a number ≥ 0' })
      return
    }
    updates.price = price
  }
  if (body.costPrice !== undefined) {
    if (body.costPrice === null || body.costPrice === '') {
      updates.cost_price = null
    } else {
      const cost = Number(body.costPrice)
      if (!Number.isFinite(cost) || cost < 0) {
        res.status(400).json({ error: 'costPrice must be a number ≥ 0' })
        return
      }
      updates.cost_price = cost
    }
  }
  if (body.reorderLevel !== undefined) {
    const level = Number(body.reorderLevel)
    if (!Number.isInteger(level) || level < 0) {
      res.status(400).json({ error: 'reorderLevel must be a whole number ≥ 0' })
      return
    }
    updates.reorder_level = level
  }
  for (const key of ['featured', 'bestSeller', 'newArrival']) {
    if (body[key] !== undefined) updates[key === 'bestSeller' ? 'best_seller' : key] = Boolean(body[key])
  }
  if (Array.isArray(body.colors)) updates.colors = body.colors

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'No valid fields to update' })
    return
  }

  const { data, error } = await client.from('products').update(updates).eq('id', req.params.id).select().single()
  if (error) {
    if (error.code === 'PGRST116') {
      res.status(404).json({ error: 'Product not found' })
      return
    }
    res.status(500).json({ error: error.message })
    return
  }
  invalidateCatalog()
  res.json(mapProduct(data, { includeCost: true }))
})

app.post('/api/newsletter', async (req, res) => {
  const client = requireSupabase(req, res)
  if (!client) return
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : ''
  if (!email) {
    res.status(400).json({ error: 'Email is required' })
    return
  }
  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'Enter a valid email address' })
    return
  }
  const { error } = await client.from('newsletter_subscribers').insert({ email })
  if (error) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'Email is already subscribed' })
      return
    }
    res.status(500).json({ error: error.message })
    return
  }
  res.status(201).json({ ok: true })
})

app.post('/api/contact', async (req, res) => {
  const client = requireSupabase(req, res)
  if (!client) return
  const { name, email, message } = req.body ?? {}
  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email, and message are required' })
    return
  }
  if (!EMAIL_RE.test(String(email).trim())) {
    res.status(400).json({ error: 'Enter a valid email address' })
    return
  }
  const { error } = await client.from('contact_messages').insert({ name, email, message })
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.status(201).json({ ok: true })
})

// ---------- Static client ----------
// Everything below MUST stay after all /api routes: a catch-all registered
// earlier would swallow them. This is what lets one Render service serve both
// the API and the built React app.

if (clientDistExists) {
  // Hashed Vite assets never change under the same name — cache them hard.
  app.use(
    '/assets',
    express.static(path.join(clientDist, 'assets'), {
      maxAge: '1y',
      immutable: true,
    }),
  )

  // index.html must never be cached. It references hashed asset filenames, and
  // those files are replaced on the next deploy — so a cached copy would point
  // at missing assets and render a blank page.
  const sendIndex = (_req, res) => {
    res.set('Cache-Control', 'no-cache')
    res.sendFile(path.join(clientDist, 'index.html'))
  }
  app.get('/index.html', sendIndex)

  app.use(express.static(clientDist, { index: false, maxAge: '1h' }))

  // React Router uses the History API, so a direct visit or refresh to /shop or
  // /cart must return index.html rather than a 404.
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    sendIndex(req, res)
  })
}

app.use('/api', (_req, res) => {
  res.status(404).json({ error: `No API route matches that path. See GET /api for the endpoint list.` })
})

app.use((_req, res) => {
  if (clientDistExists) {
    return res.status(404).sendFile(path.join(clientDist, 'index.html'))
  }
  res.status(404).json({ error: 'Not found' })
})

app.listen(port, () => {
  console.log(`Homeline listening on ${port} (database: ${supabase ? 'supabase' : 'unconfigured'})`)
  console.log(
    clientDistExists
      ? `Serving client from ${clientDist} — storefront and API on one origin`
      : 'Client build not found — running API only (run: cd client && npm run build)',
  )
})