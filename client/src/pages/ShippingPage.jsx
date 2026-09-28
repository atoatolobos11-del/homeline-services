import { Truck, Clock3, PackageCheck, MapPin, CreditCard } from 'lucide-react';

const steps = [
  {
    icon: PackageCheck,
    title: '1–2 working days',
    text: 'We process and pack your order within 1–2 working days. You will receive an order number once your order is placed — keep it handy!'
  },
  {
    icon: Truck,
    title: 'Fast nationwide delivery',
    text: 'Metro Manila orders arrive in 1–3 days. Provincial deliveries take 3–7 days depending on your location.'
  },
  {
    icon: MapPin,
    title: 'Tracking included',
    text: 'Every order can be tracked using the Track / Cancel Order page in the footer. Enter your order number any time, 24/7.'
  },
  {
    icon: CreditCard,
    title: 'Pay on delivery available',
    text: 'We accept card, e-wallet, and Cash on Delivery. COD is available on orders all over the Philippines.'
  }
];

const rates = [
  { name: 'Express', price: '₱150', eta: 'Metro Manila: 1–2 days · Provincial: 3–5 days', note: 'Priority handling, tracked from pickup to drop-off' },
  { name: 'Priority', price: '₱250', eta: 'Metro Manila: next day · Provincial: 1–3 days', note: 'Fastest option — perfect for gift orders' }
];

const ShippingPage = () => (
  <div className="bg-cream">
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Shipping</p>
      <h1 className="mt-3 font-serif text-4xl text-charcoal sm:text-5xl">Shipping & delivery</h1>
      <p className="mt-5 max-w-2xl leading-relaxed text-muted">
        Every Homeline order is packed plastic-free and shipped with care anywhere in the
        Philippines.
      </p>

      {/* Shipping rates */}
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {rates.map((rate) => (
          <div key={rate.name} className="rounded-3xl border border-beige bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl text-charcoal">{rate.name}</h2>
              <span className="text-2xl font-bold text-primary">{rate.price}</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-charcoal">{rate.eta}</p>
            <p className="mt-1 text-sm text-muted">{rate.note}</p>
            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-cream px-4 py-3 text-sm text-charcoal">
              <Truck className="h-5 w-5 shrink-0 text-primary" />
              Free returns within 7 days — no questions asked.
            </div>
          </div>
        ))}
      </div>

      {/* Process steps */}
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <div key={step.title} className="rounded-3xl border border-beige bg-white p-6 shadow-sm">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <step.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-semibold text-charcoal">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{step.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center gap-3 rounded-3xl bg-primary p-8 text-center text-cream sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-4">
          <Clock3 className="h-10 w-10 text-cream/80" />
          <div>
            <h3 className="font-serif text-2xl">Is your order urgent?</h3>
            <p className="mt-1 text-sm text-cream/80">
              Choose Priority at checkout and send us a message — we&apos;ll do our best to ship it the very same day.
            </p>
          </div>
        </div>
        <p className="rounded-full bg-cream px-5 py-2.5 text-sm font-semibold text-primary">
          100% plastic-free packaging
        </p>
      </div>
    </section>
  </div>
);

export default ShippingPage;