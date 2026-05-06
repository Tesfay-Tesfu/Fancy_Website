import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { fetchProducts } from '../services/woocommerce'
import { useNavigate } from 'react-router-dom'
import { toggleWishlist, getWishlist } from '../utils/wishlist'

/* ── Skeleton card ─────────────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="shrink-0 w-40 sm:w-52 animate-pulse">
    <div className="aspect-square bg-slate-200 rounded-2xl mb-3" />
    <div className="h-3.5 bg-slate-200 rounded w-3/4 mb-1.5" />
    <div className="h-3 bg-slate-200 rounded w-1/2" />
  </div>
)

/* ── Product slider ────────────────────────────────────────────────────────── */
const ProductSlider = ({ products, title }) => {
  const scrollRef = useRef(null)
  const navigate  = useNavigate()
  const [wishlist,  setWishlist]  = useState(getWishlist())
  const [canLeft,   setCanLeft]   = useState(false)
  const [canRight,  setCanRight]  = useState(true)

  useEffect(() => {
    const sync = () => setWishlist(getWishlist())
    window.addEventListener('wishlist-updated', sync)
    return () => window.removeEventListener('wishlist-updated', sync)
  }, [])

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateScrollState, { passive: true })
    updateScrollState()
    return () => el.removeEventListener('scroll', updateScrollState)
  }, [products, updateScrollState])

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' })
  }

  const handleWishlistToggle = (e, product) => {
    e.stopPropagation()
    toggleWishlist({
      id:    product.id,
      slug:  product.slug,
      name:  product.name,
      price: product.price,
      image: product.images?.[0]?.src || '',
    })
  }

  if (!products.length) return null

  return (
    <div className="mb-8 sm:mb-12">
      {/* Row header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-2xl font-bold text-slate-900">{title}</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/shop')}
            className="text-xs sm:text-sm text-amber-600 font-medium hover:text-amber-700 transition hidden sm:block">
            View All →
          </button>
          <div className="flex gap-1.5">
            <button onClick={() => scroll('left')} disabled={!canLeft}
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center
                text-slate-600 hover:bg-amber-50 hover:border-amber-300 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm">
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => scroll('right')} disabled={!canRight}
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center
                text-slate-600 hover:bg-amber-50 hover:border-amber-300 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <div className={`absolute left-0 top-0 h-full w-8 bg-linear-to-r from-gray-50 to-transparent z-10 pointer-events-none transition-opacity ${canLeft ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`absolute right-0 top-0 h-full w-8 bg-linear-to-l from-gray-50 to-transparent z-10 pointer-events-none transition-opacity ${canRight ? 'opacity-100' : 'opacity-0'}`} />

        <div ref={scrollRef}
          className="flex gap-3 sm:gap-5 overflow-x-auto scroll-smooth pb-2
            [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {products.map((product) => {
            const wishlisted = wishlist.some((w) => w.id === product.id)
            return (
              <div
                key={product.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/products/${product.slug}`)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/products/${product.slug}`)}
                className="shrink-0 w-40 sm:w-52 bg-white rounded-2xl shadow-sm hover:shadow-xl
                  transition-all duration-300 overflow-hidden group text-left relative cursor-pointer"
              >
                {/* Wishlist */}
                <button type="button" onClick={(e) => handleWishlistToggle(e, product)}
                  className={`absolute top-2 right-2 z-10 h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center shadow transition
                    ${wishlisted ? 'bg-pink-500 text-white' : 'bg-white/90 text-slate-400 hover:text-pink-500'}`}>
                  <Heart size={13} fill={wishlisted ? 'currentColor' : 'none'} />
                </button>

                {/* Image */}
                <div className="aspect-square overflow-hidden">
                  {product.images?.[0] ? (
                    <img src={product.images[0].src} alt={product.name} loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-amber-100 to-amber-200 flex items-center justify-center text-3xl sm:text-4xl">
                      🍰
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 sm:p-4">
                  <h4 className="font-semibold text-slate-900 text-xs sm:text-sm mb-1 line-clamp-2">
                    {product.name}
                  </h4>
                  <p className="text-amber-600 font-bold text-sm">
                    ${product.price}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile "View All" */}
      <div className="mt-3 text-center sm:hidden">
        <button onClick={() => navigate('/shop')}
          className="text-xs text-amber-600 font-medium hover:text-amber-700 transition">
          View All →
        </button>
      </div>
    </div>
  )
}

/* ── Main component ────────────────────────────────────────────────────────── */
function FeaturedCakes() {
  const [signatureCakes, setSignatureCakes] = useState([])
  const [occasionCakes,  setOccasionCakes]  = useState([])
  const [themedCakes,    setThemedCakes]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchFeaturedCakes = async () => {
    try {
      setLoading(true)
      const [sigRes, occRes, themeRes] = await Promise.all([
        fetchProducts(1, 10, 'all', [16]),
        fetchProducts(1, 10, 'all', [62]),
        fetchProducts(1, 10, 'all', [63]),
      ])
      setSignatureCakes(sigRes.data)
      setOccasionCakes(occRes.data)
      setThemedCakes(themeRes.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFeaturedCakes() }, [])

  if (loading) {
    return (
      <section className="py-6 sm:py-8 bg-gray-50 rounded-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-6 bg-slate-200 rounded w-40 mb-6 animate-pulse" />
          {[...Array(2)].map((_, row) => (
            <div key={row} className="mb-8">
              <div className="h-5 bg-slate-200 rounded w-32 mb-4 animate-pulse" />
              <div className="flex gap-3 sm:gap-5 overflow-hidden">
                {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-6 sm:py-8 bg-gray-50 rounded-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
            <p className="text-red-700 text-sm mb-3">{error}</p>
            <button onClick={fetchFeaturedCakes}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition">
              Try Again
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-6 sm:py-8 bg-gray-50 rounded-2xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-3xl font-bold text-slate-900">Featured Cakes</h2>
          <p className="text-slate-500 mt-1 text-sm">
            Discover our signature, occasion, and themed cake collections
          </p>
        </div>
        <ProductSlider products={signatureCakes} title="Signature Cakes" />
        <ProductSlider products={occasionCakes}  title="Occasion Cakes" />
        <ProductSlider products={themedCakes}    title="Themed Cakes" />
      </div>
    </section>
  )
}

export default FeaturedCakes
