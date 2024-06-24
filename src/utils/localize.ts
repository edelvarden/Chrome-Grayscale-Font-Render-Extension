import { $$ } from './domUtils'

type GetMessageArgs = string | string[] | undefined

/**
 * Retrieves a localized message using the specified message key and arguments from _locales directory.
 * @param {string} message - The message key.
 * @param {GetMessageArgs} [args=[]] - The arguments for the message.
 * @returns {string} The localized message.
 */
export const tl = (message: string, args: GetMessageArgs = []): string => {
  try {
    return chrome.i18n.getMessage(message, args) || message
  } catch (error) {
    console.error(`Error retrieving message for key: ${message}`, error)
    return message
  }
}

/**
 * Executes a callback function when the document is fully loaded.
 * @param {() => void} callback - The callback function to execute.
 */
const onDocumentReady = (callback: () => void): void => {
  if (document.readyState === 'complete') {
    window.setTimeout(callback, 0)
  } else {
    window.addEventListener('DOMContentLoaded', callback, false)
  }
}

/**
 * Processes elements with the specified i18n attribute.
 * @param {string} attribute - The i18n attribute to process (e.g., 'i18n', 'i18n_title', 'i18n_value').
 * @param {(element: Element, key: string) => void} processor - The function to process each element.
 */
const processI18nElements = (
  attribute: string,
  processor: (element: Element, key: string) => void,
): void => {
  const elements = $$(`[${attribute}]`)
  elements.forEach((element) => {
    const key = element.getAttribute(attribute)
    if (key) {
      processor(element, key)
      element.removeAttribute(attribute)
    }
  })
}

/**
 * Initializes the i18n processing for elements with specific attributes.
 */
export const init = (): void => {
  onDocumentReady(() => {
    processI18nElements('i18n', (element, key) => {
      element.innerHTML = tl(key)
    })
    processI18nElements('i18n_title', (element, key) => {
      element.setAttribute('title', tl(key))
    })
    processI18nElements('i18n_value', (element, key) => {
      element.setAttribute('value', tl(key))
    })
  })
}
