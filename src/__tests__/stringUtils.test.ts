import { addHashSuffix, fixName } from '../utils/stringUtils'

describe('String Utility Functions Tests', () => {
  describe('fixName function', () => {
    it('should return an empty string for an empty input', () => {
      expect(fixName('')).toBe('')
    })

    it('should remove single quotes around the font name', () => {
      expect(fixName("'Open Sans'")).toBe('"Open Sans"')
    })

    it('should remove double quotes around the font name', () => {
      expect(fixName('"Open Sans"')).toBe('"Open Sans"')
    })

    it('should trim whitespace around the font name', () => {
      expect(fixName('  Open Sans  ')).toBe('"Open Sans"')
    })

    it('should return the font name with double quotes if it is not a generic font-family name', () => {
      expect(fixName('Open Sans')).toBe('"Open Sans"')
    })

    it('should return the font name as is if it is a generic font-family name (serif)', () => {
      expect(fixName('serif')).toBe('serif')
    })

    it('should return the font name as is if it is a generic font-family name (sans-serif)', () => {
      expect(fixName('sans-serif')).toBe('sans-serif')
    })

    it('should return the font name as is if it is a generic font-family name (cursive)', () => {
      expect(fixName('cursive')).toBe('cursive')
    })

    it('should return the font name as is if it is a generic font-family name (fantasy)', () => {
      expect(fixName('fantasy')).toBe('fantasy')
    })

    it('should return the font name as is if it is a generic font-family name (monospace)', () => {
      expect(fixName('monospace')).toBe('monospace')
    })
  })

  describe('addHashSuffix function', () => {
    it('should add a 6-character hash suffix to the prefix', () => {
      const prefix = 'prefix'
      const result = addHashSuffix(prefix)
      expect(result).toMatch(/^prefix__[A-Za-z0-9]{6}$/)
    })

    it('should generate a unique hash each time', () => {
      const prefix = 'prefix'
      const hash1 = addHashSuffix(prefix)
      const hash2 = addHashSuffix(prefix)
      expect(hash1).not.toBe(hash2)
    })
  })
})
