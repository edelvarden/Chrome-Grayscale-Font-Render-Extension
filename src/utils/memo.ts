/**
 * Memoizes a function to cache the results of expensive function calls with a maximum cache size.
 * @param {Function} fn The function to memoize.
 * @param {number} [maxSize=10] The maximum number of entries in the cache.
 * @returns {Function & { clearCache: () => void }} The memoized function with a clearCache method.
 */
export const memo = <T extends (...args: any[]) => any>(
  fn: T,
  maxSize: number = 10,
): T & { clearCache: () => void } => {
  const cache = new Map<string, ReturnType<T>>()
  const keysQueue: string[] = []

  const memoized = ((...args: Parameters<T>) => {
    const key = JSON.stringify(args)

    // Move the key to the end of the queue (MRU strategy)
    if (keysQueue.includes(key)) {
      keysQueue.splice(keysQueue.indexOf(key), 1)
    }
    keysQueue.push(key)

    if (!cache.has(key)) {
      // Check if cache size exceeds maxSize
      if (cache.size >= maxSize) {
        const oldestKey = keysQueue.shift()
        if (oldestKey) {
          cache.delete(oldestKey)
        }
      }
      cache.set(key, fn(...args))
    }

    return cache.get(key)!
  }) as T & { clearCache: () => void }

  memoized.clearCache = () => {
    cache.clear()
    keysQueue.length = 0
  }

  return memoized
}
