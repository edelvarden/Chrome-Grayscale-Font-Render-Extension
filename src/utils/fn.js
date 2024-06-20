// Chrome storage references
export const CONFIG = chrome.storage.sync
export const LOCAL_CONFIG = chrome.storage.local

// Utility functions
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

const addHashSuffix = (prefix) => `${prefix}__${generateHash(6)}`

// Constants with unique class names
const SANS_CLASS = addHashSuffix('sans')
const MONOSPACE_CLASS = addHashSuffix('monospace')
export const STYLE_TAG_ID = addHashSuffix('style')

// Excluded tags for font replacement
const EXCLUDED_TAGS = [
  'i',
  'mat-icon',
  'gf-load-icon-font',
  'textarea',
  'span',
  'div',
  'button',
  'li',
  'a',
]

// Cleanup styles
export const cleanupStyles = () => {
  toggleStyleTag(STYLE_TAG_ID, false)
  document.documentElement.style.removeProperty('font-family')
  document.body.style.removeProperty('font-family')
}

const toggleStyleTag = (styleId, enable) => {
  const styleTag = document.getElementById(styleId)
  if (styleTag) {
    styleTag.disabled = !enable
  }
}

const createOrUpdateStyleTag = (id, content) => {
  let styleTag = document.getElementById(id)
  if (styleTag) {
    // Update the content of the existing style tag
    styleTag.innerHTML = content
    styleTag.disabled = false
  } else {
    // Create a new style tag if it doesn't exist
    styleTag = $$$('style', { innerHTML: content }, { id, type: 'text/css' })
    // document.head.prepend(styleTag)
    document.documentElement.prepend(styleTag)
  }
}

// Helper function to generate font face rule for each weight
const getFontFace = (fontFamily, weights) => {
  const normalizedFont = fixName(fontFamily)
  let fontStyle = 'normal'

  return weights
    .map((weight) => {
      if (weight === 700) {
        fontStyle = 'bolder'
      }
      return `
          @font-face {
            font-style: ${fontStyle};
            font-family: ${normalizedFont};
            src: local(${normalizedFont});
            font-display: swap;
          }
        `
    })
    .join('')
}

const getCssRules = (fontObject) => {
  const [sansFont, monospaceFont] = fontObject
  const cssRules = []
  const importFonts = []

  const handleFont = (font, isMonospace = false) => {
    const weights = isMonospace ? [400, 700] : [400, 700]
    if (font.isGoogleFont) {
      importFonts.push(`family=${font.fontFamily.split(' ').join('+')}:wght@${weights.join(';')}`)
    } else if (font.fontFamily) {
      cssRules.push(getFontFace(font.fontFamily, weights))
    }
  }

  handleFont(sansFont)
  if (sansFont.fontFamily !== monospaceFont.fontFamily) {
    handleFont(monospaceFont, true)
  }

  if (importFonts.length > 0) {
    cssRules.unshift(
      `@import url('https://fonts.googleapis.com/css2?${importFonts.join('&')}&display=swap');`,
    )
  }

  const rootCssVariables = []
  if (sansFont.fontFamily) {
    rootCssVariables.push(`--${SANS_CLASS}: ${fixName(sansFont.fontFamily)};`)
  }

  if (monospaceFont.fontFamily) {
    rootCssVariables.push(`--${MONOSPACE_CLASS}: ${fixName(monospaceFont.fontFamily)};`)
  }

  cssRules.push(`:root {${rootCssVariables.join('')}}`)

  return cssRules.join('')
}

const getClassContent = () => {
  let classContent = `:not(${EXCLUDED_TAGS.join(',')}) {font-family: var(--${SANS_CLASS}) !important;}`

  classContent += `html {font-family: var(--${SANS_CLASS}) !important;}`
  classContent += `body {font-family: var(--${SANS_CLASS}) !important;}`
  classContent += `
    pre, code, tt, kbd, samp, var {font-family: var(--${MONOSPACE_CLASS}) !important;}
    pre *, code *, tt *, kbd *, samp *, var * {font-family: var(--${MONOSPACE_CLASS}) !important;}
  `

  return classContent
}

// Font replacement functions
const getFontFamily = (element) => {
  try {
    return getComputedStyle(element).fontFamily
  } catch (error) {
    console.error('❌ Error getting font family:', error)
    return ''
  }
}

const replaceFont = (element) => {
  const fontFamily = getFontFamily(element)
  if (!fontFamily || fontFamily.length <= 1 || fontFamily.toLowerCase().includes('icon')) {
    return false
  }

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

const replaceFonts = (elements) => {
  elements.forEach((element) => replaceFont(element))
}

export const invokeReplacer = (parent = document) => {
  const elements = parent.querySelectorAll('*')
  replaceFonts(elements)
}

export const invokeObserver = () => {
  const observerOptions = { childList: true, subtree: true }
  const observer = new MutationObserver(() => invokeReplacer(document))
  observer.observe(document, observerOptions)
}

export const preview = async () => {
  try {
    const { off } = await new Promise((resolve) => LOCAL_CONFIG.get({ off: false }, resolve))
    if (simpleErrorHandler(tl('ERROR_SETTINGS_LOAD')) || off) return

    const settings = await new Promise((resolve) =>
      CONFIG.get({ 'font-default': '', 'font-mono': '' }, resolve),
    )
    if (simpleErrorHandler(tl('ERROR_SETTINGS_LOAD'))) return

    init(settings)
  } catch (error) {
    console.error('❌ Error in preview function:', error)
  }
}

export const init = (settings) => {
  let { 'font-default': sansFont, 'font-mono': monospaceFont } = settings

  const isSansFont = sansFont && sansFont.length > 0
  let isMonospaceFont = monospaceFont && monospaceFont.length > 0

  if (!monospaceFont) {
    monospaceFont = 'monospace'
    isMonospaceFont = true
  }

  if (!isSansFont && !isMonospaceFont) return cleanupStyles()

  const fontObject = [
    { fontFamily: removePrefix(sansFont), isGoogleFont: isGoogleFont(sansFont) },
    { fontFamily: removePrefix(monospaceFont), isGoogleFont: isGoogleFont(monospaceFont) },
  ]
  const cssRules = getCssRules(fontObject)
  const classContent = getClassContent()

  createOrUpdateStyleTag(STYLE_TAG_ID, cssRules + classContent)

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

// Helper function to check if a font is a Google font
const isGoogleFont = (fontId) => fontId.startsWith('GF-')
const removePrefix = (fontId) => fontId.replace('GF-', '')
