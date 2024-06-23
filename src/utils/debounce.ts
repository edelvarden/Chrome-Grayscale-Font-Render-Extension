type DebounceFunction = (...args: any[]) => void

/**
 * Debounce function to delay execution
 * @param func - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns Debounced function
 */
export const debounce = (func: DebounceFunction, delay: number): DebounceFunction => {
  let timer: number
  return (...args: any[]) => {
    clearTimeout(timer)
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
  let calledFirstTime = false

  return (...args: any[]) => {
    if (!calledFirstTime) {
      // Execute the function immediately for the first call
      func(...args)
      calledFirstTime = true
      return
    }

    // Use the classic debounce function for subsequent calls
    const debouncedFunc = debounce(func, delay)
    debouncedFunc(...args)
  }
}