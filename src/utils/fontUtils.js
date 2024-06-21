import { $$$ } from '@utils/domUtils'
import { CONFIG, LOCAL_CONFIG } from '@utils/storage'
import { addHashSuffix, fixName, simpleErrorHandler, tl } from '@utils/stringUtils'

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
    styleTag = $$$('style', { innerHTML: content }, { id })
    document.head.prepend(styleTag)
    // document.documentElement.prepend(styleTag)
  }
}

const getFontFace = (fontFamily, weights) => {
  const normalizedFont = fixName(fontFamily)

  return weights
    .map((weight) => {
      return `
          @font-face {
            font-family: ${normalizedFont};
            font-style: normal;
            font-weight: ${weight};
            font-display: swap;
            src: local(${normalizedFont});
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
    }
    // else if (font.fontFamily) {
    //   cssRules.push(getFontFace(font.fontFamily, weights))
    // }
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
    console.log(getComputedStyle(element).font)
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

export const invokeReplacer = () => {
  const elements = document.querySelectorAll('*')
  replaceFonts(elements)
}

const debounce = (func, delay) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

const debouncedReplacer = debounce(invokeReplacer, 200)

export const invokeObserver = () => {
  const observerOptions = { childList: true, subtree: true }
  const observer = new MutationObserver(debouncedReplacer)
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
