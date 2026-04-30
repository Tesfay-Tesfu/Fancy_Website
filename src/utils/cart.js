const CART_KEY = 'bakery_cart'

// Read cart from localStorage
export const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || []
  } catch {
    return []
  }
}

// Save cart to localStorage and dispatch event so Header updates
const saveCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  window.dispatchEvent(new Event('cart-updated'))
}

// Generate a unique auto-increment id
const nextId = (cart) => {
  if (cart.length === 0) return 1
  return Math.max(...cart.map((i) => i.id)) + 1
}

/**
 * Build the variation description string.
 * e.g. "Cake Size: 10" (2 layers) | Flavour: Vanilla | Base colour: Hot Pink | Matching Cupcakes: Box Of 6, Box Of 12"
 *
 * @param {object} selectedAttributes  - { "Size": "10\"", "Flavour": "Vanilla" }
 * @param {object} checkedAddons       - { fieldId: { slug: bool } }
 * @param {Array}  addonFields         - wapf fields array
 */
export const buildVariationDescription = (selectedAttributes, checkedAddons, addonFields) => {
  const parts = []

  // Attributes
  Object.entries(selectedAttributes).forEach(([name, value]) => {
    if (value) parts.push(`${name}: ${value}`)
  })

  // Addon checkboxes
  addonFields.forEach((field) => {
    const selected = field.options.choices
      .filter((c) => checkedAddons[field.id]?.[c.slug])
      .map((c) => c.label)
    if (selected.length > 0) {
      parts.push(`${field.label}: ${selected.join(', ')}`)
    }
  })

  return parts.join(' | ')
}

/**
 * Add item to cart.
 * Returns { success: boolean, duplicate: boolean }
 *
 * @param {object} item - cart item (without id)
 */
export const addToCart = (item) => {
  const cart = getCart()

  // Duplicate check: same product_id + same variation_id + same variation_description
  const exists = cart.some(
    (c) =>
      c.product_id === item.product_id &&
      c.variation_id === item.variation_id &&
      c.variation_description === item.variation_description
  )

  if (exists) {
    return { success: false, duplicate: true }
  }

  const newItem = { id: nextId(cart), quantity: 1, ...item }
  saveCart([...cart, newItem])
  return { success: true, duplicate: false }
}

// Get total item count
export const getCartCount = () => {
  return getCart().reduce((sum, item) => sum + item.quantity, 0)
}

// Remove item by id
export const removeFromCart = (id) => {
  saveCart(getCart().filter((i) => i.id !== id))
}

// Update quantity
export const updateCartQuantity = (id, quantity) => {
  if (quantity < 1) return
  saveCart(getCart().map((i) => (i.id === id ? { ...i, quantity } : i)))
}

// Clear entire cart
export const clearCart = () => saveCart([])
