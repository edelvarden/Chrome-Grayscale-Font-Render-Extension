/**
 * Memoizes a function to cache the results of expensive function calls with a maximum cache size.
 * @param {Function} fn The function to memoize.
 * @param {number} [maxSize=10] The maximum number of entries in the cache.
 * @returns {Function & { clearCache: () => void }} The memoized function with a clearCache method.
 */
export declare const memo: <T extends (...args: any[]) => any>(
  fn: T,
  maxSize?: number,
) => T & {
  clearCache: () => void
}
