import { useEffect, useRef, useState } from 'react';
import { HelpCircle, MessageCircle, Send, X, Bot, Sparkles } from 'lucide-react';

const apiBase = import.meta.env.VITE_API_URL || '/api';

// Order numbers look like HML-20260928-1004
const ORDER_RE = /HML-\d{8}-\d{4}/i;

const quickQuestions = [
  'Where is my order?',
  'Shipping times & fees',
  'Return or cancel an order',
  'What payment methods?',
  'Promo codes & discounts',
  'Out of stock items'
];

const followUpSuggestions = [
  'Track my order',
  'Shipping',
  'Returns',
  'Payment',
  'Promo codes',
  'Talk to a person'
];

// ---------- Knowledge base ----------

const ORDER_NUMBER_PROMPT =
  `To check that, I need your order number. It looks like this: HML-20260928-1004 (HML + date + 4 digits).\n\nJust type it here and I'll look it up for you right away.`;

const topics = [
  {
    id: 'track',
    keywords: ['track', 'tracking', 'where is my order', 'order status', 'status of my order', 'follow up', 'shipment', 'package', 'parcel', 'did you ship', 'is it shipped', 'delivery status'],
    answer: ORDER_NUMBER_PROMPT
  },
  {
    id: 'shipping',
    keywords: ['shipping', 'ship', 'deliver', 'delivery', 'how long', 'how many days', 'delivery fee', 'shipping cost', 'shipping fee', 'eta', 'e.t.a', 'metro manila', 'province', 'provincial', 'express', 'priority'],
    answer: `Here's how delivery works:\n\n• We pack orders within 1–2 working days.\n\n• Express ₱150 — Metro Manila 1–2 days, provincial 3–5 days\n• Priority ₱250 — Metro Manila next day, provincial 1–3 days\n\nAll orders ship 100% plastic-free. Once placed, just give me your order number here and I'll track it for you.`
  },
  {
    id: 'returns',
    keywords: ['return', 'refund', 'exchange', 'wrong item', 'damaged', 'defective', 'broken', 'change my mind', 'return it'],
    answer: `You're covered two ways:\n\n1) Cancel within 24 hours of ordering — instant refund, items go back to stock.\n2) Return within 7 days of delivery — item must be unused and in original packaging, and we cover return shipping.\n\nTo start, open the Returns page in the footer or message us via the Contact page. I can also help you cancel — just type your order number here.`
  },
  {
    id: 'cancel',
    keywords: ['cancel', 'cancelled', 'cancel order', 'cancel my order'],
    answer: `You can cancel any order within 24 hours of placing it — there's no charge and the items instantly return to stock.\n\n• Type your order number here and I'll check it for you.\n• Or open the "Track / Cancel Order" link in the footer, enter your number, and press Cancel.\n\nWe handle most cancellations immediately.`
  },
  {
    id: 'payment',
    keywords: ['payment', 'pay', 'cash on delivery', 'cod', 'gcash', 'ewallet', 'e-wallet', 'paypal', 'credit card', 'debit', 'card', 'installment', 'how do i pay'],
    answer: `We accept:\n\n• Credit / debit cards\n• E-wallets and PayPal\n• Cash on Delivery (COD)\n\nPayments are processed securely at checkout. For COD orders, refunds are issued via GCash or bank transfer.`
  },
  {
    id: 'promo',
    keywords: ['promo', 'voucher', 'discount', 'coupon', 'code', 'promo code', 'save', 'off', 'percent off'],
    answer: `Promo codes work at checkout:\n\n• Type the code (e.g. SAVE10, WELCOME15) and press Apply — the discount shows instantly.\n• Some codes have a minimum spend or an expiry date.\n• If a code says "invalid", check the spelling and the minimum spend.\n\nIf you're a store owner, you can create and manage codes under Inventory → Promos.`
  },
  {
    id: 'outofstock',
    keywords: ['out of stock', 'sold out', 'restock', 'unavailable', 'no stock', 'when back', 'available again'],
    answer: `Out-of-stock items stay visible with an "Out of Stock" badge so you know they exist.\n\n• Message us on the Contact page and we'll tell you the expected restock date.\n• Subscribe to the newsletter in the footer for restock updates.\n• You can also ask about a similar alternative — we're happy to suggest one.`
  },
  {
    id: 'customize',
    keywords: ['customiz', 'customise', 'color', 'colour', 'size', 'variant', 'option', 'quantity', 'choose'],
    answer: `Every product page lets you pick a color, size, and quantity before adding it to your cart.\n\nYou can also edit the cart before checkout — just open your shopping bag and adjust color, size, or quantity per item.`
  },
  {
    id: 'gift',
    keywords: ['gift', 'wrap', 'personal note', 'greeting', 'gift wrap', 'for someone'],
    answer: `Yes, we love gift orders! 🎁 At checkout you can add:\n\n• Classic gift wrap — ₱50\n• Premium gift wrap — ₱100\n\nYou can also add a personal note for the recipient, free of charge.`
  },
  {
    id: 'checkout',
    keywords: ['checkout', 'place order', 'shopping bag', 'my cart', 'check out', 'pay for'],
    answer: `To place an order:\n\n1. Add items to your shopping bag.\n2. Click the bag icon → Checkout.\n3. You'll need to be signed in.\n4. Choose shipping, gift wrap, promo code, and payment.\n5. Review and confirm — you'll get an order number right away.\n\nKeep your order number — that's how you track or cancel your order.`
  },
  {
    id: 'login',
    keywords: ['login', 'log in', 'sign in', 'sign up', 'register', 'account', 'password', 'forgot', 'profile'],
    answer: `Create or log into your account from the Login page.\n\nImportant tip: use the SAME email at checkout and login — that's how your orders appear in your Profile under "My Orders".`
  },
  {
    id: 'contact',
    keywords: ['contact', 'human', 'agent', 'person', 'speak', 'talk', 'email', 'phone', 'call', 'support', 'representative', 'office'],
    answer: `You can reach our care team (Mon–Sat, 9 AM–6 PM PHT), and we reply within 1–2 working days:\n\n• Contact page — send a message form\n• Email — hello@homeline.ph\n\nFor faster help, include your order number (HML-...) and a short description of the issue.`
  },
  {
    id: 'about',
    keywords: ['about', 'who are you', 'company', 'history', 'mission', 'brand', 'homeline'],
    answer: `Homeline is an eco-friendly kitchenware brand from the Philippines — natural and recycled materials, timeless design, and 100% plastic-free packaging.\n\nYou can read our full story on the About page and our material promises on the Sustainability page.`
  },
  {
    id: 'careers',
    keywords: ['job', 'career', 'hire', 'work', 'vacancy', 'position', 'apply', 'employment'],
    answer: `We're hiring! 🎉 Check the Careers page in the footer for our open roles — fulfillment, customer care, and content creation.\n\nTo apply, send us a message through the Contact page and mention the role you're interested in.`
  },
  {
    id: 'materials',
    keywords: ['material', 'bamboo', 'linen', 'cotton', 'organic', 'wood', 'ceramic', 'glass', 'eco', 'environment', 'sustainable', 'plastic-free', 'recycled', 'non-toxic'],
    answer: `We use renewable and recycled materials — bamboo, organic cotton, linen, wood, glass, and non-toxic cookware finishes. Every order ships plastic-free.\n\nThe Sustainability page tells the full story, material by material.`
  },
  {
    id: 'thanks',
    keywords: ['thank', 'thanks', 'salamat', 'maraming salamat', 'appreciate'],
    answer: `You're most welcome! 💚 Anything else I can help you with today?`
  },
  {
    id: 'hello',
    keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'kumusta', 'kamusta'],
    answer: `Hello! 👋 I'm the Homeline care assistant.\n\nAsk me about shipping, returns, payments, or promo codes — or type your order number (HML-...) and I'll check its status for you.`
  }
];

