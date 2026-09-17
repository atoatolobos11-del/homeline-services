import Button from '../ui/Button';
import { ArrowRight } from 'lucide-react';

const NewArrival = ({ products }) => {
  const newProduct = products.find(p => p.newArrival);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left - Image */}
          <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-secondary/20 to-accent/20 aspect-[4/3] order-2 lg:order-1 shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1000&h=750&fit=crop&q=80" 
              alt="New arrival eco-friendly kitchen products"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Right - Content */}
          <div className="space-y-6 order-1 lg:order-2">
            <div>
              <p className="text-accent text-sm uppercase tracking-wider mb-3">
                Just Launched
              </p>
              <h2 className="text-4xl lg:text-5xl font-bold text-charcoal mb-4">
                New Arrival
              </h2>
              <p className="text-muted leading-relaxed mb-4">
                Introducing our latest addition to the collection. Crafted with care, 
                designed for modern living, and made with the planet in mind.
              </p>
              <p className="text-muted leading-relaxed">
                Each piece embodies our commitment to sustainability without compromising 
                on style or functionality.
              </p>
            </div>

            <div className="pt-4">
              <Button 
                variant="primary" 
                className="group"
                onClick={() => {
                  const element = document.querySelector('#products');
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                Discover New Arrivals
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewArrival;
