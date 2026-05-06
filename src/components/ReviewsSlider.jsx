import { useEffect, useRef, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react'
import { Link } from 'react-router-dom'
import { fetchAllReviews } from '../services/woocommerce'

// ── Relative time helper ──────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr + 'Z')) / 1000)
  if (diff < 60)           return 'just now'
  if (diff < 3600)         return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400)        return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`
  if (diff < 7 * 86400)   return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`
  if (diff < 30 * 86400)  return `${Math.floor(diff / 604800)} week${Math.floor(diff / 604800) > 1 ? 's' : ''} ago`
  if (diff < 365 * 86400) return `${Math.floor(diff / 2592000)} month${Math.floor(diff / 2592000) > 1 ? 's' : ''} ago`
  return `${Math.floor(diff / 31536000)} year${Math.floor(diff / 31536000) > 1 ? 's' : ''} ago`
}

// ── Strip HTML tags from review text ─────────────────────────────────────────
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').trim()
}

// ── Star rating display ───────────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          fill={s <= rating ? '#f59e0b' : 'none'}
          className={s <= rating ? 'text-amber-500' : 'text-slate-200'}
        />
      ))}
    </div>
  )
}

// ── Single review card ────────────────────────────────────────────────────────
function ReviewCard({ review }) {
  const avatar = review.reviewer_avatar_urls?.['48']
  const initial = review.reviewer?.[0]?.toUpperCase() || '?'
  const text = stripHtml(review.review)

  // Extract slug from product_permalink
  const slug = review.product_permalink
    ? review.product_permalink.replace(/\/$/, '').split('/').pop()
    : null

  return (
    <div className="shrink-0 w-80 rounded-3xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col gap-4 select-none">

      {/* Quote icon */}
      <Quote size={20} className="text-amber-300 shrink-0" />

      {/* Review text */}
      <p className="text-sm text-slate-600 leading-relaxed line-clamp-4 flex-1">
        {text}
      </p>

      {/* Stars + date */}
      <div className="flex items-center justify-between">
        <Stars rating={review.rating} />
        <span className="text-xs text-slate-400">{timeAgo(review.date_created)}</span>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100" />

      {/* Reviewer + product */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        {avatar ? (
          <img
            src={avatar}
            alt={review.reviewer}
            className="h-10 w-10 rounded-full object-cover border border-slate-100 shrink-0"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">
            {initial}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800 truncate">{review.reviewer}</p>
          {slug ? (
            <Link
              to={`/products/${slug}`}
              className="text-xs text-amber-600 hover:text-amber-700 hover:underline transition truncate block"
              title={review.product_name}
            >
              {review.product_name}
            </Link>
          ) : (
            <p className="text-xs text-slate-400 truncate">{review.product_name}</p>
          )}
        </div>

        {/* Verified badge */}
        {review.verified && (
          <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
            ✓ Verified
          </span>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ReviewsSlider() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [canScrollLeft,  setCanScrollLeft]  = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollRef  = useRef(null)
  const autoRef    = useRef(null)
  const CARD_WIDTH = 336 // 320px card + 16px gap

  useEffect(() => {
    fetchAllReviews(100)
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateScrollState, { passive: true })
    updateScrollState()
    return () => el.removeEventListener('scroll', updateScrollState)
  }, [reviews, updateScrollState])

  // Auto-scroll every 4 seconds
  useEffect(() => {
    if (reviews.length === 0) return
    autoRef.current = setInterval(() => {
      const el = scrollRef.current
      if (!el) return
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 4
      el.scrollBy({ left: atEnd ? -el.scrollWidth : CARD_WIDTH, behavior: 'smooth' })
    }, 4000)
    return () => clearInterval(autoRef.current)
  }, [reviews])

  const scroll = (dir) => {
    clearInterval(autoRef.current)
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -CARD_WIDTH : CARD_WIDTH, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <section className="py-10">
        <div className="flex gap-5 overflow-hidden px-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="shrink-0 w-80 h-52 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  if (reviews.length === 0) return null

  // Summary stats
  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
  const fiveStars = reviews.filter((r) => r.rating === 5).length

  return (
    <section className="py-10">
      {/* Section header */}
      <div className="flex items-end justify-between mb-6 px-1">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">What Our Customers Say</h2>
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={15} fill="#f59e0b" className="text-amber-500" />
              ))}
            </div>
            <span className="text-sm font-semibold text-slate-700">{avgRating} average</span>
            <span className="text-sm text-slate-400">·</span>
            <span className="text-sm text-slate-500">{reviews.length} reviews</span>
            <span className="text-sm text-slate-400">·</span>
            <span className="text-sm text-slate-500">{fiveStars} five-star</span>
          </div>
        </div>

        {/* Navigation arrows */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="h-9 w-9 rounded-full border border-slate-200 bg-white flex items-center justify-center
              text-slate-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700
              disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="h-9 w-9 rounded-full border border-slate-200 bg-white flex items-center justify-center
              text-slate-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700
              disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        {/* Left fade */}
        <div className={`absolute left-0 top-0 h-full w-12 bg-linear-to-r from-gray-50 to-transparent z-10 pointer-events-none transition-opacity ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} />
        {/* Right fade */}
        <div className={`absolute right-0 top-0 h-full w-12 bg-linear-to-l from-gray-50 to-transparent z-10 pointer-events-none transition-opacity ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} />

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2 px-1
            [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 mt-5">
        {reviews.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              clearInterval(autoRef.current)
              scrollRef.current?.scrollTo({ left: i * CARD_WIDTH, behavior: 'smooth' })
            }}
            className="h-1.5 rounded-full bg-slate-200 hover:bg-amber-400 transition-all"
            style={{ width: i === Math.round((scrollRef.current?.scrollLeft || 0) / CARD_WIDTH) ? 24 : 6 }}
          />
        ))}
      </div>
    </section>
  )
}
