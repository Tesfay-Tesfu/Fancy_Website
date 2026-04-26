import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchProductBySlug, fetchProductsByIds } from '../services/woocommerce'
import { Home, ShoppingBag } from 'lucide-react'

function SingleProduct() {
    const { productSlug } = useParams()
    const [product, setProduct] = useState(null)
    const [selectedImage, setSelectedImage] = useState(null)
    const [selectedAttributes, setSelectedAttributes] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('description')
    const [relatedProducts, setRelatedProducts] = useState([])

    // Handle attribute change
    const handleAttributeChange = (name, value) => {
        setSelectedAttributes((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    useEffect(() => {
        if (!productSlug) return

        const loadProduct = async () => {
            setLoading(true)
            setError(null)

            try {
                const result = await fetchProductBySlug(productSlug)

                if (!result || result.length === 0) {
                    throw new Error('Product not found.')
                }

                const data = result[0]
                setProduct(data)

                setSelectedImage(
                    data?.images?.[0]?.src || 'https://via.placeholder.com/600'
                )

                // Fetch related products if related_ids exist
                if (data.related_ids && data.related_ids.length > 0) {
                    try {
                        const related = await fetchProductsByIds(data.related_ids)
                        setRelatedProducts(related)
                    } catch (err) {
                        console.error('Error fetching related products:', err)
                        // Don't set error state for related products failure
                    }
                }
            } catch (err) {
                setError(err.message || 'Unable to load product.')
            } finally {
                setLoading(false)
            }
        }

        loadProduct()
    }, [productSlug])

    if (loading) {
        return (
            <main className="mx-auto max-w-6xl px-6 pb-16 pt-20 sm:px-8">
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="h-14 w-14 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin"></div>
                    <p className="text-sm text-slate-500">Loading product details...</p>
                </div>
            </main>
        )
    }

    if (error) {
        return (
            <main className="mx-auto max-w-6xl px-6 pb-16 pt-20 sm:px-8">
                <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
                    <p className="text-lg font-semibold text-red-700">{error}</p>
                    <p className="mt-4 text-sm text-slate-600">
                        Try returning to the shop or checking the product URL.
                    </p>
                    <Link
                        to="/shop"
                        className="mt-6 inline-flex rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-700"
                    >
                        Back to Shop
                    </Link>
                </div>
            </main>
        )
    }

    if (!product) return null

    const price = product.price ? `$${product.price}` : 'Price unavailable'
    const description =
        product.description || product.short_description || ''

    return (
        <main className="mx-auto max-w-6xl px-6 pb-16 pt-6 sm:px-8">

            {/* Breadcrumb */}
            <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <Link to="/" className="flex items-center gap-1 hover:text-amber-600 transition">
                    <Home size={16} />
                    Home
                </Link>

                <span className="text-slate-400">/</span>

                <Link to="/shop" className="flex items-center gap-1 hover:text-amber-600 transition">
                    <ShoppingBag size={16} />
                    Shop
                </Link>

                <span className="text-slate-400">/</span>

                <span className="font-medium text-slate-700 truncate max-w-[200px]">
                    {product.name}
                </span>
            </nav>

            {/* Layout */}
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">

                {/* IMAGE GALLERY */}
                <div className="flex gap-4">

                    {/* Thumbnails */}
                    <div className="flex flex-col gap-3">
                        {product.images?.map((img, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImage(img.src)}
                                className={`h-20 w-20 overflow-hidden rounded-xl border-2 transition
                                ${selectedImage === img.src
                                        ? 'border-amber-600'
                                        : 'border-transparent hover:border-slate-300'
                                    }`}
                            >
                                <img
                                    src={img.src}
                                    alt={`thumb-${index}`}
                                    className="h-full w-full object-cover"
                                />
                            </button>
                        ))}
                    </div>

                    {/* Main Image */}
                    <div className="flex-1 overflow-hidden rounded-xl bg-slate-100 shadow-sm">
                        <img
                            src={selectedImage}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-300"
                        />
                    </div>
                </div>

                {/* PRODUCT INFO */}
                <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

                    {/* Title */}
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">
                            {product.name}
                        </h1>

                        {/* Rating */}
                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                            <span className="text-amber-500">⭐</span>
                            <span className="font-semibold text-slate-700">
                                {product.average_rating || '0'}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span>{product.rating_count || 0} reviews</span>
                        </div>
                    </div>

                    {/* Price */}
                    <div>
                        <p className="text-2xl font-semibold text-slate-900">
                            {price}
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <div
                            className="mt-1 text-sm leading-7 text-slate-700 text-justify"
                            dangerouslySetInnerHTML={{ __html: product.short_description }}
                        />
                    </div>

                    {/* ATTRIBUTES DROPDOWNS */}
                    {product.attributes?.length > 0 && (
                        <div className="space-y-4">

                            {product.attributes.map((attr) => (
                                <div key={attr.id}>
                                    <label className="text-sm font-semibold text-slate-700">
                                        {attr.name}
                                    </label>

                                    <select
                                        className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                                        value={selectedAttributes[attr.name] || ''}
                                        onChange={(e) =>
                                            handleAttributeChange(attr.name, e.target.value)
                                        }
                                    >
                                        <option value="">Select {attr.name}</option>

                                        {attr.options.map((option, index) => (
                                            <option key={index} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}

                        </div>
                    )}

                    {/* Info cards */}
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-3xl bg-slate-50 p-5">
                            <p className="text-sm text-slate-500">Rating</p>
                            <p className="mt-2 text-lg font-semibold text-slate-900">
                                ⭐ {product.average_rating || '0'}
                            </p>
                        </div>

                        <div className="rounded-3xl bg-slate-50 p-5">
                            <p className="text-sm text-slate-500">Availability</p>
                            <p className="mt-2 text-lg font-semibold text-slate-900">
                                {product.stock_status === 'instock'
                                    ? 'In stock'
                                    : 'Out of stock'}
                            </p>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="space-y-4">
                        <button className="w-full rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-700 transition">
                            Add to cart
                        </button>

                        <Link
                            to="/shop"
                            className="block rounded-full border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Continue shopping
                        </Link>
                    </div>

                </div>
            </div>

            {/* TABS */}
            <div className="mt-8">
                <div className="border-b border-slate-200">
                    <nav className="flex space-x-8">
                        <button
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'description'
                                    ? 'border-amber-600 text-amber-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                            onClick={() => setActiveTab('description')}
                        >
                            Description
                        </button>
                        <button
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'specification'
                                    ? 'border-amber-600 text-amber-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                            onClick={() => setActiveTab('specification')}
                        >
                            Specification
                        </button>
                        <button
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'reviews'
                                    ? 'border-amber-600 text-amber-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            Reviews
                        </button>
                    </nav>
                </div>
                <div className="mt-6">
                    {activeTab === 'description' && (
                        <div
                            className="prose prose-sm max-w-none text-slate-700 text-justify"
                            dangerouslySetInnerHTML={{
                                __html: product.description || 'No description available.'
                            }}
                        />
                    )}
                    {activeTab === 'specification' && (
                        <div className="space-y-2">
                            <div>
                                <p className="font-semibold text-slate-500">
                                    SKU: <span className="text-slate-500">{product.sku || 'N/A'}</span>
                                </p>
                    
                            </div>
                            <div>
                                <p className="text-slate-500 font-semibold">
                                    Categories: {product.categories?.map((cat) => cat.name).join(', ') || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-500 font-semibold">
                                    Tags: {product.tags?.map((tag) => tag.name).join(', ') || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-500 font-semibold">
                                    Stock Status: {product.stock_status === 'instock' ? 'In Stock' : 'Out of Stock'}
                                </p>
                            </div>
                        </div>
                    )}
                    {activeTab === 'reviews' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">⭐</span>
                                    <span className="text-lg font-semibold text-slate-900">
                                        {product.average_rating || '0'}
                                    </span>
                                    <span className="text-slate-500">
                                        ({product.rating_count || 0} reviews)
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-700">
                                    Customer reviews would be displayed here. Currently showing summary only.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* RELATED PRODUCTS */}
            {relatedProducts.length > 0 && (
                <div className="mt-12">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Related Products</h3>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {relatedProducts.map((relProduct) => (
                            <article
                                key={relProduct.id}
                                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div className="relative aspect-square overflow-hidden">
                                    <img
                                        src={relProduct.images?.[0]?.src || 'https://via.placeholder.com/300'}
                                        alt={relProduct.name}
                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                                        <Link
                                            to={`/products/${relProduct.slug}`}
                                            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-amber-600 hover:text-white transition"
                                        >
                                            View details
                                        </Link>
                                    </div>
                                </div>
                                <div className="space-y-4 p-5">
                                    <div>
                                        <h4 className="text-lg font-semibold text-slate-900 line-clamp-1">
                                            {relProduct.name}
                                        </h4>
                                        <p className="text-amber-600 font-bold">
                                            ${relProduct.price}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            )}
        </main>
    )
}

export default SingleProduct