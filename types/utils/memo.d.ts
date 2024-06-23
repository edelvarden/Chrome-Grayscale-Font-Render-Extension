/**
 * Memoizes a function to cache the results of expensive function calls.
 * @param {Function} fn The function to memoize.
 * @returns {Function} The memoized function.
 */
export declare const memo: <T extends (...args: any[]) => any>(fn: T) => T
