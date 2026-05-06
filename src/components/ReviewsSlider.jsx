import { useEffect, useRef, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Star, Quote, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { fetchAllReviews } from '../services/woocommerce'

const PER_PAGE = 10

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr + 'Z')) / 1000)
  if (diff < 60)           return 'just now'
  if (diff < 3600)         return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)        return `${Math.floor(diff / 3600)}h ago`
  if (diff < 7 * 86400)   return `${Math.floor(diff / 86400)}d ago`
  if (diff < 30 * 86400)  return `${Math.floor(diff / 604800)}w ago`
  if (diff < 365 * 86400) return `${Math.floor(diff / 2592000)}mo ago`
  return `${Math.floor(diff / 31536000)}y ago`
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').trim()
}

function Stars({ rating, size = 13 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size}
          fill={s <= rating ? '#f59e0b' : 'none'}
          className={s <= rating ? 'text-amber-500' : 'text-slate-200'} />
      ))}
    </div>
  )
}

// ── Review card — responsive width ───────────────────────────────────────────
function ReviewCard({ review }) {
  const avatar  = review.reviewer_avatar_urls?.['48']
  const initial = review.reviewer?.[0]?.toUpperCase() || '?'
  const text    = stripHtml(review.review)
  const slug    = review.product_permalink
    ? review.product_permalink.replace(/\/$/, '').split('/').pop()
    : null

  return (
    <div className="shrink-0 w-[calc(100vw-3rem)] max-w-xs sm:w-72 md:w-80 rounded-3xl border border-slate-200 bg-white shadow-sm p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 select-none">
      <Quote size={18} className="text-amber-300 shrink-0" />

      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-4 flex-1">{text}</p>

      <div className="flex items-center justify-between">
        <Stars rating={review.rating} />
        <span className="text-[10px] sm:text-xs text-slate-400">{timeAgo(review.date_created)}</span>
      </div>

      <div className="border-t border-slate-100" />

      <div className="flex items-center gap-2 sm:gap-3">
        {avatar ? (
          <img src={avatar} alt={review.reviewer}
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border border-slate-100 shrink-0" />
        ) : (
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
            {initial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">{review.reviewer}</p>
          {slug ? (
            <Link to={`/products/${slug}`}
              className="text-[10px] sm:text-xs text-amber-600 hover:text-amber-700 hover:underline transition truncate block"
              title={review.product_name}>
              {review.product_name}
            </Link>
          ) : (
            <p className="text-[10px] sm:text-xs text-slate-400 truncate">{review.product_name}</p>
          )}
        </div>
        {review.verified && (
          <span className="shrink-0 rounded-full bg-green-100 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold text-green-700">
            ✓
          </span>
        )}
      </div>
    </div>
  )
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="shrink-0 w-[calc(100vw-3rem)] max-w-xs sm:w-72 md:w-80 rounded-3xl border border-slate-100 bg-white p-4 sm:p-6 space-y-3 animate-pulse">
      <div className="h-4 w-4 rounded bg-slate-100" />
      <div className="space-y-2">
        <div className="h-3 rounded bg-slate-100 w-full" />
        <div className="h-3 rounded bg-slate-100 w-5/6" />
        <div className="h-3 rounded bg-slate-100 w-4/6" />
      </div>
      <div className="flex gap-1">{[...Array(5)].map((_, i) => <div key={i} className="h-3 w-3 rounded bg-slate-100" />)}</div>
      <div className="border-t border-slate-100 pt-3 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-slate-100 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 rounded bg-slate-100 w-3/4" />
          <div className="h-2.5 rounded bg-slate-100 w-1/2" />
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ReviewsSlider() {
  const [reviews,     setReviews]     = useState([])
  const [page,        setPage]        = useState(1)
  const [totalPages,  setTotalPages]  = useState(1)
  const [loading,     setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [canLeft,     setCanLeft]     = useState(false)
  const [canRight,    setCanRight]    = useState(true)
  const scrollRef = useRef(null)
  const autoRef   = useRef(null)

  // Card width changes with viewport — use ref to measure
  const getCardWidth = () => {
    const el = scrollRef.current?.firstElementChild
    return el ? el.offsetWidth + 12 : 280 // card + gap
  }

  const loadPage = useCallback(async (pageNum, append = false) => {
    append ? setLoadingMore(true) : setLoading(true)
    try {
      const { data, totalPages: tp } = await fetchAllReviews(PER_PAGE, pageNum)
      setReviews((prev) => append ? [...prev, ...data] : data)
      setTotalPages(tp)
      setPage(pageNum)
    } catch { /* silent */ }
    finally { append ? setLoadingMore(false) : setLoading(false) }
  }, [])

  useEffect(() => { loadPage(1) }, [loadPage])

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
  }, [reviews, updateScrollState])

  // Auto-scroll every 4s
  useEffect(() => {
    if (reviews.length === 0) return
    autoRef.current = setInterval(() => {
      const el = scrollRef.current
      if (!el) return
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 4
      el.scrollBy({ left: atEnd ? -el.scrollWidth : getCardWidth(), behavior: 'smooth' })
    }, 4000)
    return () => clearInterval(autoRef.current)
  }, [reviews])

  const scrollLeft = () => {
    clearInterval(autoRef.current)
    scrollRef.current?.scrollBy({ left: -getCardWidth(), behavior: 'smooth' })
  }

  const scrollRight = () => {
    clearInterval(autoRef.current)
    const el = scrollRef.current
    if (!el) return
    const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 4
    if (atEnd && page < totalPages && !loadingMore) {
      loadPage(page + 1, true).then(() => {
        setTimeout(() => el.scrollBy({ left: getCardWidth(), behavior: 'smooth' }), 100)
      })
    } else {
      el.scrollBy({ left: getCardWidth(), behavior: 'smooth' })
    }
  }

  if (loading) {
    return (
      <section className="py-8 sm:py-10">
        <div className="mb-5 px-1">
          <div className="h-6 w-52 rounded-xl bg-slate-100 animate-pulse mb-2" />
          <div className="h-4 w-36 rounded-xl bg-slate-100 animate-pulse" />
        </div>
        <div className="flex gap-3 overflow-hidden px-1">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </section>
    )
  }

  if (reviews.length === 0) return null

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
  const hasMore   = page < totalPages

  return (
    <section className="py-8 sm:py-10">

      {/* Header */}
      <div className="flex items-start sm:items-end justify-between mb-5 sm:mb-6 px-1 gap-3">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">What Our Customers Say</h2>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mt-1.5">
            <Stars rating={5} size={13} />
            <span className="text-xs sm:text-sm font-semibold text-slate-700">{avgRating} avg</span>
            <span className="text-slate-300">·</span>
            <span className="text-xs sm:text-sm text-slate-500">{reviews.length}{hasMore ? '+' : ''} reviews</span>
          </div>
        </div>

        {/* Arrows */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={scrollLeft} disabled={!canLeft}
            className="h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center
              text-slate-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700
              disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm">
            <ChevronLeft size={16} />
          </button>
          <button onClick={scrollRight} disabled={!canRight && !hasMore}
            className="h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center
              text-slate-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700
              disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm relative">
            {loadingMore
              ? <Loader2 size={14} className="animate-spin text-amber-600" />
              : <ChevronRight size={16} />}
            {hasMore && !loadingMore && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500 border-2 border-white" />
            )}
          </button>
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <div className={`absolute left-0 top-0 h-full w-6 sm:w-10 bg-linear-to-r from-white to-transparent z-10 pointer-events-none transition-opacity ${canLeft ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`absolute right-0 top-0 h-full w-6 sm:w-10 bg-linear-to-l from-white to-transparent z-10 pointer-events-none transition-opacity ${canRight || hasMore ? 'opacity-100' : 'opacity-0'}`} />

        <div ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth pb-2 px-1
            [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
          {loadingMore && (
            <div className="shrink-0 w-[calc(100vw-3rem)] max-w-xs sm:w-72 md:w-80 rounded-3xl border border-amber-100 bg-amber-50 flex items-center justify-center min-h-[180px]">
              <div className="flex flex-col items-center gap-2 text-amber-600">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-xs font-medium">Loading more…</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Page indicator */}
      {totalPages > 1 && (
        <p className="text-center text-xs text-slate-400 mt-3">
          Page {page} of {totalPages}
          {hasMore && <span className="text-amber-600 font-medium"> · more available</span>}
        </p>
      )}
    </section>
  )
}
