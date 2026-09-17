import { Link } from 'react-router-dom';
import ProductGrid from '../components/product/ProductGrid';
import { products } from '../data/products';

const BestsellersPage = () => {
  const bestsellers = products.filter((product) => product.bestSeller);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Best sellers</p>
        <h1 className="mt-3 text-4xl font-bold text-charcoal">Customer favorites</h1>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        <Link
          to="/"
          className="rounded-full border border-beige bg-white px-4 py-2 text-sm font-medium text-charcoal transition hover:border-primary hover:text-primary"
        >
          Home
        </Link>
      </div>

      <ProductGrid products={bestsellers} />
    </div>
  );
};

export default BestsellersPage;
