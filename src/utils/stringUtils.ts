const isErrorOccurred = (): boolean => {
  if (chrome.runtime.lastError) {
    console.error('❌ ERROR:', chrome.runtime.lastError.message)
    return true
  }
  return false
}

export const simpleErrorHandler = (message: string): boolean => {
  if (isErrorOccurred()) {
    alert(message)
    return true
  }
  return false
}

// Font name normalization
export const fixName = (name: string): string =>
  /^(?:serif|sans-serif|cursive|fantasy|monospace)$/.test(name.replace(/['"]/g, ''))
    ? name
    : `"${name.replace(/['"]/g, '')}"`

const generateHash = (length: number): string => {
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error(`❌ Invalid length for hash generation: ${length}`)
  }
  const randomSymbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from(
    { length },
    () => randomSymbols[Math.floor(Math.random() * randomSymbols.length)],
  ).join('')
}

export const addHashSuffix = (prefix: string): string => `${prefix}__${generateHash(6)}`
