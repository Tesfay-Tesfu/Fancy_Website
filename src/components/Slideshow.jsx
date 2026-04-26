import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
// If using React Router, uncomment below
// import { Link } from 'react-router-dom'

function Slideshow() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [loading, setLoading] = useState(true)
    const [isHovered, setIsHovered] = useState(false)

    const slides = [
        {
            id: 1,
            image: 'https://dev.ethio.shop/wp-content/uploads/2026/04/banner_6.webp',
            title: 'Fresh Bakery Products',
            subtitle: 'Delicious cakes, bread & pastries made daily',
            buttonLink: '/shop'
        },
        {
            id: 2,
            image: 'https://dev.ethio.shop/wp-content/uploads/2026/04/banner_5.webp',
            title: 'Custom Cakes',
            subtitle: 'Order your personalized cake for any occasion',
            buttonLink: '/shop'
        },
        {
            id: 3,
            image: 'https://dev.ethio.shop/wp-content/uploads/2026/04/banner_4.webp',
            title: 'Hot & Fresh',
            subtitle: 'Straight from the oven to your table',
            buttonLink: '/shop'
        },
        {
            id: 4,
            image: 'https://dev.ethio.shop/wp-content/uploads/2026/04/banner_3.webp',
            title: 'Daily Fresh Bread',
            subtitle: 'Soft, warm, and baked every morning',
            buttonLink: '/shop'
        },
        {
            id: 5,
            image: 'https://dev.ethio.shop/wp-content/uploads/2026/04/banner_2.webp',
            title: 'Sweet Treats',
            subtitle: 'Taste the best desserts in town',
            buttonLink: '/shop'
        },
        {
            id: 6,
            image: 'https://dev.ethio.shop/wp-content/uploads/2026/04/banner_1.webp',
            title: 'Order Online',
            subtitle: 'Fast delivery to your doorstep',
            buttonLink: '/shop'
        }
    ]

    // Auto slide
    useEffect(() => {
        if (isHovered) return

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 4000)

        return () => clearInterval(interval)
    }, [isHovered])

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    }

    return (
        <div
            className="relative w-full h-[250px] md:h-[420px] overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Loading Spinner */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                    <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
                </div>
            )}

            {/* Slides */}
            <div
                className="flex transition-transform duration-700 ease-in-out h-full"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {slides.map((slide) => (
                    <div key={slide.id} className="w-full h-full flex-shrink-0 relative">

                        {/* Image */}
                        <img
                            src={slide.image}
                            alt={slide.title}
                            onLoad={() => setLoading(false)}
                            className="w-full h-full object-contain md:object-cover bg-white"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>

                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">

                            <h2 className="text-xl md:text-4xl font-bold mb-3">
                                {slide.title}
                            </h2>

                            <p className="text-sm md:text-lg mb-5 text-white/90 max-w-2xl">
                                {slide.subtitle}
                            </p>

                            <a
                                href={slide.buttonLink}
                                className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-amber-200 transition"
                            >
                                SHOP NOW
                            </a>

                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Buttons */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 backdrop-blur-md bg-white/30 hover:bg-white/50 p-3 rounded-full shadow-lg transition"
            >
                <ChevronLeft className="w-6 h-6 text-black" />
            </button>

            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 backdrop-blur-md bg-white/30 hover:bg-white/50 p-3 rounded-full shadow-lg transition"
            >
                <ChevronRight className="w-6 h-6 text-black" />
            </button>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30">
                <div
                    key={currentSlide}
                    className="h-full bg-white animate-progress"
                ></div>
            </div>

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, index) => (
                    <div
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`cursor-pointer transition-all ${index === currentSlide
                                ? 'w-6 h-2 bg-white rounded-full'
                                : 'w-2 h-2 bg-white/50 rounded-full'
                            }`}
                    ></div>
                ))}
            </div>
        </div>
    )
}

export default Slideshow