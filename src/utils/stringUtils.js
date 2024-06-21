export const tl = (message, args = []) => chrome.i18n.getMessage(message, args)

const isErrorOccurred = () =>
  chrome.runtime.lastError && console.error('❌ ERROR:', chrome.runtime.lastError.message)

export const simpleErrorHandler = (message) => {
  if (isErrorOccurred()) {
    alert(message)
    return true
  }
  return false
}

// Font name normalization
export const fixName = (name) =>
  /^(?:serif|sans-serif|cursive|fantasy|monospace)$/.test(name.replace(/['"]/g, ''))
    ? name
    : `"${name.replace(/['"]/g, '')}"`

// Hash generation
const generateHash = (length) => {
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error(`❌ Invalid length for hash generation: ${length}`)
  }
  const randomSymbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from(
    { length },
    () => randomSymbols[Math.floor(Math.random() * randomSymbols.length)],
  ).join('')
}

export const addHashSuffix = (prefix) => `${prefix}__${generateHash(6)}`
