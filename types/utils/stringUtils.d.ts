/**
 * Checks if an error has occurred in the Chrome runtime and logs it if so.
 * @returns {boolean} true if an error occurred, false otherwise.
 */
export declare const isErrorOccurred: () => boolean
/**
 * Normalizes a font name by ensuring it conforms to certain CSS naming rules.
 * @param {string} fontFamily - The font name to normalize (eg., Open Sans, 'Open Sans', "Open Sans").
 * @returns {string} The normalized font name (eg., "Open Sans").
 */
export declare const fixName: (fontFamily: string) => string
/**
 * Adds a hashed suffix to a prefix string to create a unique identifier.
 * @param {string} prefix - The prefix to add the hash suffix to (eg., prefix).
 * @returns {string} The prefixed string with a hashed suffix (eg., prefix__aoKdiK).
 */
export declare const addHashSuffix: (prefix: string) => string
