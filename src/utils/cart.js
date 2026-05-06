import { secureGet, secureSet, secureRemove } from './secureStorage'

const CART_KEY = 'fcp_cart'

// Read cart from encrypted localStorage
export const getCart = () => secureGet(CART_KEY, [])

// Save cart to encrypted localStorage and notify listeners
const saveCart = (cart) => {
  secureSet(CART_KEY, cart)
  window.dispatchEvent(new Event('cart-updated'))
}

// Auto-increment id
const nextId = (cart) => {
  if (cart.length === 0) return 1
  return Math.max(...cart.map((i) => i.id)) + 1
}

/**
 * Build the variation description string.
 * e.g. "Size: 10" | Flavour: Vanilla | Base colour: Hot Pink"
 */
export const buildVariationDescription = (selectedAttributes, checkedAddons, addonFields) => {
  const parts = []

  Object.entries(selectedAttributes).forEach(([name, value]) => {
    if (value) parts.push(`${name}: ${value}`)
  })

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
 */
export const addToCart = (item) => {
  const cart = getCart()

  const exists = cart.some(
    (c) =>
      c.product_id            === item.product_id &&
      c.variation_id          === item.variation_id &&
      c.variation_description === item.variation_description
  )

  if (exists) return { success: false, duplicate: true }

  const newItem = { id: nextId(cart), quantity: 1, ...item }
  saveCart([...cart, newItem])
  return { success: true, duplicate: false }
}

// Get total item count
export const getCartCount = () =>
  getCart().reduce((sum, item) => sum + item.quantity, 0)

// Remove item by id
export const removeFromCart = (id) =>
  saveCart(getCart().filter((i) => i.id !== id))

// Update quantity
export const updateCartQuantity = (id, quantity) => {
  if (quantity < 1) return
  saveCart(getCart().map((i) => (i.id === id ? { ...i, quantity } : i)))
}

// Clear entire cart — removes encrypted key and notifies listeners
export const clearCart = () => {
  secureRemove(CART_KEY)
  window.dispatchEvent(new Event('cart-updated'))
}
