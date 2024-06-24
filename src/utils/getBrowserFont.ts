type FontFamily = 'cursive' | 'fantasy' | 'fixed' | 'sansserif' | 'serif' | 'standard'

/**
 * Retrieves the font family for a specified generic family from the browser's font settings.
 * @param {FontFamily} genericFamily - The generic family type (e.g., 'fixed', 'standard', 'sansserif').
 * @returns {Promise<string>} The font family as a string.
 */
const getBrowserFont = async (genericFamily: FontFamily): Promise<string> => {
  try {
    const details = await chrome.fontSettings.getFont({ genericFamily })
    return details.fontId
  } catch (error) {
    console.error(`Error getting ${genericFamily} font:`, error)
    return ''
  }
}

export const getBrowserFixedFont = (): Promise<string> => getBrowserFont('fixed')

export const getBrowserStandardFont = (): Promise<string> => getBrowserFont('standard')

export const getBrowserSansFont = (): Promise<string> => getBrowserFont('sansserif')
