import { ShieldCheck, RotateCcw, CreditCard, Clock3 } from 'lucide-react';

const sections = [
  {
    icon: Clock3,
    title: 'Changed your mind? Cancel within 24 hours',
    text: 'You can cancel any order within 24 hours of placing it — right from the Track / Cancel Order page using your order number. There is no charge for cancelling, and we instantly return the items to stock.'
  },
  {
    icon: RotateCcw,
    title: '7-day returns on delivered orders',
    text: 'If your order has already shipped and you would like to return it, you have 7 days from delivery. Items must be unused, in their original condition, and with all packaging intact.'
  },
  {
    icon: ShieldCheck,
    title: 'Defective or damaged on arrival?',
    text: 'We take responsibility for every piece we ship. If an item arrives damaged or defective, email us a photo within 48 hours and we will send a replacement or refund at no cost to you.'
  },
  {
    icon: CreditCard,
    title: 'Refunds',
    text: 'Approved refunds return to your original payment method within 5–7 working days. COD orders are refunded via GCash or bank transfer of your choice.'
  }
];

const steps = [
  { number: '01', title: 'Message us', text: 'Send your order number + reason through the Contact page.' },
  { number: '02', title: 'We confirm', text: 'We reply within 1–2 working days to approve the return.' },
  { number: '03', title: 'Ship it back', text: 'Pack the item securely. We cover the return shipping cost.' },
  { number: '04', title: 'Refund issued', text: 'Once we receive the item, your refund is processed in 3–5 days.' }
];

const ReturnsPage = () => (
  <div className="bg-cream">
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Returns</p>
      <h1 className="mt-3 font-serif text-4xl text-charcoal sm:text-5xl">Cancellations & returns</h1>
      <p className="mt-5 max-w-2xl leading-relaxed text-muted">
        We want you to love what you ordered. If something is not right, here is exactly how we
        make it right.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {sections.map((section) => (
          <div key={section.title} className="rounded-3xl border border-beige bg-white p-7 shadow-sm">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <section.icon className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-serif text-xl text-charcoal">{section.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{section.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-3xl bg-primary p-8 text-cream">
        <h2 className="font-serif text-2xl">How a return works</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="rounded-2xl bg-cream/10 p-5">
              <p className="font-serif text-3xl font-bold text-cream/70">{step.number}</p>
              <h3 className="mt-2 font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-cream/80">{step.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-cream/80">
          Note: custom or gift-wrapped orders are still fully covered — just let us know in your
          first message.
        </p>
      </div>
    </section>
  </div>
);

export default ReturnsPage;