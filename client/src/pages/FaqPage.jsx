import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'How long does delivery take?',
    a: 'We pack orders within 1–2 working days. Metro Manila delivery takes 1–3 days after that, and provincial deliveries take 3–7 days. Express shipping is ₱150 and Priority is ₱250.',
  },
  {
    q: 'How do I track or cancel my order?',
    a: 'Open the Track / Cancel Order page in the footer and enter your order number. You can also cancel there within 24 hours of placing your order — stock is returned instantly and there is no charge.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept credit/debit cards, e-wallets, and Cash on Delivery. For COD, refunds are issued via GCash or bank transfer.',
  },
  {
    q: 'Can I return an item if I change my mind?',
    a: 'Yes — you have 7 days from delivery to return unused items in their original condition. We cover return shipping. See the Returns page for the full steps.',
  },
  {
    q: 'How do promo codes work?',
    a: 'Enter a valid promo code at checkout and the discount is applied right away. Codes may have a minimum spend or expiry date — the checkout will tell you if a code is invalid, expired, or below the minimum.',
  },
  {
    q: 'What if a product is out of stock?',
    a: 'Out-of-stock items stay visible on the shop so you know they exist — they are marked with an "Out of Stock" badge. Message us on the Contact page and we will tell you when the next restock is expected.',
  },
  {
    q: 'Are your materials really eco-friendly?',
    a: 'Yes. Our products use renewable, recycled, or natural materials, and every order ships 100% plastic-free. You can read more on our Sustainability page.',
  },
  {
    q: 'How can I contact support?',
    a: 'Use the Contact page to send us a message, or email hello@homeline.ph. We reply within 1–2 working days, Monday to Saturday.',
  }
];

const FaqPage = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="bg-cream">
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-center text-xs uppercase tracking-[0.22em] text-muted">Help Center</p>
        <h1 className="mt-3 text-center font-serif text-4xl text-charcoal sm:text-5xl">
          Frequently asked questions
        </h1>
        <p className="mt-5 text-center text-muted">
          Quick answers to the questions we hear most. Something else on your mind?{' '}
          <a href="/contact" className="font-semibold text-primary underline">
            Contact us
          </a>
          .
        </p>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.q} className="overflow-hidden rounded-3xl border border-beige bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="flex items-center gap-3 font-semibold text-charcoal">
                    <HelpCircle className="hidden h-5 w-5 shrink-0 text-primary sm:block" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-beige bg-cream/50 px-6 py-5">
                    <p className="text-sm leading-6 text-muted">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 rounded-3xl bg-primary p-8 text-center text-cream">
          <h2 className="font-serif text-2xl">Still need help?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-cream/80">
            Our customer care team replies within 1–2 working days, Monday to Saturday.
          </p>
          <a
            href="/contact"
            className="mt-5 inline-flex rounded-full bg-cream px-6 py-2.5 text-sm font-semibold text-primary transition hover:bg-cream/90 active:scale-95"
          >
            Contact us
          </a>
        </div>
      </section>
    </div>
  );
};

export default FaqPage;