const statusText = {
  pending: 'Pending — we are preparing your order',
  confirmed: 'Confirmed — your order is being packed',
  shipped: 'Shipped — on its way to you! 🚚',
  delivered: 'Delivered 🎉',
  cancelled: 'Cancelled — the items were returned to stock'
};

const formatPesoChat = (value) =>
  `₱${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatOrderDate = (date) =>
  new Date(date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });

// ---------- Reply engine ----------

const extractOrderNumber = (text) => (text.match(ORDER_RE) || [])[0] || null;

const lookupOrder = async (orderNumber) => {
  let res;
  try {
    res = await fetch(`${apiBase}/orders/${encodeURIComponent(orderNumber)}`);
  } catch {
    return 'Sorry, the order service is busy right now. Please try again in a moment, or use the Track / Cancel Order page.';
  }

  if (res.status === 404) {
    return (
      `I couldn't find an order with the number ${orderNumber}.\n\nPlease double-check the spelling — order numbers look like HML-20260928-1004. If it still doesn't work, message us on the Contact page and we'll investigate.`
    );
  }
  if (!res.ok) {
    return 'Something went wrong while checking that order. Please try again in a moment.';
  }

  const order = await res.json();
  const lines = [
    `Here's your order ${order.orderNumber}:`,
    '',
    `• Placed on: ${formatOrderDate(order.createdAt)}`,
    `• Total: ${formatPesoChat(order.total)}`,
    `• Status: ${statusText[order.status] || order.status}`,
    ''
  ];
  if (order.items?.length) {
    lines.push('Items:');
    for (const item of order.items) {
      lines.push(`  • ${item.productName} × ${item.quantity}`);
    }
    lines.push('');
  }
  if (order.status === 'pending' || order.status === 'confirmed') {
    lines.push(`Need to cancel? Orders can be cancelled within 24 hours — just type "cancel" and I'll guide you.`);
  } else if (order.status === 'cancelled') {
    lines.push('This order was cancelled — the amount has been or will be refunded to your original payment method.');
  }
  return lines.join('\n');
};

