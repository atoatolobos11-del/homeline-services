import { CalendarDays, Feather, ArrowRight } from 'lucide-react';

const articles = [
  {
    title: '5 easy ways to make your kitchen zero-waste',
    excerpt:
      'From reusable food wraps to bulk-buying staples, these small swaps cut your trash without turning your whole life upside down.',
    category: 'Zero Waste',
    date: 'September 12, 2026',
    readTime: '6 min read'
  },
  {
    title: 'Why we chose bamboo over plastic',
    excerpt:
      'Bamboo grows fast, needs no pesticides, and is naturally antibacterial — here is the full story behind our bamboo collection.',
    category: 'Materials',
    date: 'August 28, 2026',
    readTime: '8 min read'
  },
  {
    title: 'A week of plastic-free meal prep',
    excerpt:
      'We documented seven days of kitchen routines using only reusable Homeline pieces. The results surprised even us.',
    category: 'Living',
    date: 'August 9, 2026',
    readTime: '5 min read'
  },
  {
    title: 'The cast iron care guide you actually need',
    excerpt:
      'Seasoning, cleaning, and storage — everything about making your cast iron skillet last a lifetime, minus the jargon.',
    category: 'Care Guides',
    date: 'July 20, 2026',
    readTime: '7 min read'
  },
  {
    title: 'Small kitchens, big ideas: storage with style',
    excerpt:
      'Beautiful organization is possible even in tight spaces. Our design tips for a kitchen that feels twice as big.',
    category: 'Living',
    date: 'July 2, 2026',
    readTime: '9 min read'
  },
  {
    title: 'Meet the makers behind our linens',
    excerpt:
      'We handpick our organic linen partners. Get to know the weavers and the traditions behind your favorite towels.',
    category: 'Makers',
    date: 'June 15, 2026',
    readTime: '6 min read'
  }
];

const JournalPage = () => (
  <div className="bg-cream">
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Journal</p>
      <h1 className="mt-3 font-serif text-4xl text-charcoal sm:text-5xl">Stories from the Homeline kitchen</h1>
      <p className="mt-5 max-w-2xl leading-relaxed text-muted">
        Ideas, care guides, and behind-the-scenes notes on sustainable living — written by our
        team and the makers we work with.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <article key={article.title} className="group flex flex-col rounded-3xl border border-beige bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
                {article.category}
              </span>
              <span className="flex items-center gap-1 text-muted">
                <CalendarDays className="h-3.5 w-3.5" /> {article.date}
              </span>
            </div>
            <h2 className="mt-4 font-serif text-xl leading-snug text-charcoal">{article.title}</h2>
            <p className="mt-3 flex-1 text-sm leading-6 text-muted">{article.excerpt}</p>
            <div className="mt-5 flex items-center justify-between border-t border-beige pt-4">
              <span className="text-xs text-muted">{article.readTime}</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition group-hover:gap-2.5">
                Read <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center gap-3 rounded-3xl bg-primary p-8 text-center text-cream sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-4">
          <Feather className="h-10 w-10 text-cream/80" />
          <div>
            <h3 className="font-serif text-2xl">New articles every month</h3>
            <p className="mt-1 text-sm text-cream/80">
              Follow us on social media so you never miss a story.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-cream px-5 py-2.5 text-sm font-semibold text-primary">
          Est. published weekly
        </span>
      </div>
    </section>
  </div>
);

export default JournalPage;