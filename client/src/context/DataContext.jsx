import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const apiBase = import.meta.env.VITE_API_URL || '/api'

  // Live data only — no hardcoded fallback. Products/categories come
  // exclusively from the API (which is backed by Supabase in production).
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [source, setSource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch(`${apiBase}/products`),
          fetch(`${apiBase}/categories`),
        ])
        if (!productsResponse.ok || !categoriesResponse.ok) {
          throw new Error(`API responded ${productsResponse.status}/${categoriesResponse.status}`)
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
      } catch (err) {
        if (!cancelled) setError(err.message)
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
    () => ({ products, categories, source, loading, error }),
    [products, categories, source, loading, error],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useShopData() {
  return useContext(DataContext)
}