import { Leaf, Recycle, Sprout, Wind, PackageCheck, HeartHandshake } from 'lucide-react';

const pillars = [
  {
    icon: Recycle,
    title: 'Responsible materials',
    text: 'We favor renewable, recycled, and low-impact materials — bamboo, reclaimed wood, organic cotton, and borosilicate glass that lasts for years instead of ending up in a landfill.'
  },
  {
    icon: PackageCheck,
    title: 'Waste-free packaging',
    text: 'Orders ship in recyclable cardboard, kraft paper, and paper tape. No plastic shrink-wrap, no styrofoam — just protection that you can compost or recycle at home.'
  },
  {
    icon: Wind,
    title: 'Lower carbon footprint',
    text: 'Our products are designed to be lightweight and compact, which means fewer, more efficient deliveries. We batch orders whenever possible to cut down on carbon per parcel.'
  },
  {
    icon: Sprout,
    title: 'Design for repair',
    text: 'Every piece is built to be used, washed, and repaired rather than replaced. A replacement part is easier to ask for than a whole new product.'
  }
];

const stats = [
  { value: '100%', label: 'plastic-free packaging' },
  { value: '90%+', label: 'natural or recycled materials' },
  { value: '3x', label: 'longer product life vs. cheaper alternatives' },
  { value: '1', label: 'tree planted per every 10 orders' }
];

const SustainabilityPage = () => (
  <div className="bg-cream">
    {/* Hero */}
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted">Sustainability</p>
          <h1 className="mt-3 font-serif text-4xl text-charcoal sm:text-5xl">
            Good for your home, kinder to the planet.
          </h1>
          <p className="mt-6 leading-relaxed text-muted">
            Homeline started with a simple belief: everyday kitchenware shouldn&apos;t cost the
            earth — literally. So we choose materials carefully, package without plastic, and
            design pieces that people keep for years.
          </p>
        </div>
        <div className="rounded-[2rem] bg-primary p-8 text-cream">
          <Leaf className="h-10 w-10 text-cream/80" />
          <p className="mt-6 font-serif text-2xl leading-snug">
            &ldquo;Buy less, choose well, make it last.&rdquo;
          </p>
          <p className="mt-4 text-sm text-cream/80">
            That&apos;s the rule we use for every product we add to the lineup.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-beige bg-white p-6 text-center shadow-sm">
            <p className="font-serif text-4xl font-bold text-primary">{stat.value}</p>
            <p className="mt-2 text-sm text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Pillars */}
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <h2 className="font-serif text-3xl text-charcoal">How we keep it sustainable</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {pillars.map((pillar) => (
          <div key={pillar.title} className="rounded-3xl border border-beige bg-white p-7 shadow-sm">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <pillar.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-charcoal">{pillar.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{pillar.text}</p>
          </div>
        ))}
      </div>

      {/* Promise */}
      <div className="mt-12 flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-primary p-8 text-cream">
        <div className="flex items-center gap-4">
          <HeartHandshake className="h-10 w-10 text-cream/80" />
          <div>
            <h3 className="font-serif text-2xl">Our promise</h3>
            <p className="mt-1 text-sm text-cream/80">
              We review every supplier for fair labor and clean production — no shortcuts, no excuses.
            </p>
          </div>
        </div>
        <p className="rounded-full bg-cream px-5 py-2.5 text-sm font-semibold text-primary">
          Certified plastic-free since 2024
        </p>
      </div>
    </section>
  </div>
);

export default SustainabilityPage;