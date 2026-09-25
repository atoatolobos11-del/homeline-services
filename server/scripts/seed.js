// One-time script: creates the tables and loads seed data straight into Supabase.
// Usage:  DATABASE_URL="postgresql://..." node scripts/seed.js
// (Database > Connect > Session pooler URI — it must include the password.)
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('Missing DATABASE_URL. Run with:  DATABASE_URL="postgresql://..." node scripts/seed.js')
  process.exit(1)
}

const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })

try {
  await client.connect()
  const sql = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'supabase', 'seed.sql'), 'utf8')
  await client.query(sql)
  console.log('> Tables created + data seeded.')

  const products = await client.query('select count(*)::int as n from products')
  const categories = await client.query('select count(*)::int as n from categories')
  console.log(`> Verified: ${products.rows[0].n} products, ${categories.rows[0].n} categories.`)
  console.log('DONE')
} catch (err) {
  console.error('Seed failed:', err.message)
  process.exitCode = 1
} finally {
  await client.end()
}