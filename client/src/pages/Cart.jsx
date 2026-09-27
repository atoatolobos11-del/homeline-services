import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useCart } from '../hooks/useCart'
import { formatPeso } from '../utils/stock'

const sizeOptions = ['Small', 'Medium', 'Large']

export default function Cart() {
  const { cartItems, cartTotal, cartCount, updateQuantity, removeFromCart, updateItemVariant, clearCart } = useCart()

  if (!cartItems.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-32 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-primary/40" />
        <h1 className="mt-4 text-3xl font-bold text-charcoal">Your cart is empty</h1>
        <p className="mt-3 text-muted">Add a few planet-friendly pieces to get started.</p>
        <Button as={Link} to="/shop" className="mt-8">
          Continue shopping
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-charcoal">Shopping Cart</h1>
      <p className="mt-1 text-sm text-muted">
        {cartCount} item{cartCount !== 1 ? 's' : ''} — tap the color/size or quantity to customize like a shopee app.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        {/* ---- Item list ---- */}
        <div className="space-y-4">
          {cartItems.map((item) => {
            const colors = item.colors?.length ? item.colors : []
            const color = item.selectedColor || colors[0] || 'Natural'
            const size = item.selectedSize || 'Medium'
            const maxStock = Math.max(1, Number(item.stock) || 1)
            const lowStock = Number(item.stock) > 0 && Number(item.stock) <= item.reorderLevel

            return (
              <div key={item.id} className="rounded-[24px] border border-beige bg-white p-4 shadow-sm sm:p-5">
                <div className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-24 w-24 shrink-0 rounded-2xl border border-beige bg-cream object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted">{item.category}</p>
                        <h3 className="mt-0.5 truncate font-semibold text-charcoal">{item.name}</h3>
                        {lowStock && (
                          <p className="mt-1 text-xs font-medium text-amber-700">Only {item.stock} left</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="shrink-0 rounded-full p-2 text-muted transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-2 text-[15px] font-bold text-primary">{formatPeso(item.price)}</p>
                  </div>
                </div>

                {/* Variant editing — Shopee style */}
                {colors.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="mr-1 text-xs font-semibold text-muted">Color:</span>
                    {colors.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateItemVariant(item.id, { color: option })}
                        aria-pressed={color === option}
                        className={`rounded-full border px-3 py-1 text-xs capitalize transition-all ${
                          color === option
                            ? 'border-primary bg-primary text-white shadow-md ring-2 ring-primary/25'
                            : 'border-beige bg-cream text-charcoal hover:-translate-y-0.5 hover:border-primary hover:shadow-sm active:scale-95'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-xs font-semibold text-muted">Size:</span>
                  {sizeOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => updateItemVariant(item.id, { size: option })}
                      aria-pressed={size === option}
                      className={`rounded-full border px-3 py-1 text-xs capitalize transition-all ${
                        size === option
                          ? 'border-primary bg-primary text-white shadow-md ring-2 ring-primary/25'
                          : 'border-beige bg-cream text-charcoal hover:-translate-y-0.5 hover:border-primary hover:shadow-sm active:scale-95'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {/* Quantity + line total */}
                <div className="mt-4 flex items-center justify-between border-t border-beige pt-4">
                  <div className="flex items-center gap-1 rounded-full border border-beige bg-cream px-1 py-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                      className="rounded-full p-2 text-primary transition hover:bg-white active:scale-95 disabled:pointer-events-none disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-charcoal">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= maxStock}
                      aria-label="Increase quantity"
                      className="rounded-full p-2 text-primary transition hover:bg-white active:scale-95 disabled:pointer-events-none disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-muted">Subtotal</p>
                    <p className="text-lg font-bold text-primary">{formatPeso(item.price * item.quantity)}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ---- Order summary ---- */}
        <aside className="rounded-[28px] bg-[#efe9e1] p-6 shadow-sm ring-1 ring-[#d8d0c4] lg:sticky lg:top-28">
          <h2 className="text-xl font-semibold text-charcoal">Order Summary</h2>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Items ({cartCount})</span>
              <span className="font-semibold text-charcoal">{formatPeso(cartTotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Shipping</span>
              <span className="font-semibold text-charcoal">Choose at checkout</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Gift wrap & tax</span>
              <span className="font-semibold text-charcoal">Choose at checkout</span>
            </div>
            <div className="flex items-center justify-between border-t border-[#d8d0c4] pt-3 text-base">
              <span className="font-semibold text-[#1f2d2a]">Total</span>
              <span className="text-xl font-bold text-primary">{formatPeso(cartTotal)}</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Button as={Link} to="/checkout" className="w-full rounded-full px-5 py-4 text-lg font-semibold">
              Proceed to Checkout
            </Button>
            <Button
              as={Link}
              to="/shop"
              variant="outline"
              className="w-full rounded-full px-5 py-4 text-lg font-semibold"
            >
              Continue shopping
            </Button>
            <button
              type="button"
              onClick={clearCart}
              className="w-full rounded-full border border-[#f2a6a6] bg-transparent px-5 py-3 text-lg font-semibold text-[#d85656] transition hover:bg-[#fff1f1]"
            >
              Clear cart
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}