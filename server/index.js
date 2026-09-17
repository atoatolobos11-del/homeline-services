import cors from 'cors'
import express from 'express'
import { categories, products } from './data/products.js'

const app = express()
const port = process.env.PORT || 5000
const newsletter = []
const messages = []

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/products', (_req, res) => {
  res.json(products)
})

app.get('/api/products/:id', (req, res) => {
  const product = products.find((item) => item.id === req.params.id)
  if (!product) {
    res.status(404).json({ error: 'Product not found' })
    return
  }
  res.json(product)
})

app.get('/api/categories', (_req, res) => {
  res.json(categories)
})

app.post('/api/newsletter', (req, res) => {
  const { email } = req.body
  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'Email is required' })
    return
  }
  newsletter.push({ email, createdAt: new Date().toISOString() })
  res.status(201).json({ ok: true })
})

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body
  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email, and message are required' })
    return
  }
  messages.push({ name, email, message, createdAt: new Date().toISOString() })
  res.status(201).json({ ok: true })
})

app.listen(port, () => {
  console.log(`Homeline API listening on ${port}`)
})
