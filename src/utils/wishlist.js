const WISHLIST_KEY = 'bakery_wishlist'

// Read wishlist from localStorage
export const getWishlist = () => {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []
  } catch {
    return []
  }
}

// Save and broadcast
const saveWishlist = (list) => {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list))
  window.dispatchEvent(new Event('wishlist-updated'))
}

// Check if a product is wishlisted
export const isWishlisted = (productId) =>
  getWishlist().some((item) => item.id === productId)

// Toggle — add if not present, remove if present
// Returns true if added, false if removed
export const toggleWishlist = (product) => {
  const list = getWishlist()
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
