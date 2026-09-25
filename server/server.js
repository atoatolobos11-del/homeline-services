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
})

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

// Manual stock edit from the Inventory dashboard
app.patch('/api/inventory/:id', async (req, res) => {
  const client = requireSupabase(req, res)
  if (!client) return
  const stock = Number(req.body?.stock)
  if (!Number.isInteger(stock) || stock < 0 || stock > 99999) {
    res.status(400).json({ error: 'Stock must be a whole number between 0 and 99999' })
    return
  }
  const { data, error } = await client.rpc('set_product_stock', {
    product_id: req.params.id,
    new_stock: stock,
  })
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json({ ok: true, id: req.params.id, stock: data })
})

// Called at checkout — atomically reduces stock for every paid item.
// Returns 409 if any item has insufficient stock (order is not completed).
app.post('/api/inventory/order', async (req, res) => {
  const client = requireSupabase(req, res)
  if (!client) return
  const items = req.body?.items
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'items must be a non-empty array' })
    return
  }
  for (const item of items) {
    if (!item || typeof item.id !== 'string' || !Number.isInteger(item.quantity) || item.quantity < 1) {
      res.status(400).json({ error: 'Each item needs an id and a quantity of at least 1' })
      return
    }
  }

  // Pre-check every item first so a failed order never partially decrements stock
  const ids = items.map((item) => item.id)
  const { data: rows, error: fetchError } = await client.from('products').select('id, stock').in('id', ids)
  if (fetchError) {
    res.status(500).json({ error: fetchError.message })
    return
  }
  const stockById = Object.fromEntries((rows || []).map((row) => [row.id, Number(row.stock ?? 0)]))
  const insufficient = items.filter((item) => (stockById[item.id] ?? 0) < item.quantity).map((item) => item.id)

  if (insufficient.length > 0) {
    res.status(409).json({ error: 'Not enough stock for one or more items', insufficient })
    return
  }

  const updated = []
  for (const item of items) {
    const { data, error } = await client.rpc('decrement_stock', {
      product_id: item.id,
      amount: item.quantity,
    })
    if (error) {
      res.status(500).json({ error: error.message })
      return
    }
    updated.push({ id: item.id, stock: data })
  }
  res.json({ ok: true, updated })
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