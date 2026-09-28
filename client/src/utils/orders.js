const apiBase = import.meta.env.VITE_API_URL || '/api';

// Look up a single order by its order number (e.g. HML-20260928-1234).
export const fetchOrder = async (orderNumber) => {
  const res = await fetch(`${apiBase}/orders/${encodeURIComponent(orderNumber)}`)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || 'Order not found')
  return body
}

// Cancel an order — the server restores stock and marks it as cancelled.
export const cancelOrder = async (orderNumber) => {
  const res = await fetch(`${apiBase}/orders/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderNumber }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || 'Could not cancel the order')
  return body
}