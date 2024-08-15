import { memo } from './memo'

const monospaceRegex = /monospace/
const serifRegex = /serif|sans-serif|cursive|fantasy/

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
 * Parses CSS variables and adds them to a style set
 */
const parseVariables = (
  cssSelector: string,
  cssText: string,
  styleObject: Set<string>,
  fontFamily: string,
  isMonospace: boolean = false,
): Record<string, string> => {
  const variableMap: Record<string, string> = {}
  const variableRegex = /--[\w-]+:\s*[^;]+;?/g

  const variables = cssText.match(variableRegex) || []
  variables.forEach((variable) => {
    const [property, value] = variable.split(':').map((part) => part.trim())
    if (property && value) {
      variableMap[property] = value

      if (property.startsWith('--') && (isMonospace ? monospaceRegex : serifRegex).test(value)) {
        styleObject.add(`${cssSelector}{${property}:${fontFamily}!important;}`)
      }
    }
  })

  return variableMap
}

/**
 * Adds variable styles based on CSS variables
 */
const addVariableStyles = (
  cssSelector: string,
  variableMap: Record<string, string>,
  styleObject: Set<string>,
  fontFamily: string,
) => {
  const fontRegex = /calc|rem|em|px|%|\//

  styleObject.forEach((item) => {
    const props = item.split('{')[1]
    if (props.startsWith('--')) {
      const variableName = props.split(':')[0]
      Object.keys(variableMap).forEach((key) => {
        if (
          variableMap[key].includes(variableName) &&
          variableMap[key].length > 1 &&
          !fontRegex.test(variableMap[key])
        ) {
          styleObject.add(`${cssSelector}{${key}:${fontFamily}!important;}`)
        }
      })
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
  ligatures: boolean,
): Styles => {
  const styles: Styles = {
    sansStyles: new Set<string>(),
    monospaceStyles: new Set<string>(),
  }

  if (!cssSelector.trimStart().startsWith('@') && !cssSelector.trimStart().startsWith('/*')) {
    const isSans = serifRegex.test(cssText) && !cssText.includes('--sans')
    const isMonospace = monospaceRegex.test(cssText) && !cssText.includes('--monospace')

    if (isSans) {
      if (cssText.includes('font-family:')) {
        styles.sansStyles.add(`${cssSelector}{font-family:${sansFontFamily}!important;}`)
      }
      const variables = parseVariables(cssSelector, cssText, styles.sansStyles, sansFontFamily)
      addVariableStyles(cssSelector, variables, styles.sansStyles, sansFontFamily)
    }

    if (isMonospace) {
      if (cssText.includes('font-family:')) {
        styles.monospaceStyles.add(
          `${cssSelector}{font-family:${monospaceFontFamily}!important;${!ligatures ? 'font-variant-ligatures:none!important;' : ''}}`,
        )
      }
      const variables = parseVariables(
        cssSelector,
        cssText,
        styles.monospaceStyles,
        monospaceFontFamily,
        true,
      )
      addVariableStyles(cssSelector, variables, styles.monospaceStyles, monospaceFontFamily)
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
  ligatures: boolean,
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
        const parsedStyles = parseStyles(
          cssSelector,
          style,
          sansFontFamily,
          monospaceFontFamily,
          ligatures,
        )
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
  async (
    sansFontFamily: string,
    monospaceFontFamily: string,
    ligatures = false,
  ): Promise<Styles> => {
    const styles: Styles = {
      sansStyles: new Set<string>(),
      monospaceStyles: new Set<string>(),
    }

    const styleSheets = new Set(document.styleSheets)

    for (const styleSheet of styleSheets) {
      const styleUrl = styleSheet.href

      try {
        const styleRules = styleSheet.cssRules as CSSRuleList

        if (styleRules) {
          for (const styleRule of styleRules) {
            const cssRule = styleRule as CSSStyleRule
            const cssText = cssRule.cssText
            const cssSelector = cssRule.selectorText

            if (cssSelector) {
              const parsedStyles = parseStyles(
                cssSelector,
                cssText,
                sansFontFamily,
                monospaceFontFamily,
                ligatures,
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
          ligatures,
        )
        crossOriginStyles.sansStyles.forEach((style) => styles.sansStyles.add(style))
        crossOriginStyles.monospaceStyles.forEach((style) => styles.monospaceStyles.add(style))
      }
    }

    return styles
  },
)
