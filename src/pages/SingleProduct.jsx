import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchProductBySlug, fetchProductsByIds, fetchProductVariations, fetchAttributeTerms } from '../services/woocommerce'
import { Home, ShoppingBag, CheckCircle, AlertCircle } from 'lucide-react'
import { addToCart, buildVariationDescription } from '../utils/cart'

function SingleProduct() {
    const { productSlug } = useParams()
    const [product, setProduct] = useState(null)
    const [selectedImage, setSelectedImage] = useState(null)
    const [selectedAttributes, setSelectedAttributes] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('description')
    const [relatedProducts, setRelatedProducts] = useState([])
    const [variations, setVariations] = useState([])
    const [currentPrice, setCurrentPrice] = useState(null)
    const [checkedAddons, setCheckedAddons] = useState({}) // { fieldId: { slug: bool } }
    const [attributeErrors, setAttributeErrors] = useState({}) // { attrName: true }
    const [attributeTerms, setAttributeTerms] = useState({}) // { attrId: [{ name, description(color) }] }
    const [cartToast, setCartToast] = useState(null) // 'added' | 'duplicate' | null

    // Handle attribute change — clear error on selection
    const handleAttributeChange = (name, value) => {
        setSelectedAttributes((prev) => ({
            ...prev,
            [name]: value
        }))
        if (value) {
            setAttributeErrors((prev) => ({ ...prev, [name]: false }))
        }
    }

    // Validate all attributes and handle add to cart
    const handleAddToCart = () => {
        // Validate required attributes for variable products
        if (product?.type === 'variable' && product.attributes?.length) {
            const errors = {}
            product.attributes.forEach((attr) => {
                if (!selectedAttributes[attr.name]) {
                    errors[attr.name] = true
                }
            })
            if (Object.keys(errors).length > 0) {
                setAttributeErrors(errors)
                return
            }
        }

        setAttributeErrors({})

        // Find matching variation id
        let variationId = null
        if (product.type === 'variable' && variations.length > 0) {
            const match = variations.find((v) =>
                v.attributes.every(
                    (a) => selectedAttributes[a.name] === a.option
                )
            )
            variationId = match?.id || null
        }

        // Build addon fields for description
        const addonFields = getAddonFields(product.meta_data)

        // Build variation description string
        const variationDescription = buildVariationDescription(
            selectedAttributes,
            checkedAddons,
            addonFields
        )

        const item = {
            name: product.name,
            product_id: product.id,
            variation_id: variationId,
            quantity: 1,
            total_price: parseFloat(currentPrice) || 0,
            image_url: product.images?.[0]?.src || '',
            permalink: `/products/${product.slug}`,
            variation_description: variationDescription,
        }

        const result = addToCart(item)

        if (result.duplicate) {
            setCartToast('duplicate')
        } else {
            setCartToast('added')
        }

        // Auto-hide toast after 3s
        setTimeout(() => setCartToast(null), 3000)
    }

    // Handle addon checkbox toggle
    const handleAddonToggle = (fieldId, slug) => {
        setCheckedAddons((prev) => {
            const fieldChecks = prev[fieldId] || {}
            return {
                ...prev,
                [fieldId]: {
                    ...fieldChecks,
                    [slug]: !fieldChecks[slug]
                }
            }
        })
    }

    // Extract wapf addon fields from meta_data
    const getAddonFields = (metaData = []) => {
        const wapfMeta = metaData.find((m) => m.key === '_wapf_fieldgroup')
        if (!wapfMeta?.value?.fields) return []
        return wapfMeta.value.fields.filter(
            (f) => f.type === 'checkboxes' && f.options?.choices?.length > 0
        )
    }

    // Check if a string looks like a hex color code
    const isColorCode = (str = '') => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(str.trim())

    // Get color hex for an option name from fetched terms
    const getColorForOption = (attrId, optionName) => {
        const terms = attributeTerms[attrId] || []
        const term = terms.find((t) => t.name.toLowerCase() === optionName.toLowerCase())
        const desc = term?.description?.trim()
        return desc && isColorCode(desc) ? desc : null
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

                // Fetch variations if product is variable
                if (data.type === 'variable') {
                    try {
                        const vars = await fetchProductVariations(data.id)
                        setVariations(vars)
                        // Set default price to product price
                        setCurrentPrice(data.price)
                    } catch (err) {
                        console.error('Error fetching variations:', err)
                        setCurrentPrice(data.price)
                    }
                } else {
                    // For simple products, use product price
                    setCurrentPrice(data.price)
                }

                // Fetch attribute terms (for color codes in descriptions)
                if (data.attributes?.length > 0) {
                    try {
                        const termsMap = {}
                        await Promise.all(
                            data.attributes.map(async (attr) => {
                                if (attr.id) {
                                    const terms = await fetchAttributeTerms(attr.id)
                                    termsMap[attr.id] = terms
                                }
                            })
                        )
                        setAttributeTerms(termsMap)
                    } catch (err) {
                        console.error('Error fetching attribute terms:', err)
                    }
                }

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

    // Update price when size attribute changes for variable products
    useEffect(() => {
        if (product?.type === 'variable' && variations.length > 0) {
            const selectedSize = selectedAttributes['Size']
            if (selectedSize) {
                // Find any variation with the selected size
                const matchingVariation = variations.find(variation => {
                    return variation.attributes.some(attr => attr.name === 'Size' && attr.option === selectedSize)
                })
                if (matchingVariation) {
                    setCurrentPrice(matchingVariation.price)
                }
            } else {
                // If no size selected, set to default product price
                setCurrentPrice(product.price)
            }
        }
    }, [selectedAttributes, variations, product])

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

    const price = currentPrice ? `$${currentPrice}` : 'Price unavailable'

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

                    {/* Description */}
                    <div>
                        <div
                            className="mt-1 text-sm leading-7 text-slate-700 text-justify"
                            dangerouslySetInnerHTML={{ __html: product.short_description }}
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <p className="text-2xl font-semibold text-slate-900">
                            {price}
                        </p>
                    </div>

                    {/* ATTRIBUTES DROPDOWNS */}
                    {product.attributes?.length > 0 && (
                        <div className="space-y-4">

                            {product.attributes.map((attr) => {
                                // Check if any option in this attribute has a color code
                                const hasColors = attr.options.some(
                                    (opt) => getColorForOption(attr.id, opt) !== null
                                )

                                return (
                                    <div key={attr.id}>
                                        <label className="text-sm font-semibold text-slate-700">
                                            {attr.name}
                                            <span className="ml-1 text-red-500">*</span>
                                            {selectedAttributes[attr.name] && (
                                                <span className="ml-2 font-normal text-slate-500">
                                                    — {selectedAttributes[attr.name]}
                                                </span>
                                            )}
                                        </label>

                                        {hasColors ? (
                                            /* Color swatch picker */
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {attr.options.map((option, index) => {
                                                    const color = getColorForOption(attr.id, option)
                                                    const isSelected = selectedAttributes[attr.name] === option
                                                    return (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            title={option}
                                                            onClick={() => handleAttributeChange(attr.name, option)}
                                                            className={`relative h-9 w-9 rounded-full border-2 transition focus:outline-none
                                                                ${isSelected
                                                                    ? 'border-amber-600 scale-110 shadow-md'
                                                                    : 'border-slate-300 hover:border-slate-500'
                                                                }`}
                                                            style={{ backgroundColor: color || '#ccc' }}
                                                        >
                                                            {isSelected && (
                                                                <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold drop-shadow">
                                                                    ✓
                                                                </span>
                                                            )}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            /* Regular dropdown */
                                            <select
                                                className={`mt-2 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none transition
                                                    ${attributeErrors[attr.name]
                                                        ? 'border-red-500 bg-red-50 focus:border-red-500'
                                                        : 'border-slate-300 focus:border-amber-500'
                                                    }`}
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
                                        )}

                                        {attributeErrors[attr.name] && (
                                            <p className="mt-1 text-xs text-red-500">
                                                Please select a {attr.name}.
                                            </p>
                                        )}
                                    </div>
                                )
                            })}

                        </div>
                    )}

                    {/* ADDON FIELDS (from meta_data _wapf_fieldgroup) */}
                    {getAddonFields(product.meta_data).map((field) => (
                        <div key={field.id} className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">
                                {field.label}
                            </label>
                            {field.description && (
                                <p className="text-xs text-slate-500">{field.description}</p>
                            )}
                            <div className="space-y-2">
                                {field.options.choices.map((choice) => (
                                    <label
                                        key={choice.slug}
                                        className="flex items-center gap-3 cursor-pointer rounded-xl border border-slate-200 px-3 py-2 hover:border-amber-400 hover:bg-amber-50 transition"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={!!checkedAddons[field.id]?.[choice.slug]}
                                            onChange={() => handleAddonToggle(field.id, choice.slug)}
                                            className="h-4 w-4 accent-amber-600 cursor-pointer"
                                        />
                                        <span className="text-sm text-slate-700">{choice.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Buttons */}
                    <div className="space-y-3">

                        {/* Toast feedback */}
                        {cartToast === 'added' && (
                            <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                                <CheckCircle size={16} className="shrink-0" />
                                <span>Item added to cart successfully!</span>
                            </div>
                        )}
                        {cartToast === 'duplicate' && (
                            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                                <AlertCircle size={16} className="shrink-0" />
                                <span>This item with the same options is already in your cart.</span>
                            </div>
                        )}

                        <button
                            onClick={handleAddToCart}
                            className="w-full rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-700 transition">
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