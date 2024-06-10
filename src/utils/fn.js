/**
 * A reference to the Chrome sync storage API.
 *
 * @type {chrome.storage.sync}
 */
export const CONFIG = chrome.storage.sync
/**
 * A reference to the Chrome local storage API.
 *
 * @type {chrome.storage.local}
 */
export const LOCAL_CONFIG = chrome.storage.local

/**
 * Translates a string to the current language.
 *
 * @param {string} message The string to translate.
 * @param {array} [args=[]] An array of arguments to pass to the translation function.
 * @returns {string} The translated string.
 */
export const tl = (message, args = []) => chrome.i18n.getMessage(message, args)

/**
 * Checks if an error has occurred.
 *
 * @returns {boolean} True if an error has occurred, false otherwise.
 */
const isErrorOccurred = () =>
  chrome.runtime.lastError && console.log('ERROR: ' + chrome.runtime.lastError.message)

export const simpleErrorHandler = (message) => isErrorOccurred() && alert(message)

/**
 * Selects a single element from the document.
 *
 * @param {string} selector The CSS selector for the element to select.
 * @param {Element} [context=document] The element to search within.
 * @returns {Element} The selected element, or `null` if no element is found.
 */
export const $ = (selector, context = document) => context.querySelector(selector)
/**
 * Selects all elements from the document that match the given CSS selector.
 *
 * @param {string} selector The CSS selector for the elements to select.
 * @param {Element} [context=document] The element to search within.
 * @returns {NodeList} A list of the selected elements.
 */
export const $$ = (selector, context = document) => context.querySelectorAll(selector)

/**
 * Creates a new element from the given HTML tag and attributes.
 *
 * @param {string} tag The HTML tag for the element to create.
 * @param {object} [attributes={}] An object of attributes to set on the element.
 * @param {object} [customAttributes={}] An object of custom attributes to set on the element.
 * @param {object} [css={}] An object of CSS properties to set on the element.
 * @returns {Element} The created element.
 */
export const $$$ = (tag, attributes = {}, customAttributes = {}, css = {}) => {
  const element = document.createElement(tag)
  Object.assign(element, attributes)
  Object.entries(customAttributes).forEach(([key, value]) => element.setAttribute(key, value))
  Object.assign(element.style, css)
  return element
}

/**
 * Normalizes a font name for CSS styles.
 *
 * @param {string} name The font name to normalize.
 * @returns {string} The normalized font name.
 */
