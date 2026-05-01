import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { getWishlist, removeFromWishlist, toggleWishlist } from '../utils/wishlist'
import { addToCart } from '../utils/cart'

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([])
  const [removingId, setRemovingId] = useState(null)
  const [cartToasts, setCartToasts] = useState({}) // { productId: 'added' | 'exists' }

  const sync = () => setWishlist(getWishlist())

  useEffect(() => {
    sync()
    window.addEventListener('wishlist-updated', sync)
    return () => window.removeEventListener('wishlist-updated', sync)
  }, [])

  const handleRemove = (id) => {
    setRemovingId(id)
    setTimeout(() => {
      removeFromWishlist(id)
      setRemovingId(null)
    }, 300)
  }

  const handleAddToCart = (item) => {
    const result = addToCart({
      name:                  item.name,
      product_id:            item.id,
      variation_id:          null,
      quantity:              1,
      total_price:           parseFloat(item.price) || 0,
      image_url:             item.image,
      permalink:             `/products/${item.slug}`,
      variation_description: '',
    })
    const kind = result.duplicate ? 'exists' : 'added'
    setCartToasts((p) => ({ ...p, [item.id]: kind }))
    setTimeout(() => setCartToasts((p) => { const n = { ...p }; delete n[item.id]; return n }), 2500)
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (wishlist.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-pink-50 flex items-center justify-center">
            <Heart size={40} strokeWidth={1.5} className="text-pink-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Your wishlist is empty</h1>
            <p className="mt-2 text-slate-500">Save your favourite cakes and treats here.</p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-700 transition"
          >
            <ShoppingBag size={16} /> Browse our cakes
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Wishlist</h1>
          <p className="mt-1 text-sm text-slate-500">
            {wishlist.length} saved {wishlist.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <Link
          to="/shop"
          className="flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition"
        >
          <ArrowLeft size={16} /> Continue shopping
        </Link>
      </div>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {wishlist.map((item) => {
          const isRemoving = removingId === item.id
          const toast = cartToasts[item.id]

          return (
            <div
              key={item.id}
              className={`group relative flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden
                transition-all duration-300 ${isRemoving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
            >
              {/* Image */}
              <Link to={`/products/${item.slug}`} className="block overflow-hidden aspect-square">
                <img
                  src={item.image || 'https://via.placeholder.com/300'}
                  alt={item.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </Link>

              {/* Remove button */}
              <button
                onClick={() => handleRemove(item.id)}
                className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center
                  text-slate-400 hover:text-red-500 hover:bg-white shadow transition"
                title="Remove from wishlist"
              >
                <Trash2 size={14} />
              </button>

              {/* Heart badge */}
              <div className="absolute top-3 left-3 h-8 w-8 rounded-full bg-pink-500 flex items-center justify-center shadow">
                <Heart size={14} fill="white" className="text-white" />
              </div>

              {/* Info */}
              <div className="flex flex-col flex-1 p-4 gap-3">
                <div className="flex-1">
                  <Link
                    to={`/products/${item.slug}`}
                    className="text-sm font-semibold text-slate-900 hover:text-amber-600 transition line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 text-base font-bold text-amber-600">
                    {item.price && !isNaN(parseFloat(item.price)) ? `$${parseFloat(item.price).toFixed(2)}` : 'Price varies'}
                  </p>
                </div>

                {/* Cart toast */}
                {toast && (
                  <div className={`rounded-lg px-3 py-2 text-xs font-medium text-center
                    ${toast === 'added' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    {toast === 'added' ? '✓ Added to cart' : 'Already in cart'}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {item.price && !isNaN(parseFloat(item.price)) && parseFloat(item.price) > 0 ? (
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 rounded-full bg-amber-600 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition"
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <Link
                      to={`/products/${item.slug}`}
                      className="flex-1 rounded-full bg-amber-600 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition text-center"
                    >
                      Select Options
                    </Link>
                  )}
                  <Link
                    to={`/products/${item.slug}`}
                    className="flex-1 rounded-full border border-slate-200 py-2 text-xs font-semibold text-slate-700
                      hover:bg-slate-50 transition text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
