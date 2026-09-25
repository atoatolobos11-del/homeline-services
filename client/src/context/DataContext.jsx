import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

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
  const hasLoaded = useRef(false)

  const load = useCallback(async () => {
    if (!hasLoaded.current) setLoading(true)
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
      setProducts(apiProducts)
      setCategories(apiCategories)
      setSource('supabase')
      hasLoaded.current = true
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [apiBase])

  useEffect(() => {
    load()
  }, [load])

  const value = useMemo(
    () => ({ products, categories, source, loading, error, refresh: load }),
    [products, categories, source, loading, error, load],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useShopData() {
  return useContext(DataContext)
}