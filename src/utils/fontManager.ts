import { debounceWithFirstCall } from './debounce'
import { $, $$, $$$ } from './domUtils'
import { memo } from './memo'
import { CONFIG, LOCAL_CONFIG } from './storage'
import { addHashSuffix, fixName } from './stringUtils'

// Constants with unique names
const SANS_CLASS = addHashSuffix('sans')
const MONOSPACE_CLASS = addHashSuffix('monospace')
const STYLE_TAG_ID = addHashSuffix('style')

let isSansFont = false
let isMonospaceFont = false

// Excluded tags for font replacement
const EXCLUDED_TAGS: string[] = [
  'i',
  'mat-icon',
  'gf-load-icon-font',
  'textarea',
  'span',
  'div',
  'button',
  'li',
  'a',
  'code',
  'pre',
]

// Cleanup styles
export const cleanupStyles = (): void => {
  toggleStyleTag(STYLE_TAG_ID, false)
  document.documentElement.style.removeProperty('font-family')
  document.body.style.removeProperty('font-family')
}

export const toggleStyleTag = (styleId: string, enable: boolean): void => {
  const styleTag = $(`#${styleId}`) as HTMLStyleElement | null
  if (styleTag) {
    styleTag.disabled = !enable
  }
}

export const createOrUpdateStyleTag = (id: string, content: string): void => {
  let styleTag = $(`#${id}`) as HTMLStyleElement | null
  if (styleTag) {
    if (styleTag.innerHTML !== content) {
      styleTag.innerHTML = content
    }
    styleTag.disabled = false
  } else {
    styleTag = $$$('style', { innerHTML: content, id: id }) as HTMLStyleElement
    document.head.prepend(styleTag)
  }
}

interface FontObject {
  fontFamily: string
  isGoogleFont: boolean
}

const getCssRules = memo((fontObject: FontObject[]): string => {
  const [sansFont, monospaceFont] = fontObject
  const cssRules: string[] = []
  const importFonts: string[] = []

  const handleFont = (font: FontObject, isMonospace: boolean = false): void => {
    const weights = isMonospace ? [400, 700] : [400, 700]
    if (font.isGoogleFont) {
      importFonts.push(`family=${font.fontFamily.split(' ').join('+')}:wght@${weights.join(';')}`)
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

  const rootCssVariables: string[] = []
  if (sansFont.fontFamily) {
    rootCssVariables.push(`--${SANS_CLASS}: ${fixName(sansFont.fontFamily)}, sans-serif;`)
  }

  if (monospaceFont.fontFamily) {
    rootCssVariables.push(`--${MONOSPACE_CLASS}: ${fixName(monospaceFont.fontFamily)}, monospace;`)
  }

  cssRules.push(`:root {${rootCssVariables.join('')}}`)

  return cssRules.join('')
})

const getClassContent = memo((fontObject: FontObject[]): string => {
  const [sansFont, monospaceFont] = fontObject

  let classContent = sansFont.fontFamily
    ? `:not(${EXCLUDED_TAGS.join(',')}) {font-family: var(--${SANS_CLASS}) !important;}`
    : ''

  classContent += sansFont.fontFamily ? `html {font-family: var(--${SANS_CLASS}) !important;}` : ''
  classContent += sansFont.fontFamily ? `body {font-family: var(--${SANS_CLASS}) !important;}` : ''
  classContent += monospaceFont.fontFamily
    ? `
    pre, code, tt, kbd, samp, var {font-family: var(--${MONOSPACE_CLASS}) !important;}
    pre *, code *, tt *, kbd *, samp *, var * {font-family: var(--${MONOSPACE_CLASS}) !important;}
  `
    : ''

  return classContent
})

const getFontFamily = (element: Element): string => {
  try {
    return getComputedStyle(element).fontFamily
  } catch (error) {
    console.error('❌ Error getting font family:', error)
    return ''
  }
}

const isReplaceableFont = (fontFamily: string): boolean => {
  if (!fontFamily) return false
  if (fontFamily.split(',').length <= 1) return false
  if (fontFamily.toLowerCase().includes('icon')) return false

  return true
}

const replaceFont = (element: HTMLElement): boolean => {
  const fontFamily = getFontFamily(element)

  if (isReplaceableFont(fontFamily)) {
    const replacement =
      isMonospaceFont && /monospace/.test(fontFamily)
        ? `var(--${MONOSPACE_CLASS})`
        : isSansFont && /sans-serif|serif/.test(fontFamily)
          ? `var(--${SANS_CLASS})`
          : null

    if (replacement) {
      element.style.setProperty('font-family', replacement, 'important')
      return true
    }
  }

  return false
}

const replaceFonts = (elements: NodeListOf<HTMLElement>): void => {
  elements.forEach((element) => replaceFont(element))
}

export const invokeReplacer = (): void => {
  const elements = $$('body *') as NodeListOf<HTMLElement>
  replaceFonts(elements)
}

const debouncedReplacer = debounceWithFirstCall(invokeReplacer, 200)

export const invokeObserver = (): void => {
  const observerOptions = { childList: true, subtree: true }
  const observer = new MutationObserver(debouncedReplacer)
  observer.observe(document, observerOptions)
}

export const preview = async (): Promise<void> => {
  try {
    const { off } = (await LOCAL_CONFIG.get({ off: false })) as { off: boolean }
    if (off) return

    const settings = (await CONFIG.get({ 'font-default': '', 'font-mono': '' })) as {
      'font-default': string
      'font-mono': string
    }

    init(settings)
  } catch (error) {
    console.error('❌ Error in preview function:', error)
  }
}

export const init = (settings: { 'font-default': string; 'font-mono': string }): void => {
  let { 'font-default': sansFont, 'font-mono': monospaceFont } = settings

  isSansFont = sansFont?.length > 0
  isMonospaceFont = monospaceFont?.length > 0

  if (!isSansFont && !isMonospaceFont) return cleanupStyles()

  const fontObject: FontObject[] = [
    { fontFamily: removePrefix(sansFont), isGoogleFont: isGoogleFont(sansFont) },
    { fontFamily: removePrefix(monospaceFont), isGoogleFont: isGoogleFont(monospaceFont) },
  ]

  const cssRules = getCssRules(fontObject)
  const classContent = getClassContent(fontObject)

  createOrUpdateStyleTag(STYLE_TAG_ID, cssRules + classContent)

  if (isSansFont) {
    document.documentElement.style.setProperty('font-family', `var(--${SANS_CLASS})`, 'important')
    document.body.style.setProperty('font-family', `var(--${SANS_CLASS})`, 'important')
  } else {
    document.documentElement.style.removeProperty('font-family')
    document.body.style.removeProperty('font-family')
  }
}

// Helper function to check if a font is a Google font
const isGoogleFont = (fontId: string): boolean => fontId.startsWith('GF-')
const removePrefix = (fontId: string): string => fontId.replace('GF-', '')
