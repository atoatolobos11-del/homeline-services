import Button from '../ui/Button';
import { ArrowRight } from 'lucide-react';

const FeaturedBanner = () => {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-secondary to-accent min-h-[400px] lg:min-h-[500px]">
          <img 
            src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&h=600&fit=crop&q=80" 
            alt="Modern sustainable kitchen lifestyle"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Content Card */}
          <div className="absolute bottom-8 left-8 bg-white rounded-2xl p-6 lg:p-8 max-w-sm shadow-2xl">
            <p className="text-xs uppercase tracking-wider text-secondary font-semibold mb-2">
              Featured Collection
            </p>
            <h3 className="text-2xl lg:text-3xl font-bold text-charcoal mb-4">
              Kitchen Essentials for Modern Living
            </h3>
            <Button 
              variant="primary" 
              className="group"
              onClick={() => {
                const element = document.querySelector('#products');
                element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              Explore Collection
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBanner;
