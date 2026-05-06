import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const slides = [
  {
    id: 1,
    image: 'https://dev.ethio.shop/wp-content/uploads/2026/04/banner_6.webp',
    title: 'Fresh Bakery Products',
    subtitle: 'Delicious cakes, bread & pastries made daily',
    buttonLink: '/shop',
  },
  {
    id: 2,
    image: 'https://dev.ethio.shop/wp-content/uploads/2026/04/banner_5.webp',
    title: 'Custom Cakes',
    subtitle: 'Order your personalized cake for any occasion',
    buttonLink: '/shop',
  },
  {
    id: 3,
    image: 'https://dev.ethio.shop/wp-content/uploads/2026/04/banner_4.webp',
    title: 'Hot & Fresh',
    subtitle: 'Straight from the oven to your table',
    buttonLink: '/shop',
  },
  {
    id: 4,
    image: 'https://dev.ethio.shop/wp-content/uploads/2026/04/banner_3.webp',
    title: 'Daily Fresh Bread',
    subtitle: 'Soft, warm, and baked every morning',
    buttonLink: '/shop',
  },
  {
    id: 5,
    image: 'https://dev.ethio.shop/wp-content/uploads/2026/04/banner_2.webp',
    title: 'Sweet Treats',
    subtitle: 'Taste the best desserts in town',
    buttonLink: '/shop',
  },
  {
    id: 6,
    image: 'https://dev.ethio.shop/wp-content/uploads/2026/04/banner_1.webp',
    title: 'Order Online',
    subtitle: 'Fast delivery to your doorstep',
    buttonLink: '/shop',
  },
]

function Slideshow() {
  const [current,   setCurrent]   = useState(0)
  const [paused,    setPaused]    = useState(false)
  const [progress,  setProgress]  = useState(0)

  const INTERVAL = 4000

  const next = useCallback(() => setCurrent((p) => (p + 1) % slides.length), [])
  const prev = useCallback(() => setCurrent((p) => (p - 1 + slides.length) % slides.length), [])

  // Auto-advance
  useEffect(() => {
    if (paused) return
    setProgress(0)
    const start = Date.now()
    const tick = setInterval(() => {
      const elapsed = Date.now() - start
      setProgress(Math.min((elapsed / INTERVAL) * 100, 100))
    }, 50)
    const advance = setTimeout(() => { next(); setProgress(0) }, INTERVAL)
    return () => { clearInterval(tick); clearTimeout(advance) }
  }, [current, paused, next])

  // Touch swipe
  let touchStartX = 0
  const onTouchStart = (e) => { touchStartX = e.touches[0].clientX }
  const onTouchEnd   = (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
  }

  return (
    <div
      className="relative w-full overflow-hidden bg-black"
      style={{ height: 'clamp(200px, 45vw, 520px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="relative w-full h-full shrink-0">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-r from-black/65 via-black/30 to-transparent" />

            {/* Text content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6 sm:px-12">
              <h2 className="text-lg sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 drop-shadow-lg leading-tight max-w-2xl">
                {slide.title}
              </h2>
              <p className="text-xs sm:text-base md:text-lg text-white/90 mb-4 sm:mb-6 max-w-xl drop-shadow">
                {slide.subtitle}
              </p>
              <Link
                to={slide.buttonLink}
                className="bg-white text-black px-5 py-2 sm:px-7 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold hover:bg-amber-400 hover:text-white transition shadow-md"
              >
                SHOP NOW
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next arrows — smaller on mobile */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/25 hover:bg-white/50 backdrop-blur-sm
          p-1.5 sm:p-2.5 rounded-full shadow transition"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/25 hover:bg-white/50 backdrop-blur-sm
          p-1.5 sm:p-2.5 rounded-full shadow transition"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? 'w-5 sm:w-6 h-1.5 sm:h-2 bg-white'
                : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/20">
        <div
          className="h-full bg-amber-400 transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export default Slideshow
