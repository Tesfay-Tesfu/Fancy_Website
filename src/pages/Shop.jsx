import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchProducts, fetchCategories, fetchSizeAttributes, fetchFlavourAttributes } from '../services/woocommerce'
import { Heart, ChevronDown, ChevronUp } from 'lucide-react'
import { toggleWishlist, getWishlist } from '../utils/wishlist'
import { addToCart } from '../utils/cart'
import usePageTitle from '../hooks/usePageTitle'

function Shop() {
  usePageTitle('Shop')
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState('all')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedSizes, setSelectedSizes] = useState([])
  const [selectedFlavours, setSelectedFlavours] = useState([])
  const [sizeOptions, setSizeOptions] = useState([])
  const [flavourOptions, setFlavourOptions] = useState([])
  const [minPrice, setMinPrice] = useState(10)
  const [maxPrice, setMaxPrice] = useState(80)
  const [minPriceInput, setMinPriceInput] = useState(10)
  const [maxPriceInput, setMaxPriceInput] = useState(80)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [wishlist, setWishlist] = useState(getWishlist())
  const [cartToasts, setCartToasts] = useState({}) // { productId: 'added' | 'exists' }
  const [expandedCategories, setExpandedCategories] = useState({})
  const searchQuery = searchParams.get('search') || ''

  // Category hierarchy helpers
  const childrenOf = (parentId) => categories.filter(c => c.parent === parentId)
  const topLevel = categories.filter(c => c.parent === 0)

  // Sync wishlist state
  useEffect(() => {
    const sync = () => setWishlist(getWishlist())
    window.addEventListener('wishlist-updated', sync)
    return () => window.removeEventListener('wishlist-updated', sync)
  }, [])

  const handleAddToCart = (product) => {
    const result = addToCart({
      name: product.name,
      product_id: product.id,
      variation_id: null,
      quantity: 1,
      total_price: parseFloat(product.price) || 0,
      image_url: product.image,
      permalink: `/products/${product.slug}`,
      variation_description: '',
    })
    const kind = result.duplicate ? 'exists' : 'added'
    setCartToasts((p) => ({ ...p, [product.id]: kind }))
    setTimeout(() => setCartToasts((p) => { const n = { ...p }; delete n[product.id]; return n }), 2500)
  }

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const [categoriesData, sizeData, flavourData] = await Promise.all([
          fetchCategories(),
          fetchSizeAttributes(),
          fetchFlavourAttributes(),
        ])
        setCategories(categoriesData)
        setSizeOptions(sizeData.map((item) => ({ id: item.id, name: item.name, slug: item.slug })))
        setFlavourOptions(flavourData.map((item) => ({ id: item.id, name: item.name, slug: item.slug })))
      } catch (err) {
        setError(err.message)
      }
    }
    loadCategories()
  }, [])

  useEffect(() => { setCurrentPage(1) }, [selectedCategories])
  useEffect(() => { setCurrentPage(1) }, [minPrice, maxPrice])
  useEffect(() => { setCurrentPage(1) }, [selectedSizes, selectedFlavours])
  useEffect(() => { setCurrentPage(1) }, [searchQuery])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const variationFilters = []
        if (selectedSizes.length > 0) variationFilters.push({ attribute: 'pa_size', term: selectedSizes })
        if (selectedFlavours.length > 0) variationFilters.push({ attribute: 'pa_flavour', term: selectedFlavours })

        const { data, totalPages: pages } = await fetchProducts(
          currentPage, 10, sortBy, selectedCategories,
          minPrice, maxPrice, variationFilters, searchQuery
        )
        setProducts(data)
        setTotalPages(pages)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [currentPage, sortBy, selectedCategories, minPrice, maxPrice, selectedSizes, selectedFlavours, searchQuery])

  const handleSortChange = (newSortBy) => { setSortBy(newSortBy); setCurrentPage(1) }
  const handleApplyPriceFilter = () => { setMinPrice(minPriceInput); setMaxPrice(maxPriceInput); setCurrentPage(1) }
  const isPriceInputValid = minPriceInput >= 0 && maxPriceInput >= 0 && minPriceInput <= maxPriceInput

  // Map WooCommerce products to display format
  const displayProducts = products.map(product => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    type: product.type,                                          // 'simple' | 'variable'
    category: product.categories?.[0]?.name || 'Uncategorized',
    price: product.price || '',                                   // empty for variable
    badge: product.featured ? 'Featured' : 'New',
    description: product.short_description || '',
    image: product.images?.[0]?.src || 'https://via.placeholder.com/300',
    rating: product.average_rating ? parseFloat(product.average_rating) : 0,
  }))

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 pb-16 pt-20 sm:px-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="h-14 w-14 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin"></div>
          <p className="text-sm text-slate-500 animate-pulse">Loading delicious products...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-6 pb-16 pt-20 sm:px-8">
        <div className="flex flex-col items-center justify-center text-center gap-5">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-600 text-2xl">⚠️</div>
          <h2 className="text-xl font-semibold text-slate-900">Oops! Something went wrong</h2>
          <p className="max-w-md text-sm text-slate-500">We couldn't load the products right now. Please check your connection or try again.</p>
          <button onClick={() => window.location.reload()} className="rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-amber-700">Retry</button>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-6 pb-16 pt-8 sm:px-8">
      {/* Hero */}
      <section className="mb-10 rounded-4xl bg-amber-50/80 p-8 shadow-sm ring-1 ring-amber-200/80">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex rounded-full bg-amber-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Bakery shop</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Fresh treats for every craving.</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">Browse by category, filter by price, and discover variations for every celebration.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-medium text-slate-500">Products</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{products.length}</p>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-medium text-slate-500">Categories</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{categories.length}</p>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-medium text-slate-500">New arrivals</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{products.filter(p => p.featured).length}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-6 rounded-3xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Filter by</h2>
            <p className="mt-2 text-sm text-slate-500">Refine your search without leaving the page.</p>
          </div>

          {/* Category */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Category</p>
                <p className="text-xs text-slate-500">Choose one or more</p>
              </div>

              <button
                onClick={() => setSelectedCategories([])}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700"
              >
                Clear
              </button>
            </div>

            <div className="mt-5 space-y-3 max-h-72 overflow-y-auto pr-1">
              {topLevel.map((category) => {
                const isSelected = selectedCategories.includes(category.id)
                const children = childrenOf(category.id)
                const hasChildren = children.length > 0
                const isExpanded = !!expandedCategories[category.id]

                return (
                  <div key={category.id} className="rounded-2xl bg-white border border-slate-200 overflow-hidden">

                    {/* Parent */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() =>
                          setSelectedCategories((prev) =>
                            isSelected
                              ? prev.filter((id) => id !== category.id)
                              : [...prev, category.id]
                          )
                        }
                        className={`flex flex-1 items-center justify-between px-4 py-3 text-left text-sm font-medium transition ${isSelected
                          ? "bg-amber-50 text-amber-900"
                          : "text-slate-800 hover:bg-slate-50"
                          }`}
                      >
                        <span>{category.name}</span>
                        <span className="text-xs text-slate-500">
                          {category.count || 0}
                        </span>
                      </button>

                      {hasChildren && (
                        <button
                          onClick={() =>
                            setExpandedCategories((prev) => ({
                              ...prev,
                              [category.id]: !prev[category.id],
                            }))
                          }
                          className="px-3 text-slate-500 hover:text-amber-600"
                        >
                          {isExpanded ? "−" : "+"}
                        </button>
                      )}
                    </div>

                    {/* Children (SMART UX) */}
                    {hasChildren && isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {children.map((child) => {
                            const isChildSelected = selectedCategories.includes(child.id)

                            return (
                              <button
                                key={child.id}
                                onClick={() =>
                                  setSelectedCategories((prev) =>
                                    isChildSelected
                                      ? prev.filter((id) => id !== child.id)
                                      : [...prev, child.id]
                                  )
                                }
                                className={`text-xs px-3 py-1.5 rounded-full border transition flex items-center gap-2 ${isChildSelected
                                    ? "bg-amber-600 text-white border-amber-600"
                                    : "bg-white text-slate-700 border-slate-200 hover:border-amber-300"
                                  }`}
                              >
                                <span>{child.name}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isChildSelected
                                    ? "bg-white/20 text-white"
                                    : "bg-slate-100 text-slate-500"
                                  }`}>
                                  {child.count || 0}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Price */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Price Range</p>
                <p className="text-xs text-slate-500">Enter minimum and maximum values</p>
              </div>
              <span className="text-xs font-semibold text-slate-500">${minPrice}–${maxPrice}</span>
            </div>
            <div className="mt-5 space-y-3">
              <div className="flex gap-2">
                <input type="number" value={minPriceInput} onChange={(e) => setMinPriceInput(Number(e.target.value) || 0)} placeholder="Min" className="w-24 rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-amber-500" />
                <input type="number" value={maxPriceInput} onChange={(e) => setMaxPriceInput(Number(e.target.value) || 0)} placeholder="Max" className="w-24 rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-amber-500" />
              </div>
              <button onClick={handleApplyPriceFilter} disabled={!isPriceInputValid} className="inline-flex w-full items-center justify-center rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50">Apply price filter</button>
              {!isPriceInputValid && <p className="text-xs text-red-500">Please enter a valid min and max price.</p>}
            </div>
          </div>

          {/* Variations */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Variations</p>
                <p className="text-xs text-slate-500">Filter by size and flavour</p>
              </div>
              <button onClick={() => { setSelectedSizes([]); setSelectedFlavours([]) }} className="text-xs font-semibold text-amber-600 hover:text-amber-700">Reset</button>
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Size</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sizeOptions.map((size) => {
                    const selected = selectedSizes.includes(size.id)
                    return (
                      <button key={size.id} onClick={() => setSelectedSizes((prev) => prev.includes(size.id) ? prev.filter((v) => v !== size.id) : [...prev, size.id])}
                        className={`rounded-full border px-3 py-2 text-sm font-medium transition ${selected ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300'}`}>
                        {size.name}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Flavour</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {flavourOptions.map((flavour) => {
                    const selected = selectedFlavours.includes(flavour.id)
                    return (
                      <button key={flavour.id} onClick={() => setSelectedFlavours((prev) => prev.includes(flavour.id) ? prev.filter((v) => v !== flavour.id) : [...prev, flavour.id])}
                        className={`rounded-full border px-3 py-2 text-sm font-medium transition ${selected ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300'}`}>
                        {flavour.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Product listing */}
        <section className="space-y-6">
          {/* Sort bar */}
          <div className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{searchQuery ? `Search results for "${searchQuery}"` : 'Showing'}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{displayProducts.length} bakery items</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-full bg-slate-50 px-4 py-2 text-sm text-slate-700">Sort by: Popularity</div>
              <div className="flex gap-2">
                {[{ label: 'All', value: 'all' }, { label: 'New', value: 'new' }, { label: 'Lowest Price', value: 'lowest_price' }, { label: 'Highest Price', value: 'highest_price' }].map((tab) => (
                  <button key={tab.value} onClick={() => handleSortChange(tab.value)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${sortBy === tab.value ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300'}`}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cards */}
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {displayProducts.map((product) => {
              const wishlisted = wishlist.some((w) => w.id === product.id)
              const isVariable = product.type === 'variable'
              const toast = cartToasts[product.id]

              return (
                <article key={product.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">

                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />

                    {/* Badge */}
                    <span className="absolute top-4 left-4 rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white shadow">
                      {product.badge}
                    </span>

                    {/* Wishlist */}
                    <button
                      onClick={(e) => { e.preventDefault(); toggleWishlist({ id: product.id, slug: product.slug, name: product.name, price: product.price, image: product.image }) }}
                      className={`absolute top-4 right-4 z-10 h-9 w-9 rounded-full flex items-center justify-center shadow-md transition
                        ${wishlisted ? 'bg-pink-500 text-white' : 'bg-white/90 text-slate-400 hover:text-pink-500 hover:bg-white'}`}
                      title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
                    </button>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                      <Link to={`/products/${product.slug}`} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-amber-600 hover:text-white transition">
                        View details
                      </Link>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3 p-5">
                    <div>
                      <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide">{product.category}</p>
                      <h3 className="mt-1 text-lg font-semibold text-slate-900 line-clamp-1">{product.name}</h3>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-slate-900">
                        {isVariable
                          ? <span className="text-sm font-medium text-slate-500">Price varies</span>
                          : product.price ? `$${product.price}` : '—'}
                      </p>
                      <span className="text-sm text-slate-500">
                        {product.rating > 0 ? `⭐ ${product.rating.toFixed(1)}` : 'No reviews'}
                      </span>
                    </div>

                    {/* Cart toast */}
                    {toast && (
                      <div className={`rounded-lg px-3 py-1.5 text-xs font-medium text-center ${toast === 'added' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                        {toast === 'added' ? '✓ Added to cart' : 'Already in cart'}
                      </div>
                    )}

                    {/* CTA button */}
                    {isVariable ? (
                      <Link
                        to={`/products/${product.slug}`}
                        className="block w-full rounded-full border-2 border-amber-600 px-5 py-2.5 text-center text-sm font-semibold text-amber-600 transition hover:bg-amber-600 hover:text-white"
                      >
                        Select Options
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 text-slate-700 ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm sm:text-base">Page {currentPage} of {totalPages} — showing {products.length} items</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-300 disabled:cursor-not-allowed disabled:opacity-50">
                Previous
              </button>
              <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-300 disabled:cursor-not-allowed disabled:opacity-50">
                Next
              </button>
              <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50">
                Load more
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Shop
