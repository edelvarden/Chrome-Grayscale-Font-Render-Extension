/**
 * Normalizes a font name by ensuring it conforms to certain CSS naming rules.
 * @param {string} fontFamily - The font name to normalize (e.g., Open Sans, 'Open Sans', "Open Sans").
 * @returns {string} The normalized font name. If the name is a standard CSS font-family keyword, it is returned as-is.
 */
export const fixName = (fontFamily: string): string => {
  if (!fontFamily) return ''

  // Remove single or double quotes around the font name
  const cleanedName = fontFamily.trim().replace(/^['"]|['"]$/g, '')

  // Return empty string if the cleaned name is still empty
  if (!cleanedName) {
    return ''
  }

  // Return the cleaned name as-is if it's a standard CSS font-family keyword
  if (/^(?:serif|sans-serif|cursive|fantasy|monospace)$/i.test(cleanedName)) {
    return cleanedName
  }

  // Return the cleaned name enclosed in quotes
  return `"${cleanedName}"`
}

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

/**
 * Adds a hashed suffix to a prefix string to create a unique identifier.
 * @param {string} prefix - The prefix to add the hash suffix to (eg., prefix).
 * @returns {string} The prefixed string with a hashed suffix (eg., prefix__aoKdiK).
 */
export const addHashSuffix = (prefix: string): string => `${prefix}__${generateHash(6)}`
