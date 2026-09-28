import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, Briefcase, ArrowRight, Heart } from 'lucide-react';

const roles = [
  {
    icon: MapPin,
    title: 'Store & Fulfillment Associate',
    type: 'Full-time · On-site',
    location: 'Metro Manila',
    description:
      'Packing orders, managing stock, and making sure every parcel leaves our facility looking beautiful and plastic-free.'
  },
  {
    icon: Users,
    title: 'Customer Care Specialist',
    type: 'Full-time · Hybrid',
    location: 'Metro Manila',
    description:
      'Helping customers with orders, tracking, returns, and questions — with the patience and warmth Homeline is known for.'
  },
  {
    icon: Briefcase,
    title: 'Content Creator (Kitchen & Lifestyle)',
    type: 'Part-time · Remote',
    location: 'Anywhere in the Philippines',
    description:
      'Photographing and filming our products in real kitchens, and writing stories for the Homeline Journal.'
  }
];

const benefits = [
  'Flexible, people-first schedule',
  'HMO coverage after the first 3 months',
  'Staff discount on all Homeline products',
  'Growth path — most of our leads started in fulfillment',
  'A team that genuinely cares about sustainability'
];

const CareersPage = () => (
  <div className="bg-cream">
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Careers</p>
      <h1 className="mt-3 font-serif text-4xl text-charcoal sm:text-5xl">Come build Homeline with us</h1>
      <p className="mt-5 max-w-2xl leading-relaxed text-muted">
        We&apos;re a small, growing team of people who care about how homes are furnished — and
        how that affects the planet. If that sounds like you, we&apos;d love to meet.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <div key={role.title} className="flex flex-col rounded-3xl border border-beige bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <role.icon className="h-6 w-6" />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">{role.type}</p>
            <h2 className="mt-1 font-serif text-xl text-charcoal">{role.title}</h2>
            <p className="mt-1 text-sm font-medium text-primary">{role.location}</p>
            <p className="mt-3 flex-1 text-sm leading-6 text-muted">{role.description}</p>
            <Link
              to="/contact"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark active:scale-95"
            >
              Apply now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-primary p-8 text-cream">
          <Heart className="h-9 w-9 text-cream/80" />
          <h3 className="mt-4 font-serif text-2xl">Perks & benefits</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/90">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cream/70" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-center rounded-3xl border border-beige bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-primary" />
            <h3 className="font-serif text-2xl text-charcoal">How to apply</h3>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">
            Send us a short message through our <Link to="/contact" className="font-semibold text-primary underline">contact page</Link> —
            tell us which role you&apos;re interested in and why you&apos;d be great at it. We reply to
            every application within 5 working days.
          </p>
          <p className="mt-4 flex items-center gap-2 rounded-2xl bg-cream px-4 py-3 text-sm text-charcoal">
            <MapPin className="h-5 w-5 shrink-0 text-primary" />
            No open role but still interested? Reach out — we&apos;re always on the lookout for good people.
          </p>
        </div>
      </div>
    </section>
  </div>
);

export default CareersPage;