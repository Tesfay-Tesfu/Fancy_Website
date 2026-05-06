// WooCommerce API configuration
const config = {
  baseURL: import.meta.env.VITE_WOOCOMMERCE_URL,
  consumerKey: import.meta.env.VITE_WOOCOMMERCE_CONSUMER_KEY,
  consumerSecret: import.meta.env.VITE_WOOCOMMERCE_CONSUMER_SECRET,
}

// WooCommerce API endpoints
export const endpoints = {
  products: `${config.baseURL}/wp-json/wc/v3/products`,
  categories: `${config.baseURL}/wp-json/wc/v3/products/categories`,
  orders: `${config.baseURL}/wp-json/wc/v3/orders`,
  sizeAttributes: `${config.baseURL}/wp-json/wc/v3/products/attributes/1/terms`,
  flavourAttributes: `${config.baseURL}/wp-json/wc/v3/products/attributes/2/terms`,
  signatureCakes: `${config.baseURL}/wp-json/wc/v3/products?category=16`, 
  occasionCakes: `${config.baseURL}/wp-json/wc/v3/products?category=62`,
  themedCakes: `${config.baseURL}/wp-json/wc/v3/products?category=63`,
  signup: `${config.baseURL}/wp-json/wc/v3/customers`,
  login: `${config.baseURL}/wp-json/wc/v3/login`,
}

// Helper function to create authentication headers
export const getAuthHeaders = () => {
  const credentials = btoa(`${config.consumerKey}:${config.consumerSecret}`)
  return {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json',
  }
}

// Fetch products from WooCommerce API
export const fetchProducts = async (
  page = 1,
  perPage = 10,
  sortBy = 'all',
  categories = [],
  minPrice = null,
  maxPrice = null,
  variationFilters = [],
  search = null
) => {
  try {
    const url = new URL(endpoints.products)
    url.searchParams.set('per_page', perPage)
    url.searchParams.set('page', page)
    url.searchParams.set('status', 'publish')

    // Add category filter
    if (categories && categories.length > 0) {
      url.searchParams.set('category', categories.join(','))
    }

    // Add search filter
    if (search && search.trim()) {
      url.searchParams.set('search', search.trim())
    }

    // Add price filters
    if (minPrice !== null && minPrice > 0) {
      url.searchParams.set('min_price', minPrice)
    }
    if (maxPrice !== null && maxPrice > 0) {
      url.searchParams.set('max_price', maxPrice)
    }

    // Add variation filters using WooCommerce attribute query params
    variationFilters.forEach(({ attribute, term }) => {
      const terms = Array.isArray(term) ? term : [term]
      terms.forEach((termValue) => {
        url.searchParams.append('attribute', attribute)
        url.searchParams.append('attribute_term', termValue)
      })
    })

    // Add sorting parameters
    if (sortBy === 'new') {
      url.searchParams.set('orderby', 'date')
      url.searchParams.set('order', 'desc')
    } else if (sortBy === 'lowest_price') {
      url.searchParams.set('orderby', 'price')
      url.searchParams.set('order', 'asc')
    } else if (sortBy === 'highest_price') {
      url.searchParams.set('orderby', 'price')
      url.searchParams.set('order', 'desc')
    } else {
      // 'all' - default sorting by date desc
      url.searchParams.set('orderby', 'date')
      url.searchParams.set('order', 'desc')
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const total = Number(response.headers.get('X-WP-Total') || 0)
    const totalPages = Number(response.headers.get('X-WP-TotalPages') || 1)

    return {
      data,
      total,
      totalPages,
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
  }
}

// Fetch a single product by its slug
export const fetchProductBySlug = async (slug) => {
  try {
    const url = new URL(endpoints.products)
    url.searchParams.set('slug', slug)
    url.searchParams.set('status', 'publish')

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching product by slug:', error)
    throw error
  }
}

// Fetch products by IDs
export const fetchProductsByIds = async (ids) => {
  try {
    const url = new URL(endpoints.products)
    url.searchParams.set('include', ids.join(','))
    url.searchParams.set('status', 'publish')

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching products by IDs:', error)
    throw error
  }
}

// Fetch categories from WooCommerce API
export const fetchCategories = async () => {
  try {
    const url = new URL(endpoints.categories)
    url.searchParams.set('per_page', 50)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
}

// Fetch size attribute terms from WooCommerce API
export const fetchSizeAttributes = async () => {
  try {
    const url = new URL(endpoints.sizeAttributes)
    url.searchParams.set('per_page', 50)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching size attributes:', error)
    throw error
  }
}

// Fetch flavour attribute terms from WooCommerce API
export const fetchFlavourAttributes = async () => {
  try {
    const url = new URL(endpoints.flavourAttributes)
    url.searchParams.set('per_page', 50)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching flavour attributes:', error)
    throw error
  }
}

// Fetch product variations from WooCommerce API
export const fetchProductVariations = async (productId) => {
  try {
    const url = `${endpoints.products}/${productId}/variations`

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching product variations:', error)
    throw error
  }
}
export const fetchSearchSuggestions = async (query, limit = 5) => {
  if (!query || query.trim().length < 2) return []

  try {
    const url = new URL(endpoints.products)
    url.searchParams.set('search', query.trim())
    url.searchParams.set('per_page', limit)
    url.searchParams.set('status', 'publish')

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching search suggestions:', error)
    throw error
  }
}

// Create a new customer (signup)
export const createCustomer = async (customerData) => {
  try {
    const response = await fetch(endpoints.signup, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(customerData),
    })

    const data = await response.json()

    if (!response.ok) {
      // 🔥 show real WooCommerce error
      throw new Error(data.message || 'Something went wrong')
    }

    return data

  } catch (error) {
    console.error('Error creating customer:', error)
    throw error
  }
}

// Login customer (assuming JWT auth plugin is installed)
export const loginCustomer = async (username, password) => {
  try {
    const response = await fetch(endpoints.login, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ username, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Invalid credentials')
    }

    if (data.status === 200 && data.user) {
      // Storage is handled by Login.jsx using secureSet
      return data
    } else {
      throw new Error(data.message || 'Unexpected response format')
    }

  } catch (error) {
    console.error('Error logging in:', error)
    throw error
  }
}

// Fetch terms for any product attribute by attribute ID
export const fetchAttributeTerms = async (attributeId) => {
  try {
    const url = new URL(`${config.baseURL}/wp-json/wc/v3/products/attributes/${attributeId}/terms`)
    url.searchParams.set('per_page', 100)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching attribute terms:', error)
    throw error
  }
}

// Update customer billing and/or shipping address
export const updateCustomerAddress = async (customerId, payload) => {
  try {
    const url = `${endpoints.signup}/${customerId}`

    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update address.')
    }

    return data
  } catch (error) {
    console.error('Error updating customer address:', error)
    throw error
  }
}

// Fetch shipping methods for zone 1
export const fetchShippingMethods = async () => {
  try {
    const url = `${config.baseURL}/wp-json/wc/v3/shipping/zones/1/methods`
    const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Failed to fetch shipping methods.')
    return data
  } catch (error) {
    console.error('Error fetching shipping methods:', error)
    throw error
  }
}

// Fetch payment gateways
export const fetchPaymentGateways = async () => {
  try {
    const url = `${config.baseURL}/wp-json/wc/v3/payment_gateways`
    const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Failed to fetch payment gateways.')
    // Return only enabled gateways
    return data.filter((g) => g.enabled)
  } catch (error) {
    console.error('Error fetching payment gateways:', error)
    throw error
  }
}

// Place a WooCommerce order
export const placeOrder = async (orderPayload) => {
  try {
    const response = await fetch(endpoints.orders, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderPayload),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Failed to place order.')
    return data
  } catch (error) {
    console.error('Error placing order:', error)
    throw error
  }
}

// Fetch orders for a specific customer with pagination, search and status filter
export const fetchCustomerOrders = async ({
  customerId,
  page = 1,
  perPage = 10,
  status = 'any',
  search = '',
}) => {
  try {
    const url = new URL(`${config.baseURL}/wp-json/wc/v3/orders`)
    url.searchParams.set('customer', customerId)
    url.searchParams.set('page', page)
    url.searchParams.set('per_page', perPage)
    url.searchParams.set('orderby', 'date')
    url.searchParams.set('order', 'desc')
    if (status && status !== 'any') url.searchParams.set('status', status)
    if (search && search.trim()) url.searchParams.set('search', search.trim())

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || 'Failed to fetch orders.')
    }

    const data = await response.json()
    const total      = Number(response.headers.get('X-WP-Total') || 0)
    const totalPages = Number(response.headers.get('X-WP-TotalPages') || 1)

    return { data, total, totalPages }
  } catch (error) {
    console.error('Error fetching customer orders:', error)
    throw error
  }
}

