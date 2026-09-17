import { Leaf, Recycle, Heart, Sprout } from 'lucide-react';

const SustainabilitySection = () => {
  const cards = [
    {
      icon: Leaf,
      title: 'Natural Materials',
      description: 'Bamboo, ceramic, and sustainably sourced wood'
    },
    {
      icon: Recycle,
      title: 'Low-Waste Living',
      description: 'Reusable designs that reduce single-use plastics'
    },
    {
      icon: Sprout,
      title: 'Sustainable Cooking',
      description: 'Energy-efficient and eco-conscious cookware'
    },
    {
      icon: Heart,
      title: 'Conscious Choices',
      description: 'Every product supports a healthier planet'
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-5xl font-bold text-charcoal mb-4 max-w-4xl mx-auto leading-tight">
            Thoughtful, <span className="font-serif italic text-primary">Planet-Prioritizing</span> Ideas and Inspiration
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Our commitment to sustainability goes beyond products—it's a way of life
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Large Featured Image */}
          <div className="lg:col-span-2 rounded-3xl overflow-hidden bg-gradient-to-br from-secondary to-accent aspect-[16/9] lg:aspect-[16/10]">
            <img 
              src="https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=1200&h=700&fit=crop&q=80" 
              alt="Sustainable living and natural materials"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Small Images Stack */}
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-beige to-cream aspect-square">
              <img 
                src="https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=600&h=600&fit=crop&q=80" 
                alt="Natural bamboo materials"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-accent/30 to-olive/30 aspect-square">
              <img 
                src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=600&fit=crop&q=80" 
                alt="Eco-friendly kitchen products"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-charcoal mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-muted">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SustainabilitySection;
