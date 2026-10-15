import SectionTitle from '../ui/SectionTitle';
import ProductGrid from '../product/ProductGrid';
import { useShopData } from '../../context/DataContext';
import { ArrowRight } from 'lucide-react';

const ProductCollection = ({ products }) => {
  const { loading, error, refresh } = useShopData();
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
        {loading && products.length === 0 ? (
          <p className="rounded-3xl border border-line bg-white px-6 py-16 text-center text-muted">Loading products…</p>
        ) : error && products.length === 0 ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-16 text-center">
            <p className="text-lg font-semibold text-red-700">Could not load products</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={refresh}
              className="mt-6 rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-cream hover:bg-primary-dark"
            >
              Try again
            </button>
          </div>
        ) : (
          // NOTE: no id here — Home.jsx already wraps this in <div id="products">.
          // Rendering two elements with id="products" broke
          // document.querySelector('#products') (Hero "Shop now" scroll) and
          // confused scroll-restoration, which could land past the hero.
          <ProductGrid products={featuredProducts} columns={4} />
        )}
      </div>
    </section>
  );
};

export default ProductCollection;
