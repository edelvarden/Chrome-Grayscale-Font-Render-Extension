// Chrome storage references
export const CONFIG = chrome.storage.sync
export const LOCAL_CONFIG = chrome.storage.local

// Utility functions
export const tl = (message, args = []) => chrome.i18n.getMessage(message, args)
const isErrorOccurred = () =>
  chrome.runtime.lastError && console.log('❌ ERROR: ' + chrome.runtime.lastError.message)
export const simpleErrorHandler = (message) => isErrorOccurred() && alert(message)
export const $ = (selector, context = document) => context.querySelector(selector)
export const $$ = (selector, context = document) => context.querySelectorAll(selector)

// Element creation function
export const $$$ = (tag, attributes = {}, customAttributes = {}, css = {}) => {
  const element = document.createElement(tag)
  Object.assign(element, attributes)
  Object.entries(customAttributes).forEach(([key, value]) => element.setAttribute(key, value))
  Object.assign(element.style, css)
  return element
}

// Font name normalization
const fixName = (name) =>
  /^(?:serif|sans-serif|cursive|fantasy|monospace)$/.test(name.replace(/['"]/g, ''))
    ? name
    : `"${name.replace(/['"]/g, '')}"`

// CSS string minification
const minifyCssString = (cssString) =>
  cssString
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*(:|;|\{|\})\s*/g, '$1')
    .replace(/, /g, ',')
    .replace(/ \( /g, '(')
    .replace(/ \) /g, ')')
    .trim()

// Hash generation
const generateHash = (length) => {
  if (!Number.isInteger(length) || length <= 0)
    throw new Error('❌ Invalid length for hash generation:', length)
  const randomSymbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from(
    { length },
    () => randomSymbols[Math.floor(Math.random() * randomSymbols.length)],
  ).join('')
}

const addHashSuffix = (prefix) => `${prefix}__${generateHash(6)}`

// Constants with unique class names
const SANS_CLASS = addHashSuffix('sans')
const MONOSPACE_CLASS = addHashSuffix('monospace')
export const STYLE_TAG1_ID = addHashSuffix('style1')
export const STYLE_TAG2_ID = addHashSuffix('style2')

// Excluded tags for font replacement
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

// Cleanup styles
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
    position === 'before'
      ? document.documentElement.prepend(styleTag)
      : document.documentElement.appendChild(styleTag)
  }
}

// CSS rules generation
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
  // const sansFallbackString = "sans-serif";
  // const monospaceFallbackString = "monospace";
  // const emojiFallbackString = "'Apple Color Emoji', 'Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'";
  if (isSansFont) rootCssVariables.push(`--${SANS_CLASS}: ${fixName(sansFont)};`)
  if (isMonospaceFont) rootCssVariables.push(`--${MONOSPACE_CLASS}: ${fixName(monospaceFont)};`)
  cssRules.push(`
    :root {
      ${rootCssVariables.join('')}
      font-synthesis: weight;
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

// Font replacement functions
const getFontFamily = (element) => getComputedStyle(element).fontFamily
const replaceFont = (element) => {
  const fontFamily = getFontFamily(element)
  if (!fontFamily) return false

  if (/monospace/.test(fontFamily)) {
    element.style.setProperty('font-family', `var(--${MONOSPACE_CLASS})`, 'important')
    return true
  }
  if (/sans-serif|serif/.test(fontFamily)) {
    element.style.setProperty('font-family', `var(--${SANS_CLASS})`, 'important')
    return true
  }
  return false
}
const replaceFonts = (elements) => elements.forEach(replaceFont)

export const invokeReplacer = (parent = document) =>
  replaceFonts(parent.querySelectorAll('pre, textarea, span, li, a, div, button'))

// Mutation observer
export const invokeObserver = () => {
  const observerOptions = { childList: true, subtree: true }
  const observer = new MutationObserver(() => invokeReplacer(document))

  observer.observe(document, observerOptions)
}

// Preview function
export const preview = () => {
  LOCAL_CONFIG.get({ off: false }, (a) => {
    if (simpleErrorHandler(tl('ERROR_SETTINGS_LOAD')) || a.off) return

    CONFIG?.get({ 'font-default': '', 'font-mono': '' }, (settings) => {
      if (simpleErrorHandler(tl('ERROR_SETTINGS_LOAD'))) return
      init(settings)
    })
  })
}

// Main initialization function
export const init = (settings) => {
  const { 'font-default': sansFont, 'font-mono': monospaceFont } = settings
  const isSansFont = sansFont && sansFont.length > 0
  const isMonospaceFont = monospaceFont && monospaceFont.length > 0

  if (!isSansFont && !isMonospaceFont) return cleanupStyles()

  const cssRules = getCssRules(isSansFont, isMonospaceFont, sansFont, monospaceFont)
  const classContent = getClassContent(isSansFont, isMonospaceFont)

  createStyleTag(STYLE_TAG1_ID, cssRules.join(''), 'before')
  createStyleTag(STYLE_TAG2_ID, classContent, 'after')

  document.documentElement.style.setProperty(
    'font-family',
    isSansFont ? `var(--${SANS_CLASS})` : '',
    'important',
  )
  document.body.style.setProperty(
    'font-family',
    isSansFont ? `var(--${SANS_CLASS})` : '',
    'important',
  )
}
