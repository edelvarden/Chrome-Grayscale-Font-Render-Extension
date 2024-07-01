import { memo } from './memo'

type Styles = {
  sansStyles: Set<string>
  monospaceStyles: Set<string>
}

/**
 * Fetches and parses a stylesheet from a given URL
 */
const fetchStylesheet = async (url: string): Promise<string> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch stylesheet from ${url}`)
  }
  return response.text()
}

/**
 * Parses CSS variables in a CSS rule and adds them to a style set
 */
const parseVariables = (
  cssSelector: string,
  cssText: string,
  styleObject: Set<string>,
  fontFamily: string,
  isMonospace: boolean = false,
) => {
  const declarations = cssText.split('{')[1].split(';')

  declarations.forEach((declaration) => {
    const trimmedDeclaration = declaration.trim()
    const [property, value] = trimmedDeclaration.split(':')

    if (
      (isMonospace && /monospace/.test(value)) ||
      (!isMonospace && /serif|sans-serif|cursive|fantasy/.test(value))
    ) {
      if (property.startsWith('--')) {
        styleObject.add(`${cssSelector}{${property}:${fontFamily}!important;}`)
      }
    }
  })
}

/**
 * Parses CSS text to extract sans and monospace styles
 */
const parseStyles = (
  cssSelector: string,
  cssText: string,
  sansFontFamily: string,
  monospaceFontFamily: string,
): Styles => {
  const styles: Styles = {
    sansStyles: new Set<string>(),
    monospaceStyles: new Set<string>(),
  }

  if (!cssSelector.trimStart().startsWith('@') && !cssSelector.trimStart().startsWith('/*')) {
    if (/serif|sans-serif|cursive|fantasy/.test(cssText)) {
      styles.sansStyles.add(`${cssSelector}{font-family:${sansFontFamily}!important;}`)
      parseVariables(cssSelector, cssText, styles.sansStyles, sansFontFamily)
    }
    if (cssText.includes('monospace')) {
      styles.monospaceStyles.add(`${cssSelector}{font-family:${monospaceFontFamily}!important;}`)
      parseVariables(cssSelector, cssText, styles.monospaceStyles, monospaceFontFamily, true)
    }
  }

  return styles
}

/**
 * Loads and parses cross-origin stylesheets
 */
const loadCrossOriginStyles = async (
  url: string | null,
  sansFontFamily: string,
  monospaceFontFamily: string,
): Promise<Styles> => {
  const styles: Styles = {
    sansStyles: new Set<string>(),
    monospaceStyles: new Set<string>(),
  }

  if (url) {
    try {
      const cssText = await fetchStylesheet(url)
      cssText.split('}').forEach((style) => {
        const cssSelector = style.split('{')[0].trim()
        const parsedStyles = parseStyles(cssSelector, style, sansFontFamily, monospaceFontFamily)
        parsedStyles.sansStyles.forEach((style) => styles.sansStyles.add(style))
        parsedStyles.monospaceStyles.forEach((style) => styles.monospaceStyles.add(style))
      })
    } catch (error) {
      console.warn(`⚠️ Failed to fetch or parse stylesheet from ${url}:`, error)
    }
  }

  return styles
}

/**
 * Parses all webpage styles to get selectors for sans and monospace fonts
 */
export const getStyles = memo(
  async (sansFontFamily: string, monospaceFontFamily: string): Promise<Styles> => {
    const styles: Styles = {
      sansStyles: new Set<string>(),
      monospaceStyles: new Set<string>(),
    }

    for (let i = 0; i < document.styleSheets.length; i++) {
      const styleSheet = document.styleSheets[i] as CSSStyleSheet
      const styleUrl = styleSheet.href

      try {
        const styleRules = styleSheet.cssRules as CSSRuleList

        if (styleRules) {
          for (let j = 0; j < styleRules.length; j++) {
            const cssRule = styleRules[j] as CSSStyleRule
            const cssText = cssRule.cssText
            const cssSelector = cssRule.selectorText

            if (cssSelector) {
              const parsedStyles = parseStyles(
                cssSelector,
                cssText,
                sansFontFamily,
                monospaceFontFamily,
              )
              parsedStyles.sansStyles.forEach((style) => styles.sansStyles.add(style))
              parsedStyles.monospaceStyles.forEach((style) => styles.monospaceStyles.add(style))
            }
          }
        }
      } catch (error) {
        const crossOriginStyles = await loadCrossOriginStyles(
          styleUrl,
          sansFontFamily,
          monospaceFontFamily,
        )
        crossOriginStyles.sansStyles.forEach((style) => styles.sansStyles.add(style))
        crossOriginStyles.monospaceStyles.forEach((style) => styles.monospaceStyles.add(style))
      }
    }

    return styles
  },
)
