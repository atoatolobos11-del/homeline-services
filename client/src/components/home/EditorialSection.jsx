import Button from '../ui/Button';
import { ArrowRight } from 'lucide-react';

const EditorialSection = () => {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-5xl font-bold text-charcoal mb-6 max-w-5xl mx-auto leading-tight">
            Discover our commitment to{' '}
            <span className="font-serif italic text-primary">sustainable materials</span>,{' '}
            low-impact production, and{' '}
            <span className="font-serif italic text-secondary">mindful partnerships</span>
          </h2>
        </div>

        {/* Image Collage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {/* Large Image */}
          <div className="md:col-span-2 rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 aspect-[16/9]">
            <img 
              src="https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&h=675&fit=crop&q=80" 
              alt="Sustainable production and materials"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Side Images */}
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-beige to-cream aspect-square">
              <img 
                src="/images/natural-kitchen-materials.jpg" 
                alt="Natural kitchen materials"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-accent/30 to-olive/30 aspect-square">
              <img 
                src="https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=600&h=600&fit=crop&q=80" 
                alt="Eco-conscious production process"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            variant="primary" 
            size="lg" 
            className="group"
            onClick={() => {
              const element = document.querySelector('#sustainability');
              element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            Learn About Our Process
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EditorialSection;
