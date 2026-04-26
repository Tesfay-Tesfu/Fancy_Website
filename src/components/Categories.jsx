import { useState, useEffect, useRef } from "react";
import { endpoints, getAuthHeaders } from "../services/woocommerce";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(endpoints.categories, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch categories");

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/shop?category=${category.slug}`);
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-8 bg-gray-50 rounded-2xl">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Shop by Categories
            </h2>
            <p className="text-slate-500 mt-1">
              Discover our fresh bakery collections
            </p>
          </div>

          <button
            onClick={() => navigate("/shop")}
            className="hidden md:block text-amber-600 font-medium hover:underline"
          >
            View All →
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-2xl mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchCategories}
              className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Categories */}
        {!loading && !error && categories.length > 0 && (
          <>
            {/* 🔹 Desktop Grid (shows ALL categories) */}
            <div className="hidden lg:grid grid-cols-5 gap-6">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onClick={handleCategoryClick}
                />
              ))}
            </div>

            {/* 🔹 Mobile/Tablet Slider */}
            <div className="lg:hidden relative">

              {/* Arrows */}
              <button
                onClick={() => scroll("left")}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white shadow-md p-2 rounded-full"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={() => scroll("right")}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white shadow-md p-2 rounded-full"
              >
                <ChevronRight size={20} />
              </button>

              {/* Slider */}
              <div
                ref={scrollRef}
                className="flex gap-6 overflow-hidden scroll-smooth px-10"
              >
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onClick={handleCategoryClick}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/* -------------------- Category Card -------------------- */
const CategoryCard = ({ category, onClick }) => {
  return (
    <div
      onClick={() => onClick(category)}
      className="min-w-[200px] bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        {category.image ? (
          <img
            src={category.image.src}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-5xl">
            🍞
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <span className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium">
            Shop Now
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 text-center">
        <h3 className="font-semibold text-slate-900">
          {category.name}
        </h3>

        <p className="text-xs text-slate-500 mt-1">
          {category.count} items
        </p>
      </div>
    </div>
  );
};

export default Categories;