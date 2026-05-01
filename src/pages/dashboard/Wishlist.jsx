import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import { Heart, Trash2, ShoppingBag } from 'lucide-react'
import { getWishlist, removeFromWishlist } from '../../utils/wishlist'

function WishlistContent() {
  const [wishlist, setWishlist] = useState([])

  useEffect(() => {
    const sync = () => setWishlist(getWishlist())
    sync()
    window.addEventListener('wishlist-updated', sync)
    return () => window.removeEventListener('wishlist-updated', sync)
  }, [])

  if (wishlist.length === 0) {
    return (
      <>
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900">Wishlist</h1>
          <p className="text-sm text-slate-500 mt-1">Products you've saved for later.</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <div className="h-20 w-20 rounded-full bg-pink-50 flex items-center justify-center mb-4">
            <Heart size={36} strokeWidth={1.5} className="text-pink-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Your wishlist is empty</h3>
          <p className="text-slate-400 mt-2 max-w-sm text-sm">
            Save your favourite cakes and treats here so you can find them easily later.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition"
          >
            <ShoppingBag size={15} /> Explore products
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Wishlist</h1>
          <p className="text-sm text-slate-500 mt-1">{wishlist.length} saved {wishlist.length === 1 ? 'item' : 'items'}</p>
        </div>
        <Link to="/wishlist" className="text-sm font-medium text-amber-600 hover:text-amber-700 transition">
          View full wishlist →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {wishlist.map((item) => (
          <div key={item.id} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <Link to={`/products/${item.slug}`} className="shrink-0">
              <img
                src={item.image || 'https://via.placeholder.com/64'}
                alt={item.name}
                className="h-16 w-16 rounded-xl object-cover border border-slate-100"
              />
            </Link>
            <div className="flex flex-1 flex-col justify-between min-w-0">
              <Link
                to={`/products/${item.slug}`}
                className="text-sm font-semibold text-slate-800 hover:text-amber-600 transition line-clamp-2"
              >
                {item.name}
              </Link>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm font-bold text-amber-600">
                  {item.price && !isNaN(parseFloat(item.price)) ? `$${parseFloat(item.price).toFixed(2)}` : '—'}
                </p>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="text-slate-300 hover:text-red-500 transition"
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default function Wishlist() {
  return <DashboardLayout>{() => <WishlistContent />}</DashboardLayout>
}
