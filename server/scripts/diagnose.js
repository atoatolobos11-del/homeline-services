import pg from 'pg'

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

await client.connect()

const rls = await client.query(
  "select relname, relrowsecurity from pg_class where relname in ('products','categories','newsletter_subscribers','contact_messages')",
)
console.log('RLS:', JSON.stringify(rls.rows))

const counts = await client.query(
  "select 'products' as t, count(*)::int as n from products union all select 'categories', count(*)::int from categories",
)
console.log('ROWS:', JSON.stringify(counts.rows))

const policies = await client.query(
  "select tablename, policyname, cmd from pg_policies where tablename in ('products','categories')",
)
console.log('POLICIES:', JSON.stringify(policies.rows))

await client.end()