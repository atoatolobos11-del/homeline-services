// Inventory helpers shared across the storefront and the dashboard.
// Products at or below their reorder level are flagged as "low stock".
export const LOW_STOCK_THRESHOLD = 5
export const DEFAULT_REORDER_LEVEL = 3

export const getStockStatus = (stock, reorderLevel = DEFAULT_REORDER_LEVEL) => {
  if (stock <= 0) return 'out'
  if (stock <= reorderLevel) return 'low'
  return 'in'
}

export const stockStatusLabel = (status) => {
  if (status === 'out') return 'Out of Stock'
  if (status === 'low') return 'Low Stock'
  return 'In Stock'
}

export const formatPeso = (value) =>
  `₱${Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const formatDateTime = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}