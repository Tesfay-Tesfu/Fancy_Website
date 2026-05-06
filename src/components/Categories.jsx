import { useState, useEffect, useRef } from 'react'
import { endpoints, getAuthHeaders } from '../services/woocommerce'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/* ── Category card ─────────────────────────────────────────────────────────── */
const CategoryCard = ({ category, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(category)}
    className="shrink-0 w-36 sm:w-44 md:w-48 bg-white rounded-2xl shadow-sm hover:shadow-lg
      transition-all duration-300 cursor-pointer group overflow-hidden text-left"
  >
    {/* Image */}
    <div className="relative aspect-square overflow-hidden">
      {category.image ? (
        <img
          src={category.image.src}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-linear-to-br from-amber-100 to-amber-200 flex items-center justify-center text-4xl">
          🍞
        </div>
      )}
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
        <span className="bg-white text-black px-3 py-1.5 rounded-full text-xs font-semibold shadow">
          Shop Now
        </span>
      </div>
    </div>

    {/* Label */}
    <div className="p-3 text-center">
      <h3 className="font-semibold text-slate-900 text-sm leading-tight line-clamp-2">
        {category.name}
      </h3>
      <p className="text-xs text-slate-500 mt-0.5">{category.count} items</p>
    </div>
  </button>
)

/* ── Skeleton card ─────────────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="shrink-0 w-36 sm:w-44 md:w-48 animate-pulse">
    <div className="aspect-square bg-slate-200 rounded-2xl mb-3" />
    <div className="h-3.5 bg-slate-200 rounded w-3/4 mx-auto mb-1.5" />
    <div className="h-3 bg-slate-200 rounded w-1/2 mx-auto" />
  </div>
)

/* ── Main component ────────────────────────────────────────────────────────── */
function Categories() {
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [canLeft,    setCanLeft]    = useState(false)
  const [canRight,   setCanRight]   = useState(true)
  const navigate  = useNavigate()
  const scrollRef = useRef(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(endpoints.categories, { headers: getAuthHeaders() })
      if (!res.ok) throw new Error('Failed to fetch categories')
      setCategories(await res.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const updateScrollState = () => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateScrollState, { passive: true })
    updateScrollState()
    return () => el.removeEventListener('scroll', updateScrollState)
  }, [categories])

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' })
  }

  return (
    <section className="py-6 sm:py-8 bg-gray-50 rounded-2xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-5 sm:mb-7">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">
              Shop by Category
            </h2>
            <p className="text-slate-500 mt-0.5 text-sm">
              Discover our fresh bakery collections
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/shop')}
              className="text-sm text-amber-600 font-medium hover:text-amber-700 transition hidden sm:block"
            >
              View All →
            </button>
            {/* Arrow buttons */}
            <div className="flex gap-1.5">
              <button
                onClick={() => scroll('left')}
                disabled={!canLeft}
                className="h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center
                  text-slate-600 hover:bg-amber-50 hover:border-amber-300 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canRight}
                className="h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center
                  text-slate-600 hover:bg-amber-50 hover:border-amber-300 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
            <p className="text-red-700 text-sm mb-3">{error}</p>
            <button onClick={fetchCategories}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition">
              Try Again
            </button>
          </div>
        )}

        {/* Slider — works on all screen sizes */}
        {!error && (
          <div className="relative">
            {/* Left fade */}
            <div className={`absolute left-0 top-0 h-full w-8 bg-linear-to-r from-gray-50 to-transparent z-10 pointer-events-none transition-opacity ${canLeft ? 'opacity-100' : 'opacity-0'}`} />
            {/* Right fade */}
            <div className={`absolute right-0 top-0 h-full w-8 bg-linear-to-l from-gray-50 to-transparent z-10 pointer-events-none transition-opacity ${canRight ? 'opacity-100' : 'opacity-0'}`} />

            <div
              ref={scrollRef}
              className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth pb-2
                [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {loading
                ? [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
                : categories.map((cat) => (
                    <CategoryCard key={cat.id} category={cat} onClick={(c) => navigate(`/shop?category=${c.slug}`)} />
                  ))
              }
            </div>
          </div>
        )}

        {/* Mobile "View All" link */}
        {!loading && !error && (
          <div className="mt-4 text-center sm:hidden">
            <button onClick={() => navigate('/shop')}
              className="text-sm text-amber-600 font-medium hover:text-amber-700 transition">
              View All Categories →
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default Categories
