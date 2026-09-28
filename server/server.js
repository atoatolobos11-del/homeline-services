import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

// Supabase client — the single source of truth.
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

app.use(cors())
app.use(express.json())

// Map snake_case DB rows to the camelCase shape the frontend expects
const mapProduct = (row) => ({
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
  costPrice: row.cost_price != null ? Number(row.cost_price) : null,
})

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

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, database: supabase ? 'supabase' : 'unconfigured' })
})

app.get('/api/products', async (_req, res) => {
  const client = requireSupabase(_req, res)
  if (!client) return
  const { data, error } = await client.from('products').select('*').order('sort_order', { ascending: true })
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json(data.map(mapProduct))
})

app.get('/api/products/:id', async (req, res) => {
  const client = requireSupabase(req, res)
  if (!client) return
  const { id } = req.params
  const { data, error } = await client.from('products').select('*').eq('id', id).maybeSingle()
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  if (!data) {
    res.status(404).json({ error: 'Product not found' })
    return
  }
  res.json(mapProduct(data))
})

// ---------- Inventory ----------

app.get('/api/inventory', async (_req, res) => {
  const client = requireSupabase(_req, res)
  if (!client) return
  const { data, error } = await client.from('products').select('*').order('sort_order', { ascending: true })
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json(data.map(mapProduct))
})

// Audit trail of every stock change (sales, restocks, adjustments)
app.get('/api/inventory/movements', async (_req, res) => {
  const client = requireSupabase(_req, res)
  if (!client) return
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
  res.json({ ok: true, id: req.params.id, stock: data, delta })
})

// Quick restock from the Inventory dashboard — logged as a "restock" movement.
app.post('/api/inventory/restock', async (req, res) => {
  const client = requireSupabase(req, res)
  if (!client) return
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
  res.status(201).json(result.data)
})

// Sales history for the Inventory dashboard, with per-order line items.
app.get('/api/orders', async (_req, res) => {
  const client = requireSupabase(_req, res)
  if (!client) return
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

// Public order lookup by order number (for the Track / Cancel Order page).
app.get('/api/orders/:orderNumber', async (req, res) => {
  const client = requireSupabase(req, res)
  if (!client) return
  const orderNumber = String(req.params.orderNumber || '').trim()
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
    items: (items || []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      unitPrice: Number(item.unit_price),
      costPrice: Number(item.cost_price),
      quantity: item.quantity,
      subtotal: Number(item.subtotal),
      profit: Math.round((Number(item.unit_price) - Number(item.cost_price || 0)) * Number(item.quantity || 0) * 100) / 100,
    })),
  })
})

// Customer cancellation: restores stock and marks the order cancelled.
app.post('/api/orders/cancel', async (req, res) => {
  const client = requireSupabase(req, res)
  if (!client) return
  const orderNumber = typeof req.body?.orderNumber === 'string' ? req.body.orderNumber.trim() : ''
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
  res.json(result.data)
})

app.get('/api/categories', async (_req, res) => {
  const client = requireSupabase(_req, res)
  if (!client) return
  const { data, error } = await client.from('categories').select('*').order('sort_order', { ascending: true })
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json(data)
})

// ---------- Product reviews ----------

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
  res.status(201).json(data)
})

// ---------- Promo codes (Inventory > Promos) ----------

app.get('/api/promos', async (_req, res) => {
  const client = requireSupabase(_req, res)
  if (!client) return
  const { data, error } = await client.from('promo_codes').select('*').order('created_at', { ascending: false })
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json(data || [])
})

app.post('/api/promos', async (req, res) => {
  const client = requireSupabase(req, res)
  if (!client) return
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
  res.status(201).json(mapProduct(data))
})

app.patch('/api/products/:id', async (req, res) => {
  const client = requireSupabase(req, res)
  if (!client) return
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
  res.json(mapProduct(data))
})

app.post('/api/newsletter', async (req, res) => {
  const client = requireSupabase(req, res)
  if (!client) return
  const { email } = req.body
  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'Email is required' })
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
  const { name, email, message } = req.body
  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email, and message are required' })
    return
  }
  const { error } = await client.from('contact_messages').insert({ name, email, message })
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.status(201).json({ ok: true })
})

app.listen(port, () => {
  console.log(`Homeline API listening on ${port} (database: ${supabase ? 'supabase' : 'unconfigured'})`)
})