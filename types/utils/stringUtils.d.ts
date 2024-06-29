/**
 * Normalizes a font name by ensuring it conforms to certain CSS naming rules.
 * @param {string} fontFamily - The font name to normalize (eg., Open Sans, 'Open Sans', "Open Sans").
 * @returns {string} The normalized font name (eg., "Open Sans").
 */
export declare const fixName: (fontFamily: string) => string;
/**
 * Adds a hashed suffix to a prefix string to create a unique identifier.
 * @param {string} prefix - The prefix to add the hash suffix to (eg., prefix).
 * @returns {string} The prefixed string with a hashed suffix (eg., prefix__aoKdiK).
 */
export declare const addHashSuffix: (prefix: string) => string;
