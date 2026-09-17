import SectionTitle from '../ui/SectionTitle';
import ProductGrid from '../product/ProductGrid';
import { ArrowRight } from 'lucide-react';

const ProductCollection = ({ products }) => {
  const featuredProducts = products.filter(p => p.featured);

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block">
            <p className="text-secondary text-sm uppercase tracking-wider mb-2">
              Eco Essentials
            </p>
            <SectionTitle className="text-charcoal">
              Planet-Friendly
            </SectionTitle>
            <div className="flex items-center justify-center gap-2 mt-2">
              <SectionTitle serif className="text-primary italic">
                Best Selling
              </SectionTitle>
              <ArrowRight className="w-8 h-8 text-primary" />
              <span className="text-lg font-semibold text-charcoal">Products</span>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <ProductGrid products={featuredProducts} columns={4} id="products" />
      </div>
    </section>
  );
};

export default ProductCollection;
