import { images } from '../data/images'

export default function About() {
  const apiBase = import.meta.env.VITE_API_URL || '/api'

  async function onSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const payload = Object.fromEntries(form.entries())
    try {
      await fetch(`${apiBase}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch {
      /* portfolio fallback */
    }
    event.currentTarget.reset()
    event.currentTarget.dataset.sent = 'true'
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted">About</p>
          <h1 className="mt-3 font-display text-4xl sm:text-6xl">
            A quieter way to furnish the kitchen.
          </h1>
          <p className="mt-6 text-muted leading-relaxed">
            Homeline is a portfolio storefront for eco-conscious kitchenware —
            forest greens, warm linens, and objects meant to stay. We source
            renewable and recycled materials, work with small makers, and design
            for repair rather than replacement.
          </p>
        </div>
        <img
          src={images.about}
          alt="Garden greenery representing Homeline’s materials ethic"
          className="h-[420px] w-full rounded-[2rem] object-cover"
        />
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-16 max-w-xl rounded-[2rem] border border-line bg-white p-8"
      >
        <h2 className="font-display text-2xl">Write to us</h2>
        <label className="mt-6 block text-sm" htmlFor="name">
          Name
          <input
            id="name"
            name="name"
            required
            className="mt-2 w-full rounded-2xl border border-line px-4 py-3"
          />
        </label>
        <label className="mt-4 block text-sm" htmlFor="email">
          Email
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-2 w-full rounded-2xl border border-line px-4 py-3"
          />
        </label>
        <label className="mt-4 block text-sm" htmlFor="message">
          Message
          <textarea
            id="message"
            name="message"
            rows="4"
            required
            className="mt-2 w-full rounded-2xl border border-line px-4 py-3"
          />
        </label>
        <button
          type="submit"
          className="mt-6 rounded-full bg-forest px-6 py-3 text-sm text-cream"
        >
          Send
        </button>
      </form>
    </div>
  )
}
