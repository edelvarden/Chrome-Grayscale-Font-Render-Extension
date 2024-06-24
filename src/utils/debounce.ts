type DebounceFunction = (...args: any[]) => void

/**
 * Debounce function to delay execution
 * @param func - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns Debounced function
 */
export const debounce = (func: DebounceFunction, delay: number): DebounceFunction => {
  let timer: number | undefined
  return (...args: any[]) => {
    if (timer) clearTimeout(timer)
    timer = window.setTimeout(() => {
      func(...args)
    }, delay)
  }
}

/**
 * Debounce function that executes immediately on the first call and then debounces subsequent calls
 * @param func - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns Debounced function with immediate first call
 */
export const debounceWithFirstCall = (func: DebounceFunction, delay: number): DebounceFunction => {
  let isFirstCall = true
  const debouncedFunc = debounce(func, delay)

  return (...args: any[]) => {
    if (isFirstCall) {
      func(...args)
      isFirstCall = false
    } else {
      debouncedFunc(...args)
    }
  }
}