const fixName = (a) => {
  a = a.replace(/['"]/g, '')
  return /^(?:serif|sans-serif|cursive|fantasy|monospace)$/.test(a) ? a : `"${a}"`
}

/**
 * Minifies a CSS string.
 *
 * @param {string} cssString The CSS string to minify.
 * @returns {string} The minified CSS string.
 */
const minifyCssString = (cssString) =>
  cssString
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*(:|;|\{|\})\s*/g, '$1')
    .replace(/, /g, ',')
    .replace(/ \( /g, '(')
    .replace(/ \) /g, ')')
    .trim()

/**
 * Generates a random hash code of the given length.
 *
 * @param {number} length The length of the hash code to generate.
 * @returns {string} A random hash code of the given length.
 */
const generateHash = (length) => {
  if (!Number.isInteger(length) || length <= 0)
    throw new Error('Invalid length for hash generation:', length)

  const randomSymbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from(
    { length },
    () => randomSymbols[Math.floor(Math.random() * randomSymbols.length)],
  ).join('')
}

const addHashSuffix = (prefix) => `${prefix}__${generateHash(6)}`
/**
 * A reference to the unique class name for sans-serif font.
 */
const SANS_CLASS = addHashSuffix('sans')

/**
 * A reference to the unique class name for monospace font.
 */
const MONOSPACE_CLASS = addHashSuffix('monospace')

/**
 * A reference to the unique id for main style tag.
 */
export const STYLE_TAG1_ID = addHashSuffix('style1')

/**
 * A reference to the unique id for secondary style tag.
 */
export const STYLE_TAG2_ID = addHashSuffix('style2')

/**
 * A reference to excluded tags for main replacement function.
 */
const EXCLUDED_TAGS = [
  // Iconic font selectors
  'i',
  'mat-icon',
  'gf-load-icon-font',

  // Monospace
  'pre', // (optional) can be not monospaced
  'textarea', // (optional) can be not monospaced

  // Additional exclusion (for observer scanning)
  'span',
  'div',
  'button',
  'li',
  'a',
]

export const init = (settings) => {
  const { 'font-default': sansFont, 'font-mono': monospaceFont } = settings
  const isSansFont = sansFont && sansFont.length > 0
  const isMonospaceFont = monospaceFont && monospaceFont.length > 0

  if (!isSansFont && !isMonospaceFont) {
    cleanupStyles()
    return
  }

  const cssRules = getCssRules(isSansFont, isMonospaceFont, sansFont, monospaceFont)
  const classContent = getClassContent(isSansFont, isMonospaceFont)

  createStyleTag(STYLE_TAG1_ID, cssRules.join(''), 'before')
  createStyleTag(STYLE_TAG2_ID, classContent, 'after')

  if (isSansFont) {
    document.documentElement.style.setProperty('font-family', `var(--${SANS_CLASS})`, 'important')
    document.body.style.setProperty('font-family', `var(--${SANS_CLASS})`, 'important')
  } else {
    document.documentElement.style.removeProperty('font-family')
    document.body.style.removeProperty('font-family')
  }
}

export const cleanupStyles = () => {
  cleanupStyleTag(STYLE_TAG1_ID)
  cleanupStyleTag(STYLE_TAG2_ID)
  document.documentElement.style.removeProperty('font-family')
  document.body.style.removeProperty('font-family')
}

const cleanupStyleTag = (id) => $(`#${id}`)?.remove()

const createStyleTag = (id, content, position = 'before') => {
  if (content) {
    cleanupStyleTag(id)
    const styleTag = $$$('style', { innerHTML: minifyCssString(content) }, { id, type: 'text/css' })

    if (position === 'before') {
      document.documentElement.prepend(styleTag)
    } else if (position === 'after') {
      document.documentElement.appendChild(styleTag)
    } else {
      throw Error('Incorrect position value')
    }
  }
}

const getCssRules = (isSansFont, isMonospaceFont, sansFont, monospaceFont) => {
  const cssRules = []

  if (isSansFont) {
    const normalizedDefaultFont = fixName(sansFont)
    cssRules.push(`
      @font-face {
        font-style: normal;
        font-family: ${normalizedDefaultFont};
        src: local(${normalizedDefaultFont});
        display: swap;
      }
      @font-face {
        font-style: bolder;
        font-family: ${normalizedDefaultFont};
        src: local(${normalizedDefaultFont});
        display: swap;
      }
    `)
  }

  const rootCssVariables = []
  if (isSansFont) rootCssVariables.push(`--${SANS_CLASS}: ${fixName(sansFont)};`)
  if (isMonospaceFont) rootCssVariables.push(`--${MONOSPACE_CLASS}: ${fixName(monospaceFont)};`)
  cssRules.push(`
    :root {
      ${rootCssVariables.join('\n')}
    }
  `)

  if (isSansFont) {
    cssRules.push(`
      :not(${EXCLUDED_TAGS.join(',')}) {
        font-family: var(--${SANS_CLASS}) !important;
      }
    `)
  }

  return cssRules
}

const getClassContent = (isSansFont, isMonospaceFont) => {
  const styleTagContent = '*{font-family:inherit;}'
  const sansStyleTagContent = isSansFont
    ? `:root,html,body{font-family:var(--${SANS_CLASS})!important;}`
    : ''
  const codeStyleTagContent = isMonospaceFont
    ? `
      code, tt, kbd, samp, var {font-family:var(--${MONOSPACE_CLASS})!important;}
      code *, tt *, kbd *, samp *, var * {font-family:var(--${MONOSPACE_CLASS})!important;}
    `
    : ''

  return styleTagContent + sansStyleTagContent + codeStyleTagContent
}

const getFontFamily = (element) => getComputedStyle(element).fontFamily

const replaceFont = (element) => {
  const fontFamily = getFontFamily(element)
  if (!fontFamily) return

  if (/sans-serif|serif/.test(fontFamily)) {
    element.style.setProperty('font-family', `var(--${SANS_CLASS})`, 'important')
  } else if (/monospace/.test(fontFamily)) {
    element.style.setProperty('font-family', `var(--${MONOSPACE_CLASS})`, 'important')
  }
}

const replaceFonts = (elements) => elements.forEach(replaceFont)

export const invokeReplacer = (parent = document) =>
  replaceFonts(parent.querySelectorAll('pre, textarea, span, li, a, div, button'))

export const invokeObserver = () => {
  const observerOptions = { childList: true, subtree: true }
  const observer = new MutationObserver(() => invokeReplacer(document))

  observer.observe(document, observerOptions)
}

const getVariable = (name) => getComputedStyle(document.documentElement).getPropertyValue(name)

export const preview = () => {
  LOCAL_CONFIG.get({ off: false }, function (a) {
    if (simpleErrorHandler(tl('error_settings_load')) || a.off) {
      return
    }

    CONFIG?.get(
      {
        'font-default': '',
        'font-mono': '',
      },
      function (settings) {
        if (simpleErrorHandler(tl('error_settings_load'))) {
          return
        }

        init(settings)
      },
    )
  })
}
