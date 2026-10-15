// One-time script: adds one review to each product that has none.
// Usage:  node scripts/seed-reviews.mjs   (run from the server/ directory)
// Reads SUPABASE_URL / SUPABASE_ANON_KEY from server/.env — the anon key is
// enough because RLS allows inserts into reviews. Safe to re-run: products
// that already have a review are skipped.
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

const REVIEWS = [
  { product_id: 'cookware-02', customer_name: 'Rosa Villanueva', rating: 5, comment: 'Coating feels quality, nothing sticks and cleanup is so easy. Worth it.' },
  { product_id: 'toaster-03', customer_name: 'Mark Aquino', rating: 4, comment: 'Quiet and even browning. Matches our cream kitchen perfectly.' },
  { product_id: 'bamboo-04', customer_name: 'Jenny Lim', rating: 5, comment: 'Sturdy and pretty on the counter. Holds all our cooking tools.' },
  { product_id: 'pour-over-05', customer_name: 'Carlos Tan', rating: 5, comment: 'Makes a clean, slow cup every morning. Beautiful stoneware.' },
  { product_id: 'linen-06', customer_name: 'Sofia Reyes', rating: 4, comment: 'Absorbent and softens with every wash. Love the sage color.' },
  { product_id: 'canister-07', customer_name: 'Paula Domingo', rating: 5, comment: 'Airtight seal keeps our coffee beans fresh. Pantry looks so tidy now.' },
  { product_id: 'basket-10', customer_name: 'Katrina Uy', rating: 4, comment: 'Handwoven texture is lovely. Sturdy enough for blankets and toys.' },
  { product_id: 'runner-12', customer_name: 'Bianca Cruz', rating: 5, comment: 'Elevates the whole dining table. Linen quality is excellent.' },
  { product_id: 'utensils-13', customer_name: 'Diego Santos', rating: 4, comment: 'Complete set, smooth finish, gentle on our pans. Good value.' },
  { product_id: 'pantry-14', customer_name: 'Angela Mora', rating: 5, comment: 'Bamboo lids seal tight. Our grains and pasta stay fresh for weeks.' },
  { product_id: 'trivets-15', customer_name: 'Jose Ramos', rating: 4, comment: 'Simple and does the job. Protects the counter from hot pots.' },
  { product_id: 'tablecloth-16', customer_name: 'Lorna Diaz', rating: 5, comment: 'Certified organic cotton you can feel. Drapes beautifully.' },
  { product_id: 'pillows-18', customer_name: 'Marco Perez', rating: 5, comment: 'Cool and breathable even on humid nights. Neck pain gone.' },
  { product_id: 'coffeetable-21', customer_name: 'Hannah Go', rating: 4, comment: 'Lightweight rattan, easy to move for cleaning. Glass top is thick.' },
  { product_id: 'pan-22', customer_name: 'Enrico Sy', rating: 5, comment: 'Perfect for eggs every morning. Handle stays cool, truly non-stick.' },
  { product_id: 'steel-pan-23', customer_name: 'Dennis Chua', rating: 4, comment: 'Heats evenly and sears well. Our everyday pan now.' },
]

const { data: existing, error: readError } = await supabase.from('reviews').select('product_id')
if (readError) {
  console.error('Could not read reviews:', readError.message)
  process.exit(1)
}
const hasReview = new Set((existing || []).map((r) => r.product_id))

let inserted = 0
let skipped = 0
for (const review of REVIEWS) {
  if (hasReview.has(review.product_id)) {
    skipped += 1
    continue
  }
  const { error } = await supabase.from('reviews').insert(review)
  if (error) {
    console.error(`FAIL ${review.product_id}:`, error.message)
  } else {
    inserted += 1
    hasReview.add(review.product_id)
  }
}

const { count } = await supabase.from('reviews').select('id', { head: true, count: 'exact' })
console.log(`> inserted=${inserted} skipped=${skipped} total_reviews=${count}`)
console.log('DONE')
