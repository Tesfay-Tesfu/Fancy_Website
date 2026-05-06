import CryptoJS from 'crypto-js'

// Encryption key — combines a static app salt with the browser's origin
// so data encrypted on one domain can't be read on another
const SECRET = `fcp_secure_${window.location.hostname}_v1`

/**
 * Encrypt a value and store it in localStorage.
 * @param {string} key
 * @param {*} value  — any JSON-serialisable value
 */
export const secureSet = (key, value) => {
  try {
    const json      = JSON.stringify(value)
    const encrypted = CryptoJS.AES.encrypt(json, SECRET).toString()
    localStorage.setItem(key, encrypted)
  } catch (err) {
    console.error(`[secureStorage] set error for "${key}":`, err)
  }
}

/**
 * Decrypt and return a value from localStorage.
 * Returns `null` if the key doesn't exist or decryption fails.
 * @param {string} key
 * @param {*} fallback — returned when key is missing or corrupt
 */
export const secureGet = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback

    const bytes     = CryptoJS.AES.decrypt(raw, SECRET)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)

    // If decryption yields empty string the data is corrupt / wrong key
    if (!decrypted) return fallback

    return JSON.parse(decrypted)
  } catch {
    // Corrupt or plain-text legacy value — remove it and return fallback
    localStorage.removeItem(key)
    return fallback
  }
}

/**
 * Remove a key from localStorage.
 */
export const secureRemove = (key) => {
  localStorage.removeItem(key)
}

/**
 * Remove multiple keys at once.
 */
export const secureRemoveAll = (...keys) => {
  keys.forEach((k) => localStorage.removeItem(k))
}
