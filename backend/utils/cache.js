/**
 * Simple in-memory TTL cache.
 * Stores values with an expiry time.
 * No external dependencies — works in any Node environment.
 */

const store = new Map();

/**
 * Set a value in the cache.
 * @param {string} key
 * @param {*} value
 * @param {number} ttlSeconds - Time to live in seconds (default: 5 minutes)
 */
export const cacheSet = (key, value, ttlSeconds = 300) => {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  store.set(key, { value, expiresAt });
};

/**
 * Get a value from the cache.
 * Returns null if key is missing or expired.
 * @param {string} key
 * @returns {*|null}
 */
export const cacheGet = (key) => {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
};

/**
 * Delete a specific key from the cache.
 * @param {string} key
 */
export const cacheDel = (key) => {
  store.delete(key);
};

/**
 * Clear the entire cache.
 */
export const cacheClear = () => {
  store.clear();
};

/**
 * Returns info about the cache (for debugging).
 */
export const cacheStats = () => ({
  size: store.size,
  keys: [...store.keys()],
});
