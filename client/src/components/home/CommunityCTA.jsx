import { useState } from 'react'
import { images } from '../../data/images'
import Button from '../ui/Button'

const apiBase = import.meta.env.VITE_API_URL || '/api'

export default function CommunityCTA() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')

  async function onSubmit(event) {
    event.preventDefault()
    try {
      const response = await fetch(`${apiBase}/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!response.ok) throw new Error('Request failed')
      setStatus('Welcome — we’ll send quiet seasonal notes.')
      setEmail('')
    } catch {
      setStatus('Saved locally. We’ll keep you in the loop.')
      setEmail('')
    }
  }

  return (
    <section className="px-4 pb-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] bg-forest lg:grid-cols-[1.4fr_1fr]">
        <div className="p-8 text-cream sm:p-12 lg:p-16">
          <h2 className="font-display text-3xl leading-tight sm:text-5xl">
            A greener kitchen starts with everyday choices.
          </h2>
          <p className="mt-4 max-w-lg text-sm text-cream/75">
            Join the Homeline journal for material notes, recipes, and low-waste
            kitchen ideas — no noise, no spam.
          </p>
          <form className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
            <label className="sr-only" htmlFor="newsletter-email">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              className="w-full rounded-full border border-cream/20 bg-white/10 px-5 py-3 text-sm text-cream placeholder:text-cream/50"
            />
            <Button type="submit" variant="light">
              Subscribe
            </Button>
          </form>
          {status ? <p className="mt-3 text-sm text-olive">{status}</p> : null}
        </div>
        <img
          src={images.cta}
          alt="Leafy greens and garden produce"
          className="h-64 w-full object-cover lg:h-full"
          loading="lazy"
        />
      </div>
    </section>
  )
}
