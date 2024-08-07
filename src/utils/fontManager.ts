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

let isSansFont = false
let isMonospaceFont = false

/**
 * Disables the style tag and removes inline styles
 */
export const cleanupStyles = (): void => {
  toggleStyleTag(STYLE_TAG_ID, false)
  removeInlineStyle(document.documentElement)
  removeInlineStyle(document.body)
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

interface FontObject {
  fontFamily: string
  isGoogleFont: boolean
}

/**
 * Collects and merges styles into one string and returns it
 */
const getCssRules = memo(async (fontObject: FontObject[], ligatures): Promise<string> => {
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

  const generalStyles = await getStyles(`var(--${SANS_CLASS})`, `var(--${MONOSPACE_CLASS})`)
  const rootCssVariables: string[] = []

  rootCssVariables.push(
    `--${FALLBACK_CLASS}:"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";`,
  )

  if (sansFont.fontFamily) {
    rootCssVariables.push(
      `--${SANS_CLASS}:${fixName(sansFont.fontFamily)},sans-serif,var(--${FALLBACK_CLASS});`,
    )
  }

  if (monospaceFont.fontFamily) {
    rootCssVariables.push(
      `--${MONOSPACE_CLASS}:${fixName(monospaceFont.fontFamily)},monospace,var(--${FALLBACK_CLASS});`,
    )
  }

  if (!ligatures) {
    cssRules.push(`code,kbd,pre,samp{font-variant-ligatures:none!important}`)
  }

  cssRules.push(`:root{${rootCssVariables.join('')}}`)

  if (sansFont.fontFamily) {
    cssRules.push([...generalStyles.sansStyles].join(''))
  }

  if (monospaceFont.fontFamily) {
    cssRules.push([...generalStyles.monospaceStyles].join(''))
  }

  return cssRules.join('')
})

const addInlineStyle = (element: HTMLElement): void => {
  element.style.setProperty('font-family', `var(--${SANS_CLASS})`, 'important')
}

const removeInlineStyle = (element: HTMLElement): void => {
  element.style.removeProperty('font-family')
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

  let ligatures = ligaturesSetting

  isSansFont = sansFont?.length > 0
  isMonospaceFont = monospaceFont?.length > 0

  if (!isSansFont && !isMonospaceFont) return cleanupStyles()

  const fontObject: FontObject[] = [
    { fontFamily: removePrefix(sansFont), isGoogleFont: isGoogleFont(sansFont) },
    { fontFamily: removePrefix(monospaceFont), isGoogleFont: isGoogleFont(monospaceFont) },
  ]

  const cssRules = await getCssRules(fontObject, ligatures)

  createOrUpdateStyleTag(STYLE_TAG_ID, cssRules)

  if (isSansFont) {
    addInlineStyle(document.documentElement)
    addInlineStyle(document.body)
  } else {
    removeInlineStyle(document.documentElement)
    removeInlineStyle(document.body)
  }
}

// Helper function to check if a font is a Google font
const isGoogleFont = (fontId: string): boolean => fontId.startsWith('GF-')
const removePrefix = (fontId: string): string => fontId.replace('GF-', '')
