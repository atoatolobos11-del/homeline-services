import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const apiBase = import.meta.env.VITE_API_URL || '/api'

  // Instant-first: seed from the last good response so the grid paints
  // immediately, then revalidate in the background. Without this every
  // reload stared at a spinner until Supabase (Nano cold-start included)
  // answered.
  const readCache = (key) => {
    try {
      const raw = localStorage.getItem(key)
      const parsed = raw ? JSON.parse(raw) : null
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  const writeCache = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage full or blocked — catalog still works, just uncached */
    }
  }

  // Live data only — no hardcoded fallback. Products/categories come
  // exclusively from the API (which is backed by Supabase in production).
  const [products, setProducts] = useState(() => readCache('homeline-products'))
  const [categories, setCategories] = useState(() => readCache('homeline-categories'))
  const [reviewSummary, setReviewSummary] = useState(() => {
    try {
      const raw = localStorage.getItem('homeline-review-summary')
      const parsed = raw ? JSON.parse(raw) : null
      return parsed && typeof parsed === 'object' ? parsed : {}
    } catch {
      return {}
    }
  })
  const [source, setSource] = useState(null)
  const [loading, setLoading] = useState(() => readCache('homeline-products').length === 0)
  const [error, setError] = useState(null)
  const hasLoaded = useRef(false)

  const load = useCallback(async () => {
    if (!hasLoaded.current) setLoading(true)
    setError(null)
    try {
      // Fetch independently: a categories failure must not blank the products.
      // The review summary rides along as one extra request (not one per card).
      const [productsResult, categoriesResult, reviewsResult] = await Promise.allSettled([
        fetch(`${apiBase}/products`),
        fetch(`${apiBase}/categories`),
        fetch(`${apiBase}/reviews/summary`),
      ])

      let productError = null
      let categoryError = null

      if (productsResult.status === 'fulfilled' && productsResult.value.ok) {
        const body = await productsResult.value.json().catch(() => null)
        if (Array.isArray(body)) {
          setProducts(body)
          writeCache('homeline-products', body)
        } else {
          productError = body?.error || 'Products response was not a list'
        }
      } else if (productsResult.status === 'fulfilled') {
        const body = await productsResult.value.json().catch(() => ({}))
        productError = body?.error || `Products API responded ${productsResult.value.status}`
      } else {
        productError = productsResult.reason?.message || 'Could not reach the products API'
      }

      if (categoriesResult.status === 'fulfilled' && categoriesResult.value.ok) {
        const body = await categoriesResult.value.json().catch(() => null)
        if (Array.isArray(body)) {
          setCategories(body)
          writeCache('homeline-categories', body)
        } else {
          categoryError = body?.error || 'Categories response was not a list'
        }
      } else if (categoriesResult.status === 'fulfilled') {
        const body = await categoriesResult.value.json().catch(() => ({}))
        categoryError = body?.error || `Categories API responded ${categoriesResult.value.status}`
      } else {
        categoryError = categoriesResult.reason?.message || 'Could not reach the categories API'
      }

      // Review ratings are nice-to-have: a failure here must never blank the shop.
      if (reviewsResult.status === 'fulfilled' && reviewsResult.value.ok) {
        const body = await reviewsResult.value.json().catch(() => null)
        if (body && typeof body === 'object') {
          setReviewSummary(body)
          writeCache('homeline-review-summary', body)
        }
      }

      if (productError) {
        // Keep previous products (if any) rather than blanking the shop.
        if (!hasLoaded.current) setError(productError)
      } else {
        setError(null)
      }
      if (!productError) {
        setSource('supabase')
        hasLoaded.current = true
      }
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
    () => ({ products, categories, reviewSummary, source, loading, error, refresh: load }),
    [products, categories, reviewSummary, source, loading, error, load],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useShopData() {
  return useContext(DataContext)
}