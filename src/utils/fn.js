// Chrome storage references
export const CONFIG = chrome.storage.sync
export const LOCAL_CONFIG = chrome.storage.local

// Utility functions
export const tl = (message, args = []) => chrome.i18n.getMessage(message, args)

const isErrorOccurred = () =>
  chrome.runtime.lastError && console.error('❌ ERROR: ' + chrome.runtime.lastError.message)

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
export const STYLE_TAG_ID = addHashSuffix('style')

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
  cleanupStyleTag(STYLE_TAG_ID)
  document.documentElement.style.removeProperty('font-family')
  document.body.style.removeProperty('font-family')
}

const cleanupStyleTag = (id) => $(`#${id}`)?.remove()

const createStyleTag = (id, content) => {
  if (content) {
    cleanupStyleTag(id)
    const styleTag = $$$('style', { innerHTML: minifyCssString(content) }, { id, type: 'text/css' })
    document.documentElement.prepend(styleTag)
  }
}

const getFontFace = (fontFaceObj) => {
  return `@font-face {font-family: ${fontFaceObj.fontFamily};src: local(${fontFaceObj.fontFamily});font-weight: ${fontFaceObj.fontWeight};display: swap;}`
}

// CSS rules generation
const getCssRules = (fontObject) => {
  let sansFont = fontObject[0]
  let monospaceFont = fontObject[1]
  const cssRules = []
  const importFonts = []

  const handleFont = (font, isMonospace = false) => {
    if (font.isGoogleFont) {
      if(isMonospace){
        importFonts.push(`family=${font.fontFamily.split(' ').join('+')}:wght@400;700`)
      }else {
        importFonts.push(`family=${font.fontFamily.split(' ').join('+')}:wght@400;500;600;700`)
      }
    } else if (font.fontFamily) {
      const normalizedFont = fixName(font.fontFamily)
      if(!isMonospace){
        cssRules.push(getFontFace({fontFamily: normalizedFont, fontWeight: 500}))
        cssRules.push(getFontFace({fontFamily: normalizedFont, fontWeight: 600}))
      }
      cssRules.push(getFontFace({fontFamily: normalizedFont, fontWeight: 400}))
      cssRules.push(getFontFace({fontFamily: normalizedFont, fontWeight: 700}))
    }
  }

  handleFont(sansFont)
  // Check for duplicate font before adding monospaceFont
  if (sansFont.fontFamily !== monospaceFont.fontFamily) {
    handleFont(monospaceFont, true)
  }

  if (importFonts.length > 0) {
    cssRules.unshift(
      `@import url('https://fonts.googleapis.com/css2?${importFonts.join('&')}&display=swap');`,
    )
  }

  const rootCssVariables = []
  if (sansFont.fontFamily){
    rootCssVariables.push(`--${SANS_CLASS}: ${fixName(sansFont.fontFamily)};`)
  }
    
  if (monospaceFont.fontFamily) {
    rootCssVariables.push(`--${MONOSPACE_CLASS}: ${fixName(monospaceFont.fontFamily)};`)
  }

  cssRules.push(`
    :root {
      ${rootCssVariables.join('')}
    }
  `)

  if (sansFont.fontFamily) {
    cssRules.push(`
      :not(${EXCLUDED_TAGS.join(',')}) {
        font-family: var(--${SANS_CLASS}) !important;
      }
    `)
  }

  return cssRules
}

const getClassContent = (fontObject) => {
  const styleTagContent = 'input,button{font-family:inherit;}'
  const sansStyleTagContent = fontObject.sansFont
    ? `:root,html,body{font-family:var(--${SANS_CLASS})!important;}`
    : ''
  const codeStyleTagContent = fontObject.monospaceFont
    ? `
    pre, code, tt, kbd, samp, var {font-family:var(--${MONOSPACE_CLASS})!important;}
    pre *, code *, tt *, kbd *, samp *, var * {font-family:var(--${MONOSPACE_CLASS})!important;}
  `
    : ''

  return styleTagContent + sansStyleTagContent + codeStyleTagContent
}

// Font replacement functions
const getFontFamily = (element) => {
  try {
    return getComputedStyle(element).fontFamily
  } catch (error) {
    console.error('❌ Error getting font family:', error);
  }

  return ''
}

const replaceFont = (element) => {
  const fontFamily = getFontFamily(element) ?? ''
  if (!fontFamily || fontFamily.length <= 1 || fontFamily.toLocaleLowerCase().includes('icon')) {
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
  elements.forEach((element) => {
    requestAnimationFrame(() => replaceFont(element))
  })
}

export const invokeReplacer = (parent = document) => {
  const elements = parent.querySelectorAll('*')
  replaceFonts(elements)
}

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

    CONFIG.get({ 'font-default': '', 'font-mono': '' }, (settings) => {
      if (simpleErrorHandler(tl('ERROR_SETTINGS_LOAD'))) return
      init(settings)
    })
  })
}

// Main initialization function
export const init = (settings) => {
  let { 'font-default': sansFont, 'font-mono': monospaceFont } = settings

  const isSansFont = sansFont && sansFont.length > 0
  let isMonospaceFont = monospaceFont && monospaceFont.length > 0

  if(!monospaceFont) {
    monospaceFont = "monospace"
    isMonospaceFont = true
  }

  if (!isSansFont && !isMonospaceFont) return cleanupStyles()

  const fontObject = [
    { fontFamily: removePrefix(sansFont), isGoogleFont: isGoogleFont(sansFont) },
    { fontFamily: removePrefix(monospaceFont), isGoogleFont: isGoogleFont(monospaceFont) },
  ]
  const cssRules = getCssRules(fontObject)
  const classContent = getClassContent(fontObject)

  createStyleTag(STYLE_TAG_ID, cssRules.join('') + classContent)

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
