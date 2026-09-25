import { Link } from 'react-router-dom';

const highlights = [
  {
    title: 'Thoughtful design',
    text: 'Every piece is created to make daily rituals simpler, calmer, and more beautiful.'
  },
  {
    title: 'Responsible materials',
    text: 'We prioritize durable, natural, and low-impact materials that feel premium and last longer.'
  },
  {
    title: 'Made for everyday life',
    text: 'Our products blend utility and beauty so they work beautifully in real homes every day.'
  }
];

const values = [
  'Eco-conscious choices',
  'Functional, timeless design',
  'Better living through everyday essentials',
  'Built for long-term use'
];

const process = [
  {
    number: '01',
    title: 'Discover',
    text: 'We study the rituals people repeat most and design around those real-life needs.'
  },
  {
    number: '02',
    title: 'Refine',
    text: 'We test shape, material, comfort, and practicality until every detail feels intentional.'
  },
  {
    number: '03',
    title: 'Bring home',
    text: 'We deliver pieces that elevate daily life without excess or unnecessary complexity.'
  }
];

const AboutPage = () => {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Our story</p>
        <h1 className="mt-3 max-w-5xl text-4xl font-bold text-charcoal md:text-6xl">
          Thoughtful living, beautifully made
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-8 text-lg leading-8 text-charcoal">
          <p>
            Homeline creates everyday essentials that make home routines calmer, more intentional, and more beautiful.
          </p>
          <p>
            We design durable, functional pieces with natural textures, warm tones, and sustainable materials that feel as good as they look.
          </p>
          <p>
            From the kitchen to the table, every product is created to bring comfort, simplicity, and lasting value into modern homes.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <img
            src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80"
            alt="Warm kitchen interior"
            className="h-52 w-full rounded-3xl object-cover shadow-lg sm:h-64"
          />
          <img
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80"
            alt="Modern dining setup"
            className="h-52 w-full rounded-3xl object-cover shadow-lg sm:h-64"
          />
        </div>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {highlights.map((item) => (
          <div key={item.title} className="rounded-3xl border border-beige bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              ✓
            </div>
            <h2 className="text-xl font-bold text-charcoal">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-3xl bg-[#f5f0e6] p-8 md:p-10">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Why Homeline</p>
        <h2 className="mt-3 text-3xl font-bold text-charcoal">Built around what matters most</h2>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {values.map((value) => (
            <div key={value} className="rounded-2xl bg-white px-5 py-4 text-base text-charcoal shadow-sm">
              {value}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">How we work</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {process.map((step) => (
            <div key={step.number} className="rounded-3xl border border-beige bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-primary">{step.number}</p>
              <h3 className="mt-3 text-2xl font-bold text-charcoal">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-beige">
          <p className="text-sm uppercase tracking-[0.2em] text-muted">Impact</p>
          <p className="mt-3 text-4xl font-bold text-primary">98%</p>
          <p className="mt-2 text-sm text-muted">of our product stories focus on long-lasting usefulness and home value.</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-beige">
          <p className="text-sm uppercase tracking-[0.2em] text-muted">Materials</p>
          <p className="mt-3 text-4xl font-bold text-primary">Natural</p>
          <p className="mt-2 text-sm text-muted">Warm, tactile textures selected for comfort and sustainability.</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-beige">
          <p className="text-sm uppercase tracking-[0.2em] text-muted">Experience</p>
          <p className="mt-3 text-4xl font-bold text-primary">Daily</p>
          <p className="mt-2 text-sm text-muted">Designed to fit naturally into modern routines and everyday spaces.</p>
        </div>
      </div>

      <div className="mt-14 flex flex-wrap gap-4">
        <Link
          to="/"
          className="inline-block rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-lg active:scale-95"
        >
          Back to home
        </Link>
        <Link
          to="/shop"
          className="inline-block rounded-full border border-primary px-6 py-3 text-sm font-medium text-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary hover:text-white hover:shadow-lg active:scale-95"
        >
          Explore products
        </Link>
      </div>
    </div>
  );
};

export default AboutPage;
