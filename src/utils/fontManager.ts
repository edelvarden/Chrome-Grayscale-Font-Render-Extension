import { $, $$$ } from './domUtils'
import { memo } from './memo'
import { CONFIG, LOCAL_CONFIG } from './storage'
import { addHashSuffix, fixName } from './stringUtils'
import { getStyles } from './styleParser'

// Constants with unique names
const FALLBACK_CLASS = addHashSuffix('fallback')
const SANS_CLASS = addHashSuffix('sans')
const MONOSPACE_CLASS = addHashSuffix('monospace')
const STYLE_TAG_ID = addHashSuffix('style')

// Font states
let isSansFont = false
let isMonospaceFont = false

// Helper functions
const isGoogleFont = (fontId: string): boolean => fontId.startsWith('GF-')
const removePrefix = (fontId: string): string => fontId.replace('GF-', '')

/**
 * Creates or updates the style tag's content when different
 */
export const createOrUpdateStyleTag = (id: string, content: string): void => {
  let styleTag = $(`#${id}`) as HTMLStyleElement | null
  if (styleTag) {
    if (styleTag.innerHTML !== content) {
      styleTag.innerHTML = content
    }
    styleTag.disabled = false
  } else {
    styleTag = $$$('style', { innerHTML: content, id }) as HTMLStyleElement
    document.head.append(styleTag) // append is required to override !important rules
  }
}

/**
 * Sets inline styles for an element
 */
const toggleInlineStyle = (element: HTMLElement, enable: boolean): void => {
  element.style.setProperty('font-family', enable ? `var(--${SANS_CLASS})` : '', 'important')
}

interface FontObject {
  fontFamily: string
  isGoogleFont: boolean
}

/**
 * Collects and merges styles into one string and returns it
 */
const getCssRules = memo(async (fontObjects: FontObject[], ligatures: boolean): Promise<string> => {
  const [sansFont, monospaceFont] = fontObjects
  const importFonts: string[] = []

  const addFont = (font: FontObject, isMonospace = false): void => {
    if (font.isGoogleFont) {
      const weights = isMonospace ? [400, 700] : [400, 700]
      importFonts.push(`family=${font.fontFamily.split(' ').join('+')}:wght@${weights.join(';')}`)
    }
  }

  addFont(sansFont)
  if (sansFont.fontFamily !== monospaceFont.fontFamily) {
    addFont(monospaceFont, true)
  }

  const importRules = importFonts.length
    ? `@import url('https://fonts.googleapis.com/css2?${importFonts.join('&')}&display=swap');`
    : ''
  const generalStyles = await getStyles(
    `var(--${SANS_CLASS})`,
    `var(--${MONOSPACE_CLASS})`,
    ligatures,
  )
  const rootCssVariables = [
    `--${FALLBACK_CLASS}:"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";`,
    sansFont.fontFamily
      ? `--${SANS_CLASS}:${fixName(sansFont.fontFamily)},sans-serif,var(--${FALLBACK_CLASS});`
      : '',
    monospaceFont.fontFamily
      ? `--${MONOSPACE_CLASS}:${fixName(monospaceFont.fontFamily)},monospace,var(--${FALLBACK_CLASS});`
      : '',
  ]
    .filter(Boolean)
    .join('')

  return `${importRules} :root{${rootCssVariables}} ${sansFont.fontFamily ? generalStyles.sansStyles : ''} ${monospaceFont.fontFamily ? generalStyles.monospaceStyles : ''}`
})

/**
 * Disables the style tag and removes inline styles
 */
export const cleanupStyles = (): void => {
  toggleStyleTag(STYLE_TAG_ID, false)
  ;[document.documentElement, document.body].forEach((element) => toggleInlineStyle(element, false))
}

/**
 * Toggles the enabled state of the style tag
 */
export const toggleStyleTag = (styleId: string, enable: boolean): void => {
  const styleTag = $(`#${styleId}`) as HTMLStyleElement | null
  if (styleTag) {
    styleTag.disabled = !enable
  }
}

/**
 * Reinitializes settings to start preview by updating injected styles
 */
export const preview = async (): Promise<void> => {
  try {
    const { off } = (await LOCAL_CONFIG.get({ off: false })) as { off: boolean }
    if (off) return

    const settings = (await CONFIG.get({
      'font-default': '',
      'font-mono': '',
      ligatures: false,
    })) as {
      'font-default': string
      'font-mono': string
      ligatures: boolean
    }

    init(settings)
  } catch (error) {
    console.error('❌ Error in preview function:', error)
  }
}

/**
 * Initializes main functions
 */
export const init = async (settings: {
  'font-default': string
  'font-mono': string
  ligatures: boolean
}) => {
  const {
    'font-default': sansFont,
    'font-mono': monospaceFont,
    ligatures: ligaturesSetting,
  } = settings

  isSansFont = Boolean(sansFont)
  isMonospaceFont = Boolean(monospaceFont)

  if (!isSansFont && !isMonospaceFont) return cleanupStyles()

  const fontObjects: FontObject[] = [
    { fontFamily: removePrefix(sansFont), isGoogleFont: isGoogleFont(sansFont) },
    { fontFamily: removePrefix(monospaceFont), isGoogleFont: isGoogleFont(monospaceFont) },
  ]

  const cssRules = await getCssRules(fontObjects, ligaturesSetting)
  createOrUpdateStyleTag(STYLE_TAG_ID, cssRules)
  ;[document.documentElement, document.body].forEach((element) =>
    toggleInlineStyle(element, isSansFont),
  )
}
