import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchProducts } from "../services/woocommerce";
import { useNavigate } from "react-router-dom";

/* -------------------- Reusable Slider -------------------- */
const ProductSlider = ({ products, title }) => {
    const scrollRef = useRef(null);
    const navigate = useNavigate();

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 320;
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="mb-12">
            {/* Header (NO BLUR NOW) */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
                <button
                    onClick={() => navigate("/shop")}
                    className="hidden md:block text-amber-600 font-medium hover:underline"
                >
                    View All →
                </button>
            </div>

            {/* Slider Wrapper */}
            <div className="relative">
                {/* Gradient ONLY inside slider */}
                <div className="absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>

                {/* Left Arrow */}
                <button
                    onClick={() => scroll("left")}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white shadow-md p-2 rounded-full hover:bg-gray-100"
                >
                    <ChevronLeft size={20} />
                </button>

                {/* Right Arrow */}
                <button
                    onClick={() => scroll("right")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white shadow-md p-2 rounded-full hover:bg-gray-100"
                >
                    <ChevronRight size={20} />
                </button>

                {/* Products */}
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-hidden scroll-smooth px-12"
                >
                    {products.map((product) => (
                        <button
                            key={product.id}
                            type="button"
                            onClick={() => navigate(`/products/${product.slug}`)}
                            className="min-w-[220px] bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group text-left cursor-pointer"
                        >
                            {/* Image */}
                            <div className="aspect-square overflow-hidden">
                                {product.images?.[0] ? (
                                    <img
                                        src={product.images[0].src}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-4xl">
                                        🍰
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <h4 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-2">
                                    {product.name}
                                </h4>
                                <p className="text-amber-600 font-bold">
                                    ${product.price}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

/* -------------------- Main Component -------------------- */
function FeaturedCakes() {
    const [signatureCakes, setSignatureCakes] = useState([]);
    const [occasionCakes, setOccasionCakes] = useState([]);
    const [themedCakes, setThemedCakes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFeaturedCakes();
    }, []);

    const fetchFeaturedCakes = async () => {
        try {
            setLoading(true);

            const [sigRes, occRes, themeRes] = await Promise.all([
                fetchProducts(1, 10, "all", [16]),
                fetchProducts(1, 10, "all", [62]),
                fetchProducts(1, 10, "all", [63]),
            ]);

            setSignatureCakes(sigRes.data);
            setOccasionCakes(occRes.data);
            setThemedCakes(themeRes.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    /* -------------------- Loading -------------------- */
    if (loading) {
        return (
            <section className="py-8 bg-gray-50 rounded-2xl">
                <div className="mx-auto max-w-7xl px-6 sm:px-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                        <div className="flex gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="min-w-[220px]">
                                    <div className="aspect-square bg-gray-200 rounded-2xl mb-3"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    /* -------------------- Error -------------------- */
    if (error) {
        return (
            <section className="py-8 bg-gray-50 rounded-2xl">
                <div className="mx-auto max-w-7xl px-6 sm:px-8">
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                        <p className="text-red-700 mb-4">{error}</p>
                        <button
                            onClick={fetchFeaturedCakes}
                            className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    /* -------------------- Main UI -------------------- */
    return (
        <section className="py-8 bg-gray-50 rounded-2xl">
            <div className="mx-auto max-w-7xl px-6 sm:px-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900">
                        Featured Cakes
                    </h2>
                    <p className="text-slate-500 mt-1">
                        Discover our signature, occasion, and themed cake collections
                    </p>
                </div>

                <ProductSlider products={signatureCakes} title="Signature Cakes" />
                <ProductSlider products={occasionCakes} title="Occasion Cakes" />
                <ProductSlider products={themedCakes} title="Themed Cakes" />
            </div>
        </section>
    );
}

export default FeaturedCakes;