import { Minus, Plus, Trash2, Truck, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useCart } from '../hooks/useCart'

export default function Cart() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart()

  const shippingFee = cartItems.length ? 45 : 0
  const total = cartTotal + shippingFee

  if (!cartItems.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-32 text-center">
        <h1 className="font-display text-4xl">Your bag is empty</h1>
        <p className="mt-3 text-muted">Add a few planet-friendly pieces to get started.</p>
        <Button as={Link} to="/shop" className="mt-8">
          Continue shopping
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md rounded-[28px] bg-[#efe9e1] p-6 shadow-sm ring-1 ring-[#d8d0c4]">
        <div className="flex items-center justify-between text-2xl font-semibold text-[#1f2d2a]">
          <span>Total</span>
          <span className="text-[#0d5d4b]">₱{total.toFixed(2)}</span>
        </div>

        <div className="mt-6 space-y-4">
          <Button
            as={Link}
            to="/checkout"
            className="w-full rounded-full bg-[#0f3d35] px-5 py-4 text-lg font-semibold text-white hover:bg-[#0d352d]"
          >
            Proceed to Checkout
          </Button>

          <Button
            as={Link}
            to="/shop"
            variant="outline"
            className="w-full rounded-full border border-[#0f3d35] bg-white px-5 py-4 text-lg font-semibold text-[#0f3d35] hover:bg-[#0f3d35] hover:text-white"
          >
            Continue shopping
          </Button>

          <button
            type="button"
            className="w-full rounded-full border border-[#f2a6a6] bg-transparent px-5 py-3 text-lg font-semibold text-[#d85656] transition hover:bg-[#fff1f1]"
            onClick={clearCart}
          >
            Clear cart
          </button>
        </div>
      </div>
    </div>
  )
}
