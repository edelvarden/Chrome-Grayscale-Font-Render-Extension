type DebounceFunction = (...args: any[]) => void

export const debounce = (func: DebounceFunction, delay: number): DebounceFunction => {
  let timer: number
  return (...args: any[]) => {
    clearTimeout(timer)
    timer = window.setTimeout(() => {
      func(...args)
    }, delay)
  }
}