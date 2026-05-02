import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ShoppingCart } from 'lucide-react'
import { getCart, removeFromCart, updateCartQuantity, clearCart } from '../utils/cart'
import usePageTitle from '../hooks/usePageTitle'

function Cart() {
  usePageTitle('Your Cart')
  const navigate = useNavigate()
  const [cart, setCart] = useState([])
  const [removingId, setRemovingId] = useState(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Sync cart state from localStorage
  const syncCart = () => setCart(getCart())

  useEffect(() => {
    syncCart()
    window.addEventListener('cart-updated', syncCart)
    return () => window.removeEventListener('cart-updated', syncCart)
  }, [])

  const handleRemove = (id) => {
    setRemovingId(id)
    setTimeout(() => {
      removeFromCart(id)
      setRemovingId(null)
    }, 300)
  }

  const handleQuantityChange = (id, delta) => {
    const item = cart.find((i) => i.id === id)
    if (!item) return
    const newQty = item.quantity + delta
    if (newQty < 1) return
    updateCartQuantity(id, newQty)
  }

  const handleClearCart = () => {
    clearCart()
    setShowClearConfirm(false)
  }

  // Totals
  const subtotal = cart.reduce((sum, item) => sum + item.total_price * item.quantity, 0)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Parse variation description into key-value pairs for display
  const parseVariationDescription = (desc) => {
    if (!desc) return []
    return desc.split(' | ').map((part) => {
      const colonIdx = part.indexOf(':')
      if (colonIdx === -1) return { key: part, value: '' }
      return {
        key: part.slice(0, colonIdx).trim(),
        value: part.slice(colonIdx + 1).trim(),
      }
    })
  }

  // Empty cart
  if (cart.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-20 sm:px-8 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-50">
            <ShoppingCart size={40} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Your cart is empty</h1>
            <p className="mt-2 text-slate-500">Looks like you haven't added anything yet.</p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-700 transition"
          >
            <ShoppingBag size={16} />
            Browse our cakes
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Cart</h1>
          <p className="mt-1 text-sm text-slate-500">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>
        <Link
          to="/shop"
          className="flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition"
        >
          <ArrowLeft size={16} />
          Continue shopping
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

        {/* CART ITEMS */}
        <div className="space-y-4">

          {/* Clear cart */}
          <div className="flex justify-end">
            {showClearConfirm ? (
              <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm">
                <span className="text-red-700 font-medium">Clear all items?</span>
                <button
                  onClick={handleClearCart}
                  className="rounded-lg bg-red-600 px-3 py-1 text-white font-semibold hover:bg-red-700 transition"
                >
                  Yes, clear
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="rounded-lg border border-slate-300 px-3 py-1 text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-500 transition"
              >
                <Trash2 size={14} />
                Clear cart
              </button>
            )}
          </div>

          {/* Items list */}
          {cart.map((item) => {
            const varParts = parseVariationDescription(item.variation_description)
            const isRemoving = removingId === item.id

            return (
              <div
                key={item.id}
                className={`flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300
                  ${isRemoving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
              >
                {/* Product image */}
                <Link to={item.permalink} className="shrink-0">
                  <img
                    src={item.image_url || 'https://via.placeholder.com/100'}
                    alt={item.name}
                    className="h-24 w-24 rounded-xl object-cover border border-slate-100"
                  />
                </Link>

                {/* Details */}
                <div className="flex flex-1 flex-col gap-2 min-w-0">

                  {/* Name + remove */}
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={item.permalink}
                      className="text-base font-semibold text-slate-900 hover:text-amber-600 transition line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Variation description */}
                  {varParts.length > 0 && (
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {varParts.map((part, i) => (
                        <span key={i} className="text-xs text-slate-500">
                          <span className="font-medium text-slate-600">{part.key}:</span>{' '}
                          {part.value}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quantity + price row */}
                  <div className="mt-auto flex items-center justify-between gap-4 flex-wrap">

                    {/* Quantity stepper */}
                    <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1 py-1">
                      <button
                        onClick={() => handleQuantityChange(item.id, -1)}
                        disabled={item.quantity <= 1}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 hover:bg-white hover:shadow-sm transition disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 hover:bg-white hover:shadow-sm transition"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Line total */}
                    <div className="text-right">
                      <p className="text-base font-bold text-slate-900">
                        £{(item.total_price * item.quantity).toFixed(2)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-slate-400">
                          £{parseFloat(item.total_price).toFixed(2)} each
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ORDER SUMMARY */}
        <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24 space-y-5">

          <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>

          {/* Line items */}
          <div className="space-y-3 border-b border-slate-100 pb-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-2 text-sm">
                <span className="text-slate-600 line-clamp-1 flex-1">
                  {item.name}
                  {item.quantity > 1 && (
                    <span className="ml-1 text-slate-400">×{item.quantity}</span>
                  )}
                </span>
                <span className="shrink-0 font-medium text-slate-800">
                  £{(item.total_price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Subtotal */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-semibold text-slate-800">£{subtotal.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Delivery</span>
            <span className="text-green-600 font-medium">Calculated at checkout</span>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3">
            <span className="font-bold text-slate-900">Total</span>
            <span className="text-xl font-bold text-amber-700">£{subtotal.toFixed(2)}</span>
          </div>

          {/* Checkout button */}
          <button
            onClick={() => navigate('/checkout')}
            className="w-full rounded-full bg-amber-600 py-3 text-sm font-bold text-white hover:bg-amber-700 transition shadow-sm">
            Proceed to Checkout
          </button>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs text-slate-400">
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg">🔒</span>
              Secure checkout
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg">🎂</span>
              Fresh baked
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg">🚚</span>
              Fast delivery
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Cart
