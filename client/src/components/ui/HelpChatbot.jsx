import { useState } from 'react';
import { HelpCircle, MessageCircle, Send, X } from 'lucide-react';

const quickQuestions = [
  'How do I customize a product?',
  'What payment methods do you accept?',
  'Can I add a gift wrap?',
  'How do I access checkout?'
];

const getReply = (question) => {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes('custom')) {
    return 'Click any product image or name to open its detail page. There you can choose a color, size, and quantity before adding it to your cart.';
  }

  if (lowerQuestion.includes('payment')) {
    return 'Checkout supports card payment, e-wallet, cash on delivery, and PayPal.';
  }

  if (lowerQuestion.includes('gift')) {
    return 'You can choose gift wrapping during checkout and add a personal order note.';
  }

  if (lowerQuestion.includes('checkout')) {
    return 'Add products to your cart, open the shopping bag, and select Checkout. You need to be signed in to complete checkout.';
  }

  if (lowerQuestion.includes('shipping') || lowerQuestion.includes('deliver')) {
    return 'Choose your preferred shipping method during checkout. Your address and shipping cost will be shown before placing the order.';
  }

  if (lowerQuestion.includes('return')) {
    return 'For help with a return or order issue, please contact the Homeline support team through the About page.';
  }

  return 'I can help with product customization, payment, gift wrapping, shipping, returns, and checkout.';
};

const HelpChatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! How can I help you with your Homeline order?' }
  ]);

  const askQuestion = (question) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    setMessages((currentMessages) => [
      ...currentMessages,
      { from: 'user', text: trimmedQuestion },
      { from: 'bot', text: getReply(trimmedQuestion) }
    ]);
    setInput('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-[55]">
      {open && (
        <section className="mb-3 flex w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-beige bg-white shadow-2xl" aria-label="Homeline help chat">
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Homeline Help</p>
                <p className="text-xs text-white/75">Quick answers for your order</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close help chat" className="rounded-full p-1 transition hover:bg-white/15">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-72 space-y-3 overflow-y-auto bg-cream/50 p-3">
            {messages.map((message, index) => (
              <div key={`${message.from}-${index}`} className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-5 ${message.from === 'user' ? 'bg-primary text-white' : 'bg-white text-charcoal shadow-sm'}`}>
                  {message.text}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 border-t border-beige p-3">
            {quickQuestions.map((question) => (
              <button key={question} type="button" onClick={() => askQuestion(question)} className="rounded-full border border-beige bg-white px-3 py-1.5 text-left text-xs text-charcoal transition hover:border-primary hover:text-primary">
                {question}
              </button>
            ))}
          </div>

          <form onSubmit={(event) => { event.preventDefault(); askQuestion(input); }} className="flex gap-2 border-t border-beige p-3">
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask for help" aria-label="Ask for help" className="min-w-0 flex-1 rounded-full border border-beige px-3 py-2 text-sm outline-none focus:border-primary" />
            <button type="submit" aria-label="Send help question" className="rounded-full bg-primary p-2 text-white transition hover:-translate-y-0.5 hover:shadow-lg">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      )}

      <button type="button" onClick={() => setOpen((isOpen) => !isOpen)} aria-label={open ? 'Close help chat' : 'Open help chat'} className="ml-auto flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-1 hover:bg-primary-dark hover:shadow-xl">
        <MessageCircle className="h-5 w-5" />
        <span>{open ? 'Close' : 'Need help?'}</span>
      </button>
    </div>
  );
};

export default HelpChatbot;
