import { useState } from 'react';
import { Mail, MessageSquareText, Clock3, MapPin, Send, Loader, CheckCircle2 } from 'lucide-react';

const apiBase = import.meta.env.VITE_API_URL || '/api';

const ContactPage = () => {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          message: form.get('message'),
        }),
      });
      if (!res.ok) throw new Error('Could not send your message. Please try again.');
      setSent(true);
      e.currentTarget.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const details = [
    { icon: Mail, title: 'Email us', text: 'hello@homeline.ph' },
    { icon: MessageSquareText, title: 'Customer care', text: 'For order, tracking, and return questions' },
    { icon: Clock3, title: 'Hours', text: 'Mon–Sat, 9:00 AM to 6:00 PM (PHT)' },
    { icon: MapPin, title: 'Studio', text: 'Metro Manila, Philippines' }
  ];

  return (
    <div className="bg-cream">
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">Contact</p>
        <h1 className="mt-3 font-serif text-4xl text-charcoal sm:text-5xl">We&apos;d love to hear from you</h1>
        <p className="mt-5 max-w-2xl leading-relaxed text-muted">
          Questions about an order, a product, or a partnership? Send us a message and our team
          will get back to you within 1–2 working days.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {details.map((detail) => (
            <div key={detail.title} className="rounded-3xl border border-beige bg-white p-6 shadow-sm">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <detail.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-charcoal">{detail.title}</h3>
              <p className="mt-1 text-sm text-muted">{detail.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-5">
          <form onSubmit={handleSubmit} className="rounded-3xl border border-beige bg-white p-8 shadow-sm lg:col-span-3">
            <h2 className="font-serif text-2xl text-charcoal">Send a message</h2>

            {sent ? (
              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-green-50 p-5">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-green-700" />
                <div>
                  <p className="font-semibold text-green-800">Message sent!</p>
                  <p className="mt-1 text-sm text-green-700">
                    We&apos;ll get back to you within 1–2 working days.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-semibold text-charcoal">Your name</span>
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="Maria Santos"
                      className="w-full rounded-xl border border-beige bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-semibold text-charcoal">Your email</span>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="you@email.com"
                      className="w-full rounded-xl border border-beige bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </label>
                </div>
                <label className="mt-4 block text-sm">
                  <span className="mb-1.5 block font-semibold text-charcoal">Message</span>
                  <textarea
                    name="message"
                    rows="5"
                    required
                    placeholder="How can we help?"
                    className="w-full rounded-xl border border-beige bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </label>
                {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={sending}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark active:scale-95 disabled:opacity-50"
                >
                  {sending ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send message
                </button>
              </>
            )}
          </form>

          <div className="rounded-3xl bg-primary p-8 text-cream lg:col-span-2">
            <h3 className="font-serif text-2xl">Quick answers</h3>
            <ul className="mt-5 space-y-4 text-sm text-cream/90">
              <li>
                <span className="font-semibold text-cream">Track an order?</span>
                <p className="mt-0.5">Use the Track / Cancel Order page in the footer — just enter your order number.</p>
              </li>
              <li>
                <span className="font-semibold text-cream">Return something?</span>
                <p className="mt-0.5">See our Returns policy for the 7-day window and simple steps.</p>
              </li>
              <li>
                <span className="font-semibold text-cream">Wholesale or partnership?</span>
                <p className="mt-0.5">Mention it in your message and we&apos;ll route it to the right person.</p>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;