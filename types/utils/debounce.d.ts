type DebounceFunction = (...args: any[]) => void
/**
 * Debounce function to delay execution
 * @param func - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns Debounced function
 */
export declare const debounce: (func: DebounceFunction, delay: number) => DebounceFunction
/**
 * Debounce function that executes immediately on the first call and then debounces subsequent calls
 * @param func - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns Debounced function with immediate first call
 */
export declare const debounceWithFirstCall: (
  func: DebounceFunction,
  delay: number,
) => DebounceFunction
export {}
