export const getBrowserFixedFont = async (): Promise<string> => {
  let fontFamily = ''
  try {
    const details = await chrome.fontSettings.getFont({ genericFamily: 'fixed' })
    fontFamily = details.fontId
  } catch (error) {
    console.error('Error getting fixed font:', error)
  }
  return fontFamily
}

export const getBrowserStandardFont = async (): Promise<string> => {
  let fontFamily = ''
  try {
    const details = await chrome.fontSettings.getFont({ genericFamily: 'standard' })
    fontFamily = details.fontId
  } catch (error) {
    console.error('Error getting standard font:', error)
  }
  return fontFamily
}

export const getBrowserSansFont = async (): Promise<string> => {
  let fontFamily = ''
  try {
    const details = await chrome.fontSettings.getFont({ genericFamily: 'sansserif' })
    fontFamily = details.fontId
  } catch (error) {
    console.error('Error getting sans font:', error)
  }
  return fontFamily
}
