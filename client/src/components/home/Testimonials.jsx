import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      quote: "The quality is outstanding and I love knowing my kitchen choices are helping the planet. Best purchase this year!",
      author: "Sarah M.",
      rating: 5
    },
    {
      quote: "Beautiful, functional, and sustainable. These products have completely transformed my cooking experience.",
      author: "James L.",
      rating: 5
    },
    {
      quote: "Finally, kitchenware that matches my values. The designs are timeless and the craftsmanship is impeccable.",
      author: "Emma R.",
      rating: 5
    },
    {
      quote: "I appreciate the attention to detail and eco-friendly materials. Worth every penny!",
      author: "Michael T.",
      rating: 5
    }
  ];

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Rating */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-primary/5 rounded-full px-6 py-3 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-accent fill-accent" />
              ))}
            </div>
            <span className="text-3xl font-bold text-charcoal">4.9</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-charcoal mb-3">
            Loved by Customers
          </h2>
          <p className="text-muted text-lg">
            Join thousands of happy customers making sustainable choices
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-cream rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <Quote className="w-8 h-8 text-primary/30 mb-4" />
              
              <p className="text-sm text-charcoal leading-relaxed mb-4">
                {testimonial.quote}
              </p>
              
              <div className="flex items-center justify-between">
                <p className="font-semibold text-charcoal text-sm">
                  {testimonial.author}
                </p>
                <div className="flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
