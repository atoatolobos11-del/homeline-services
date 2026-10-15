import { Link } from 'react-router-dom';
import ProductGrid from '../components/product/ProductGrid';
import { useShopData } from '../context/DataContext';

const BestsellersPage = () => {
  const { products, loading, error, refresh } = useShopData();
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
          className="rounded-full border border-primary px-4 py-2 text-sm font-medium text-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary hover:text-white hover:shadow-sm active:scale-95"
        >
          Home
        </Link>
      </div>

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
        <ProductGrid products={bestsellers} />
      )}
    </div>
  );
};

export default BestsellersPage;
