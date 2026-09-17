import { ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary to-primary-dark text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 z-10">
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Eco-Friendly
              </h1>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif italic font-bold leading-tight">
                Kitchenware
              </h1>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                for a greener home
              </h1>
            </div>
            
            <p className="text-lg text-cream/90 max-w-md leading-relaxed">
              Discover thoughtfully designed, sustainable kitchen essentials that make everyday living beautiful and planet-friendly.
            </p>

            <div className="pt-4">
              <Button 
                size="lg" 
                className="bg-cream text-primary hover:bg-white group"
                onClick={() => {
                  const element = document.querySelector('#products');
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                Shop now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-secondary/20">
              <img 
                src="https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&h=900&fit=crop&q=80" 
                alt="Modern eco-friendly kitchen"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating Info Card */}
            <div className="absolute -bottom-6 -left-6 bg-white text-charcoal rounded-2xl p-6 shadow-2xl max-w-xs">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-muted font-medium mb-1">Natural. Sustainable. Eco-conscious.</p>
                  <p className="text-3xl font-bold text-primary">96%</p>
                  <p className="text-xs text-muted mt-1">Plastic-free materials</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
