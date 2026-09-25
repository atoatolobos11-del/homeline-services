// Inventory helpers shared across the storefront and the dashboard.
// Products with stock at or below this number are shown as "low stock".
export const LOW_STOCK_THRESHOLD = 5

export const getStockStatus = (stock) => {
  if (stock <= 0) return 'out'
  if (stock <= LOW_STOCK_THRESHOLD) return 'low'
  return 'in'
}

export const stockStatusLabel = (status) => {
  if (status === 'out') return 'Out of Stock'
  if (status === 'low') return 'Low Stock'
  return 'In Stock'
}