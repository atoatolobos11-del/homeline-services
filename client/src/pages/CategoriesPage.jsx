import { Link } from 'react-router-dom';
import { useShopData } from '../context/DataContext';

const CategoriesPage = () => {
  const { categories } = useShopData();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Collections</p>
        <h1 className="mt-3 text-4xl font-bold text-charcoal">Browse by category</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <div key={category.name} className="rounded-3xl border border-beige bg-white p-6 shadow-sm">
            <div className="mb-4 h-48 overflow-hidden rounded-2xl bg-cream">
              <img
                src={category.image}
                alt={category.name}
                className="h-full w-full object-cover"
              />
            </div>
            <h2 className="text-2xl font-bold text-charcoal">{category.name}</h2>
            <p className="mt-2 text-muted">{category.description}</p>
            <Link
              to="/shop"
              className="mt-5 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-lg active:scale-95 group-hover:translate-y-0"
            >
              Explore collection
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
