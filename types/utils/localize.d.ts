type GetMessageArgs = string | string[] | undefined
/**
 * Retrieves a localized message using the specified message key and arguments from _locales directory.
 * @param {string} message - The message key.
 * @param {GetMessageArgs} [args=[]] - The arguments for the message.
 * @returns {string} The localized message.
 */
export declare const tl: (message: string, args?: GetMessageArgs) => string
/**
 * Initializes the i18n processing for elements with specific attributes.
 */
export declare const init: () => void
export {}
