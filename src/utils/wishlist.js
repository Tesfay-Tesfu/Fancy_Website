import { secureGet, secureSet, secureRemove } from './secureStorage'

const WISHLIST_KEY = 'fcp_wishlist'

// Read wishlist from encrypted localStorage
export const getWishlist = () => secureGet(WISHLIST_KEY, [])

// Save wishlist to encrypted localStorage and notify listeners
const saveWishlist = (list) => {
  secureSet(WISHLIST_KEY, list)
  window.dispatchEvent(new Event('wishlist-updated'))
}

// Check if a product is wishlisted
export const isWishlisted = (productId) =>
  getWishlist().some((item) => item.id === productId)

// Toggle — add if not present, remove if present
// Returns true if added, false if removed
export const toggleWishlist = (product) => {
  const list   = getWishlist()
  const exists = list.some((item) => item.id === product.id)
  if (exists) {
    saveWishlist(list.filter((item) => item.id !== product.id))
    return false
  }
  saveWishlist([...list, product])
  return true
}

// Remove by id
export const removeFromWishlist = (productId) =>
  saveWishlist(getWishlist().filter((item) => item.id !== productId))

// Count
export const getWishlistCount = () => getWishlist().length

// Clear entire wishlist — removes encrypted key and notifies listeners
export const clearWishlist = () => {
  secureRemove(WISHLIST_KEY)
  window.dispatchEvent(new Event('wishlist-updated'))
}
