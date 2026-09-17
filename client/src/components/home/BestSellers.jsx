import Button from '../ui/Button';
import { ArrowRight } from 'lucide-react';

const BestSellers = ({ products }) => {
  const bestSellerProduct = products.find(p => p.bestSeller);

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left - Content */}
          <div className="space-y-6">
            <div>
              <p className="text-secondary text-sm uppercase tracking-wider mb-3">
                Customer Favorites
              </p>
              <h2 className="text-4xl lg:text-5xl font-bold text-charcoal mb-4">
                Best Sellers
              </h2>
              <p className="text-muted leading-relaxed">
                Discover our most-loved products, chosen by customers who value quality, 
                sustainability, and timeless design in their everyday kitchen essentials.
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
                Shop Best Sellers
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Right - Image */}
          <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-beige to-cream aspect-[4/3] shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1000&h=750&fit=crop&q=80" 
              alt="Best selling cookware products"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
