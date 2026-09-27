import { useEffect, useState } from 'react'

// Returns a value that only updates `delay` ms after the last change.
// Use it so search/filter logic doesn't run on every single keystroke.
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

export default useDebounce