const getReply = async (text) => {
  const orderNumber = extractOrderNumber(text);
  if (orderNumber) return lookupOrder(orderNumber);

  const lower = text.toLowerCase();

  // Tracking intent without an order number
  const trackingHints = ['where is', 'track', 'status', 'follow', 'shipment', 'package', 'parcel', 'shipped', 'delivered'];
  const asksAboutOrder =
    lower.includes('order') || lower.includes('parcel') || lower.includes('package') || lower.includes('deliver');
  if (trackingHints.some((hint) => lower.includes(hint)) && asksAboutOrder) {
    return ORDER_NUMBER_PROMPT;
  }

  const topic = topics.find((entry) => entry.keywords.some((keyword) => lower.includes(keyword)));
  if (topic) return topic.answer;

  return (
    `I'm not sure about that one yet. 🤔\n\nI can help with shipping, returns, cancellations, payments, promo codes, and out-of-stock items — or type your order number (HML-...) and I'll check it instantly.\n\nIf you need a person, use the Contact page and our team will reply within 1–2 working days.`
  );
};

// ---------- Component ----------

const HelpChatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [mode, setMode] = useState('default'); // 'default' | 'followup'
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: `Hi! 👋 I'm the Homeline care assistant.\n\nAsk me about shipping, returns, payments, or promo codes — or type your order number (HML-...) and I'll check its status right here.`
    }
  ]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, open]);

  const askQuestion = async (question) => {
    const trimmed = (question || '').trim();
    if (!trimmed || typing) return;

    setMode('default');
    setInput('');
    setMessages((current) => [...current, { from: 'user', text: trimmed }]);
    setTyping(true);

    const reply = await getReply(trimmed);
    setMessages((current) => [...current, { from: 'bot', text: reply }]);

    // Offer follow-up suggestions after a fallback answer.
    const lower = trimmed.toLowerCase();
    const isFallback =
      reply.startsWith('I\'m not sure about that one yet') ||
      reply.startsWith('I couldn\'t find an order');
    setMode(isFallback ? 'followup' : 'default');

    setTyping(false);
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  const chips = mode === 'followup' ? followUpSuggestions : quickQuestions;

  return (
    <div className="fixed bottom-5 right-5 z-[55]">
      {open && (
        <section
          className="mb-3 flex w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-beige bg-white shadow-2xl"
          aria-label="Homeline customer care chat"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-primary px-4 py-3.5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cream text-lg font-bold text-primary">
                H
              </div>
              <div>
                <p className="font-semibold">Homeline Care</p>
                <p className="flex items-center gap-1.5 text-xs text-white/80">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                  </span>
                  Online · replies instantly
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close help chat"
              className="rounded-full p-1.5 transition hover:bg-white/15"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="max-h-80 min-h-64 space-y-3 overflow-y-auto bg-cream/50 p-3"
          >
            {messages.map((message, index) => (
              <div key={`${message.from}-${index}`} className={`flex items-end gap-2 ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.from === 'bot' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <p
                  className={`max-w-[82%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-5 shadow-sm ${
                    message.from === 'user' ? 'rounded-br-md bg-primary text-white' : 'rounded-bl-md bg-white text-charcoal'
                  }`}
                >
                  {message.text}
                </p>
              </div>
            ))}

            {typing && (
              <div className="flex items-end gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted/60 [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted/60 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted/60 [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-2 border-t border-beige p-3">
            {chips.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => askQuestion(question)}
                className="rounded-full border border-beige bg-white px-3 py-1.5 text-left text-xs text-charcoal transition hover:border-primary hover:bg-primary/5 hover:text-primary"
              >
                {question}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              askQuestion(input);
            }}
            className="flex gap-2 border-t border-beige bg-white p-3"
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your message…"
              aria-label="Type your message"
              className="min-w-0 flex-1 rounded-full border border-beige px-4 py-2.5 text-sm outline-none transition focus:border-primary"
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={typing}
              className="rounded-full bg-primary p-2.5 text-white transition hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-lg active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          <p className="flex items-center justify-center gap-1.5 border-t border-beige bg-white px-3 py-2 text-[10px] text-muted">
            <Sparkles className="h-3 w-3" />
            Homeline Care assistant · for a human, open the Contact page
          </p>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-label={open ? 'Close help chat' : 'Open help chat'}
        className="ml-auto flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-1 hover:bg-primary-dark hover:shadow-xl"
      >
        <MessageCircle className="h-5 w-5" />
        <span>{open ? 'Close' : 'Need help?'}</span>
      </button>
    </div>
  );
};

export default HelpChatbot;