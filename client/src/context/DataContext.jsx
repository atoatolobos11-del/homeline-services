import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  products as localProducts,
  categories as localCategories,
} from '../data/products'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const apiBase = import.meta.env.VITE_API_URL || '/api'

  // Start with local data so the UI is instantly usable; swap to Supabase
  // data as soon as the API responds. If the API is unreachable, the local
  // catalog stays in place so the site never breaks.
  const [products, setProducts] = useState(localProducts)
  const [categories, setCategories] = useState(localCategories)
  const [source, setSource] = useState('local')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch(`${apiBase}/products`),
          fetch(`${apiBase}/categories`),
        ])
        if (!productsResponse.ok || !categoriesResponse.ok) {
          throw new Error('API unavailable')
        }
        const [apiProducts, apiCategories] = await Promise.all([
          productsResponse.json(),
          categoriesResponse.json(),
        ])
        if (!cancelled) {
          setProducts(apiProducts)
          setCategories(apiCategories)
          setSource('supabase')
        }
      } catch {
        // Keep the local fallback data.
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [apiBase])

  const value = useMemo(
    () => ({ products, categories, source, loading }),
    [products, categories, source, loading],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useShopData() {
  return useContext(DataContext)
}