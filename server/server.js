import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { createClient } from '@supabase/supabase-js'
import { categories as localCategories, products as localProducts } from './data/products.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

// In-memory fallbacks (used only when Supabase is not configured)
let newsletterSubscriptions = []
let contactMessages = []

// Supabase client — active only when both env vars are set
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
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, database: supabase ? 'supabase' : 'local' })
})

app.get('/api/products', async (_req, res) => {
  if (!supabase) {
    res.json(localProducts)
    return
  }
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json(data.map(mapProduct))
})

app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params
  if (!supabase) {
    const product = localProducts.find((item) => item.id === id)
    if (!product) {
      res.status(404).json({ error: 'Product not found' })
      return
    }
    res.json(product)
    return
  }
  const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle()
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

app.get('/api/categories', async (_req, res) => {
  if (!supabase) {
    res.json(localCategories)
    return
  }
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json(data)
})

app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body
  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'Email is required' })
    return
  }
  if (!supabase) {
    newsletterSubscriptions.push({ email, createdAt: new Date().toISOString() })
    res.status(201).json({ ok: true })
    return
  }
  const { error } = await supabase.from('newsletter_subscribers').insert({ email })
  if (error) {
    // Postgres unique violation (23505) = already subscribed
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
  const { name, email, message } = req.body
  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email, and message are required' })
    return
  }
  if (!supabase) {
    contactMessages.push({ name, email, message, createdAt: new Date().toISOString() })
    res.status(201).json({ ok: true })
    return
  }
  const { error } = await supabase.from('contact_messages').insert({ name, email, message })
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.status(201).json({ ok: true })
})

app.listen(port, () => {
  console.log(`Homeline API listening on ${port} (database: ${supabase ? 'supabase' : 'local'})`)
})