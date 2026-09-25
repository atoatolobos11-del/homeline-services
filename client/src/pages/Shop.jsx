import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductGrid from '../components/product/ProductGrid'
import { useShopData } from '../context/DataContext'

export default function Shop() {
  const { products } = useShopData()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') || '')
  const selectedCategory = params.get('category') || 'All'
  const filter = params.get('filter') || 'all'

  const categoryOptions = useMemo(
    () => ['All', ...new Set(products.map((item) => item.category))],
    [products],
  )

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase())
      const matchesCategory =
        selectedCategory === 'All' ||
        product.category === selectedCategory ||
        (selectedCategory === 'Coffee & Drinkware' && product.category === 'Drinkware') ||
        (selectedCategory === 'Natural Materials' &&
          product.category === 'Natural Materials')
      const matchesFilter =
        filter === 'all' ||
        (filter === 'bestsellers' && product.bestSeller) ||
        (filter === 'new' && product.newArrival)
      return matchesQuery && matchesCategory && matchesFilter
    })
  }, [products, query, selectedCategory, filter])

  function setCategory(category) {
    const next = new URLSearchParams(params)
    if (category === 'All') next.delete('category')
    else next.set('category', category)
    setParams(next)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Shop</p>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl">Kitchenware</h1>
      <p className="mt-4 max-w-xl text-muted">
        Browse eco essentials — filter by collection, search by name, and add
        pieces to your bag.
      </p>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setCategory(category)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                selectedCategory === category
                  ? 'bg-forest text-cream'
                  : 'border border-line bg-white hover:border-forest/40'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <label className="sr-only" htmlFor="shop-search">
          Filter products
        </label>
        <input
          id="shop-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products"
          className="w-full max-w-xs rounded-full border border-line bg-white px-4 py-2.5 text-sm"
        />
      </div>

      <p className="mt-8 text-sm text-muted">{filtered.length} pieces</p>
      {filtered.length > 0 ? (
        <ProductGrid products={filtered} id="products" className="mt-4 scroll-mt-28" />
      ) : (
        <div id="products" className="mt-4 scroll-mt-28 rounded-3xl border border-dashed border-line bg-white px-6 py-16 text-center">
          <p className="text-lg font-semibold text-forest">No products found</p>
          <p className="mt-2 text-sm text-muted">Try another category or clear your search.</p>
          <button
            type="button"
            onClick={() => {
              setCategory('All')
              setQuery('')
            }}
            className="mt-6 rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-cream transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            Show all products
          </button>
        </div>
      )}
    </div>
  )
}