// Fetch reviews for a specific product
export const fetchProductReviews = async (productId) => {
  try {
    const url = new URL(`${config.baseURL}/wp-json/wc/v3/products/reviews`)
    url.searchParams.set('product', productId)
    url.searchParams.set('per_page', 50)
    url.searchParams.set('status', 'approved')

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || 'Failed to fetch reviews.')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching product reviews:', error)
    throw error
  }
}

// Submit a new product review
export const submitProductReview = async ({ product_id, reviewer, reviewer_email, review, rating }) => {
  try {
    const response = await fetch(`${config.baseURL}/wp-json/wc/v3/products/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ product_id, reviewer, reviewer_email, review, rating, status: 'hold' }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit review.')
    }

    return data
  } catch (error) {
    console.error('Error submitting review:', error)
    throw error
  }
}

// Fetch all approved reviews (for homepage display) — paginated
export const fetchAllReviews = async (perPage = 10, page = 1) => {
  try {
    const url = new URL(`${config.baseURL}/wp-json/wc/v3/products/reviews`)
    url.searchParams.set('per_page', perPage)
    url.searchParams.set('page', page)
    url.searchParams.set('status', 'approved')

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || 'Failed to fetch reviews.')
    }

    const data        = await response.json()
    const totalPages  = Number(response.headers.get('X-WP-TotalPages') || 1)
    const total       = Number(response.headers.get('X-WP-Total') || 0)

    return { data, totalPages, total }
  } catch (error) {
    console.error('Error fetching all reviews:', error)
    throw error
  }
}
