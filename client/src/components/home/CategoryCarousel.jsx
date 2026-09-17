import { categories } from '../../data/products';
import { ArrowRight } from 'lucide-react';

const CategoryCarousel = () => {
  const handleCategoryClick = (e, slug) => {
    e.preventDefault();
    const element = document.querySelector('#products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-charcoal mb-2">
            Explore Categories
          </h2>
          <p className="text-muted">Discover products by lifestyle</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={(e) => handleCategoryClick(e, category.slug)}
              className="group block text-left w-full"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-beige to-cream mb-3 group-hover:shadow-lg transition-all duration-300">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300 flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 drop-shadow-lg" />
                </div>
              </div>
              
              <h3 className="text-sm font-semibold text-charcoal text-center group-hover:text-primary transition-colors mb-1">
                {category.name}
              </h3>
              <p className="text-xs text-muted text-center leading-relaxed">
                {category.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryCarousel;
