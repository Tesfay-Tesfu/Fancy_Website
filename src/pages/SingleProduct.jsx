import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
    fetchProductBySlug, fetchProductsByIds, fetchProductVariations,
    fetchAttributeTerms, fetchProductReviews, submitProductReview
} from '../services/woocommerce'
import { Home, ShoppingBag, CheckCircle, AlertCircle, Heart, Star, Loader2, Send } from 'lucide-react'
import { addToCart, buildVariationDescription } from '../utils/cart'
import { toggleWishlist, isWishlisted } from '../utils/wishlist'

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
    const [checkedAddons, setCheckedAddons] = useState({})
    const [attributeErrors, setAttributeErrors] = useState({})
    const [attributeTerms, setAttributeTerms] = useState({})
    const [cartToast, setCartToast] = useState(null)
    const [wishlisted, setWishlisted] = useState(false)

    // Review state
    const [reviews, setReviews] = useState([])
    const [reviewsLoading, setReviewsLoading] = useState(false)
    const [reviewsLoaded, setReviewsLoaded] = useState(false)
    const [reviewForm, setReviewForm] = useState({
        reviewer: localStorage.getItem('first_name')
            ? `${localStorage.getItem('first_name')} ${localStorage.getItem('last_name') || ''}`.trim()
            : '',
        reviewer_email: localStorage.getItem('email') || '',
        review: '',
        rating: 5,
    })
    const [reviewErrors, setReviewErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [submitToast, setSubmitToast] = useState(null)
    const [submitMsg, setSubmitMsg] = useState('')

    // Sync wishlist state when product loads
    useEffect(() => {
        if (product?.id) setWishlisted(isWishlisted(product.id))
    }, [product?.id])

    // Load reviews lazily when reviews tab opens
    useEffect(() => {
        if (activeTab === 'reviews' && product?.id && !reviewsLoaded) {
            setReviewsLoading(true)
            fetchProductReviews(product.id)
                .then((data) => { setReviews(data); setReviewsLoaded(true) })
                .catch(() => {})
                .finally(() => setReviewsLoading(false))
        }
    }, [activeTab, product?.id, reviewsLoaded])

    const handleWishlistToggle = () => {
        if (!product) return
        const added = toggleWishlist({
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: currentPrice || product.price || product.regular_price || '0',
            image: product.images?.[0]?.src || '',
        })
        setWishlisted(added)
    }

    const handleReviewFormChange = (e) => {
        const { name, value } = e.target
        setReviewForm((p) => ({ ...p, [name]: value }))
        setReviewErrors((p) => ({ ...p, [name]: '' }))
    }

    const handleRatingClick = (rating) => {
        setReviewForm((p) => ({ ...p, rating }))
        setReviewErrors((p) => ({ ...p, rating: '' }))
    }

    const handleSubmitReview = async (e) => {
        e.preventDefault()
        const errs = {}
        if (!reviewForm.reviewer.trim())       errs.reviewer       = 'Name is required.'
        if (!reviewForm.reviewer_email.trim()) errs.reviewer_email = 'Email is required.'
        if (!reviewForm.review.trim())         errs.review         = 'Review text is required.'
        if (!reviewForm.rating)                errs.rating         = 'Please select a rating.'
        if (Object.keys(errs).length) { setReviewErrors(errs); return }

        setSubmitting(true)
        try {
            const newReview = await submitProductReview({
                product_id:     product.id,
                reviewer:       reviewForm.reviewer.trim(),
                reviewer_email: reviewForm.reviewer_email.trim(),
                review:         reviewForm.review.trim(),
                rating:         reviewForm.rating,
            })
            setReviews((p) => [newReview, ...p])
            setReviewForm((p) => ({ ...p, review: '', rating: 5 }))
            setSubmitToast('success')
            setSubmitMsg('Your review has been submitted!')
        } catch (err) {
            setSubmitToast('error')
            setSubmitMsg(err.message || 'Failed to submit review.')
        } finally {
            setSubmitting(false)
            setTimeout(() => setSubmitToast(null), 4000)
        }
    }

    // Handle attribute change — clear error on selection
    const handleAttributeChange = (name, value) => {
        setSelectedAttributes((prev) => ({ ...prev, [name]: value }))
        if (value) setAttributeErrors((prev) => ({ ...prev, [name]: false }))
    }

    // Validate attributes and add to cart
    const handleAddToCart = () => {
        if (product?.type === 'variable' && product.attributes?.length) {
            const errors = {}
            product.attributes.forEach((attr) => {
                if (!selectedAttributes[attr.name]) errors[attr.name] = true
            })
            if (Object.keys(errors).length > 0) { setAttributeErrors(errors); return }
        }

        setAttributeErrors({})

        let variationId = null
        if (product.type === 'variable' && variations.length > 0) {
            const match = variations.find((v) =>
                v.attributes.every((a) => selectedAttributes[a.name] === a.option)
            )
            variationId = match?.id || null
        }

        const addonFields = getAddonFields(product.meta_data)
        const variationDescription = buildVariationDescription(selectedAttributes, checkedAddons, addonFields)

        const result = addToCart({
            name: product.name,
            product_id: product.id,
            variation_id: variationId,
            quantity: 1,
            total_price: parseFloat(currentPrice) || 0,
            image_url: product.images?.[0]?.src || '',
            permalink: `/products/${product.slug}`,
            variation_description: variationDescription,
        })

        setCartToast(result.duplicate ? 'duplicate' : 'added')
        setTimeout(() => setCartToast(null), 3000)
    }

    const handleAddonToggle = (fieldId, slug) => {
        setCheckedAddons((prev) => {
            const fieldChecks = prev[fieldId] || {}
            return { ...prev, [fieldId]: { ...fieldChecks, [slug]: !fieldChecks[slug] } }
        })
    }

    const getAddonFields = (metaData = []) => {
        const wapfMeta = metaData.find((m) => m.key === '_wapf_fieldgroup')
        if (!wapfMeta?.value?.fields) return []
        return wapfMeta.value.fields.filter(
            (f) => f.type === 'checkboxes' && f.options?.choices?.length > 0
        )
    }

    const isColorCode = (str = '') => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(str.trim())

    const getColorForOption = (attrId, optionName) => {
        const terms = attributeTerms[attrId] || []
        const term = terms.find((t) => t.name.toLowerCase() === optionName.toLowerCase())
        const desc = term?.description?.trim()
        return desc && isColorCode(desc) ? desc : null
    }

    // Load product
    useEffect(() => {
        if (!productSlug) return
        const loadProduct = async () => {
            setLoading(true)
            setError(null)
            try {
                const result = await fetchProductBySlug(productSlug)
                if (!result || result.length === 0) throw new Error('Product not found.')
                const data = result[0]
                setProduct(data)
                setSelectedImage(data?.images?.[0]?.src || 'https://via.placeholder.com/600')

                if (data.type === 'variable') {
                    try {
                        const vars = await fetchProductVariations(data.id)
                        setVariations(vars)
                        setCurrentPrice(data.price)
                    } catch {
                        setCurrentPrice(data.price)
                    }
                } else {
                    setCurrentPrice(data.price)
                }

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
                    } catch { /* non-critical */ }
                }

                if (data.related_ids?.length > 0) {
                    try {
                        const related = await fetchProductsByIds(data.related_ids)
                        setRelatedProducts(related)
                    } catch { /* non-critical */ }
                }
            } catch (err) {
                setError(err.message || 'Unable to load product.')
            } finally {
                setLoading(false)
            }
        }
        loadProduct()
    }, [productSlug])

    // Update price when size changes for variable products
    useEffect(() => {
        if (product?.type === 'variable' && variations.length > 0) {
            const selectedSize = selectedAttributes['Size']
            if (selectedSize) {
                const match = variations.find((v) =>
                    v.attributes.some((a) => a.name === 'Size' && a.option === selectedSize)
                )
                if (match) setCurrentPrice(match.price)
            } else {
                setCurrentPrice(product.price)
            }
        }
    }, [selectedAttributes, variations, product])

    // ── Early returns ─────────────────────────────────────────────────────────
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
                    <p className="mt-4 text-sm text-slate-600">Try returning to the shop or checking the product URL.</p>
                    <Link to="/shop" className="mt-6 inline-flex rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-700">
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
                    <Home size={16} /> Home
                </Link>
                <span className="text-slate-400">/</span>
                <Link to="/shop" className="flex items-center gap-1 hover:text-amber-600 transition">
                    <ShoppingBag size={16} /> Shop
                </Link>
                <span className="text-slate-400">/</span>
                <span className="font-medium text-slate-700 truncate max-w-[200px]">{product.name}</span>
            </nav>

            {/* Layout */}
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">

                {/* IMAGE GALLERY */}
                <div className="flex gap-4">
                    <div className="flex flex-col gap-3">
                        {product.images?.map((img, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImage(img.src)}
                                className={`h-20 w-20 overflow-hidden rounded-xl border-2 transition
                                    ${selectedImage === img.src ? 'border-amber-600' : 'border-transparent hover:border-slate-300'}`}
                            >
                                <img src={img.src} alt={`thumb-${index}`} className="h-full w-full object-cover" />
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 overflow-hidden rounded-xl bg-slate-100 shadow-sm">
                        <img src={selectedImage} alt={product.name} className="h-full w-full object-cover transition duration-300" />
                    </div>
                </div>

                {/* PRODUCT INFO */}
                <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

                    <div>
                        <h1 className="text-xl font-bold text-slate-900">{product.name}</h1>
                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                            <span className="text-amber-500">⭐</span>
                            <span className="font-semibold text-slate-700">{product.average_rating || '0'}</span>
                            <span className="text-slate-400">•</span>
                            <span>{product.rating_count || 0} reviews</span>
                        </div>
                    </div>

                    <div>
                        <div className="mt-1 text-sm leading-7 text-slate-700 text-justify"
                            dangerouslySetInnerHTML={{ __html: product.short_description }} />
                    </div>

                    <div>
                        <p className="text-2xl font-semibold text-slate-900">{price}</p>
                    </div>

                    {/* ATTRIBUTES */}
                    {product.attributes?.length > 0 && (
                        <div className="space-y-4">
                            {product.attributes.map((attr) => {
                                const hasColors = attr.options.some((opt) => getColorForOption(attr.id, opt) !== null)
                                return (
                                    <div key={attr.id}>
                                        <label className="text-sm font-semibold text-slate-700">
                                            {attr.name}
                                            <span className="ml-1 text-red-500">*</span>
                                            {selectedAttributes[attr.name] && (
                                                <span className="ml-2 font-normal text-slate-500">— {selectedAttributes[attr.name]}</span>
                                            )}
                                        </label>

                                        {hasColors ? (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {attr.options.map((option, index) => {
                                                    const color = getColorForOption(attr.id, option)
                                                    const isSelected = selectedAttributes[attr.name] === option
                                                    return (
                                                        <button key={index} type="button" title={option}
                                                            onClick={() => handleAttributeChange(attr.name, option)}
                                                            className={`relative h-9 w-9 rounded-full border-2 transition focus:outline-none
                                                                ${isSelected ? 'border-amber-600 scale-110 shadow-md' : 'border-slate-300 hover:border-slate-500'}`}
                                                            style={{ backgroundColor: color || '#ccc' }}>
                                                            {isSelected && (
                                                                <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold drop-shadow">✓</span>
                                                            )}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <select
                                                className={`mt-2 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none transition
                                                    ${attributeErrors[attr.name] ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:border-amber-500'}`}
                                                value={selectedAttributes[attr.name] || ''}
                                                onChange={(e) => handleAttributeChange(attr.name, e.target.value)}
                                            >
                                                <option value="">Select {attr.name}</option>
                                                {attr.options.map((option, index) => (
                                                    <option key={index} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        )}

                                        {attributeErrors[attr.name] && (
                                            <p className="mt-1 text-xs text-red-500">Please select a {attr.name}.</p>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* ADDON CHECKBOXES */}
                    {getAddonFields(product.meta_data).map((field) => (
                        <div key={field.id} className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">{field.label}</label>
                            {field.description && <p className="text-xs text-slate-500">{field.description}</p>}
                            <div className="space-y-2">
                                {field.options.choices.map((choice) => (
                                    <label key={choice.slug}
                                        className="flex items-center gap-3 cursor-pointer rounded-xl border border-slate-200 px-3 py-2 hover:border-amber-400 hover:bg-amber-50 transition">
                                        <input type="checkbox"
                                            checked={!!checkedAddons[field.id]?.[choice.slug]}
                                            onChange={() => handleAddonToggle(field.id, choice.slug)}
                                            className="h-4 w-4 accent-amber-600 cursor-pointer" />
                                        <span className="text-sm text-slate-700">{choice.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* BUTTONS */}
                    <div className="space-y-3">
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

                        <button onClick={handleAddToCart}
                            className="w-full rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-700 transition">
                            Add to cart
                        </button>

                        <button onClick={handleWishlistToggle}
                            className={`w-full flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition
                                ${wishlisted ? 'border-pink-300 bg-pink-50 text-pink-600 hover:bg-pink-100' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                            <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
                            {wishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
                        </button>

                        <Link to="/shop"
                            className="block rounded-full border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">
                            Continue shopping
                        </Link>
                    </div>
                </div>
            </div>

            {/* TABS */}
            <div className="mt-8">
                <div className="border-b border-slate-200">
                    <nav className="flex space-x-8">
                        {['description', 'specification', 'reviews'].map((tab) => (
                            <button key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition
                                    ${activeTab === tab ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                                {tab}
                                {tab === 'reviews' && product.rating_count > 0 && (
                                    <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                                        {product.rating_count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-6">
                    {/* Description */}
                    {activeTab === 'description' && (
                        <div className="prose prose-sm max-w-none text-slate-700 text-justify"
                            dangerouslySetInnerHTML={{ __html: product.description || 'No description available.' }} />
                    )}

                    {/* Specification */}
                    {activeTab === 'specification' && (
                        <div className="space-y-2 text-sm">
                            <p className="font-semibold text-slate-500">SKU: <span className="font-normal">{product.sku || 'N/A'}</span></p>
                            <p className="font-semibold text-slate-500">Categories: <span className="font-normal">{product.categories?.map((c) => c.name).join(', ') || 'N/A'}</span></p>
                            <p className="font-semibold text-slate-500">Tags: <span className="font-normal">{product.tags?.map((t) => t.name).join(', ') || 'N/A'}</span></p>
                            <p className="font-semibold text-slate-500">Stock: <span className="font-normal">{product.stock_status === 'instock' ? 'In Stock' : 'Out of Stock'}</span></p>
                        </div>
                    )}

                    {/* Reviews */}
                    {activeTab === 'reviews' && (
                        <div className="space-y-8">

                            {/* Rating summary */}
                            <div className="flex items-center gap-4 rounded-2xl bg-amber-50 border border-amber-100 px-6 py-4">
                                <div className="text-center">
                                    <p className="text-4xl font-extrabold text-amber-600">{product.average_rating || '0'}</p>
                                    <div className="flex gap-0.5 mt-1 justify-center">
                                        {[1,2,3,4,5].map((s) => (
                                            <Star key={s} size={14}
                                                fill={s <= Math.round(parseFloat(product.average_rating || 0)) ? '#d97706' : 'none'}
                                                className={s <= Math.round(parseFloat(product.average_rating || 0)) ? 'text-amber-500' : 'text-slate-300'} />
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">{product.rating_count || 0} reviews</p>
                                </div>
                            </div>

                            {/* Review list */}
                            {reviewsLoading ? (
                                <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
                                    <Loader2 size={20} className="animate-spin text-amber-500" />
                                    <span className="text-sm">Loading reviews…</span>
                                </div>
                            ) : reviews.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <Star size={32} strokeWidth={1.5} className="mx-auto mb-2 text-slate-200" />
                                    <p className="text-sm">No reviews yet. Be the first to review this product!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map((r) => (
                                        <div key={r.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">
                                                        {r.reviewer?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800">{r.reviewer}</p>
                                                        <p className="text-xs text-slate-400">
                                                            {new Date(r.date_created).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            {r.verified && <span className="ml-2 text-green-600 font-medium">✓ Verified</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-0.5 shrink-0">
                                                    {[1,2,3,4,5].map((s) => (
                                                        <Star key={s} size={13}
                                                            fill={s <= r.rating ? '#d97706' : 'none'}
                                                            className={s <= r.rating ? 'text-amber-500' : 'text-slate-200'} />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="mt-3 text-sm text-slate-600 leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: r.review }} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Write a review */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h3 className="text-base font-bold text-slate-900 mb-4">Write a Review</h3>

                                {submitToast && (
                                    <div className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm
                                        ${submitToast === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                                        {submitToast === 'success'
                                            ? <CheckCircle size={15} className="shrink-0" />
                                            : <AlertCircle size={15} className="shrink-0" />}
                                        {submitMsg}
                                    </div>
                                )}

                                <form onSubmit={handleSubmitReview} className="space-y-4">
                                    {/* Star picker */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-2">
                                            Your Rating <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex gap-1">
                                            {[1,2,3,4,5].map((s) => (
                                                <button key={s} type="button" onClick={() => handleRatingClick(s)}
                                                    className="transition hover:scale-110 focus:outline-none">
                                                    <Star size={28}
                                                        fill={s <= reviewForm.rating ? '#d97706' : 'none'}
                                                        className={s <= reviewForm.rating ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'} />
                                                </button>
                                            ))}
                                        </div>
                                        {reviewErrors.rating && <p className="mt-1 text-xs text-red-500">{reviewErrors.rating}</p>}
                                    </div>

                                    {/* Name + Email */}
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                                                Name <span className="text-red-500">*</span>
                                            </label>
                                            <input type="text" name="reviewer" value={reviewForm.reviewer}
                                                onChange={handleReviewFormChange} placeholder="Your name"
                                                className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition
                                                    ${reviewErrors.reviewer ? 'border-red-400 bg-red-50 focus:ring-red-200' : 'border-slate-200 focus:ring-amber-300/40 focus:border-amber-400'}`} />
                                            {reviewErrors.reviewer && <p className="mt-1 text-xs text-red-500">{reviewErrors.reviewer}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                                                Email <span className="text-red-500">*</span>
                                            </label>
                                            <input type="email" name="reviewer_email" value={reviewForm.reviewer_email}
                                                onChange={handleReviewFormChange} placeholder="your@email.com"
                                                className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition
                                                    ${reviewErrors.reviewer_email ? 'border-red-400 bg-red-50 focus:ring-red-200' : 'border-slate-200 focus:ring-amber-300/40 focus:border-amber-400'}`} />
                                            {reviewErrors.reviewer_email && <p className="mt-1 text-xs text-red-500">{reviewErrors.reviewer_email}</p>}
                                        </div>
                                    </div>

                                    {/* Review text */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                                            Review <span className="text-red-500">*</span>
                                        </label>
                                        <textarea name="review" value={reviewForm.review}
                                            onChange={handleReviewFormChange} rows={4}
                                            placeholder="Share your experience with this product…"
                                            className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition resize-none
                                                ${reviewErrors.review ? 'border-red-400 bg-red-50 focus:ring-red-200' : 'border-slate-200 focus:ring-amber-300/40 focus:border-amber-400'}`} />
                                        {reviewErrors.review && <p className="mt-1 text-xs text-red-500">{reviewErrors.review}</p>}
                                    </div>

                                    <button type="submit" disabled={submitting}
                                        className="flex items-center gap-2 rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed transition">
                                        {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                                        {submitting ? 'Submitting…' : 'Submit Review'}
                                    </button>
                                </form>
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
                            <article key={relProduct.id}
                                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                                <div className="relative aspect-square overflow-hidden">
                                    <img
                                        src={relProduct.images?.[0]?.src || 'https://via.placeholder.com/300'}
                                        alt={relProduct.name}
                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                                        <Link to={`/products/${relProduct.slug}`}
                                            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-amber-600 hover:text-white transition">
                                            View details
                                        </Link>
                                    </div>
                                </div>
                                <div className="space-y-2 p-5">
                                    <h4 className="text-lg font-semibold text-slate-900 line-clamp-1">{relProduct.name}</h4>
                                    <p className="text-amber-600 font-bold">${relProduct.price}</p>
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
