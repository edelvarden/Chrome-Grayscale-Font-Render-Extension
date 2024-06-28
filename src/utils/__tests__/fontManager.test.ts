/**
 * @jest-environment jsdom
 */

import { $, $$$ } from '../domUtils'
import { createOrUpdateStyleTag, toggleStyleTag } from '../fontManager'

jest.mock('../storage', () => ({
  CONFIG: {
    get: jest.fn(),
  },
  LOCAL_CONFIG: {
    get: jest.fn(),
  },
}))

jest.mock('../stringUtils', () => ({
  addHashSuffix: jest.fn((prefix) => `${prefix}__hashed`),
  fixName: jest.fn((fontFamily) => fontFamily.replace(/['"]/g, '').trim()),
}))

describe('Font Manager Function Tests', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = `
      <div id="test"></div>
      <div class="test-class"></div>
      <span class="test-class"></span>
      <button id="test-button">Click Me</button>
    `
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('toggleStyleTag', () => {
    it('should enable or disable the style tag', () => {
      const styleTag = $$$('style', { id: 'style_hashed' }) as HTMLStyleElement
      document.head.append(styleTag)

      toggleStyleTag('style_hashed', false)
      expect(styleTag.disabled).toBe(true)

      toggleStyleTag('style_hashed', true)
      expect(styleTag.disabled).toBe(false)
    })
  })

  describe('createOrUpdateStyleTag', () => {
    it('should create a new style tag if it does not exist', () => {
      let styleTag = $('#new_style') as HTMLStyleElement

      expect(styleTag).toBeNull()

      createOrUpdateStyleTag('new_style', 'body { background: red; }')

      styleTag = $('#new_style') as HTMLStyleElement

      expect(styleTag).toBeDefined()
      expect(styleTag.innerHTML).toBe('body { background: red; }')
    })

    it('should update an existing style tag', () => {
      const styleTag = $$$('style', {
        innerHTML: 'body { background: blue; }',
        id: 'style_hashed',
      }) as HTMLStyleElement
      document.head.append(styleTag)

      expect(styleTag).toBeDefined()
      expect(styleTag.innerHTML).toBe('body { background: blue; }')

      createOrUpdateStyleTag('style_hashed', 'body { background: red; }')
      expect(styleTag.innerHTML).toBe('body { background: red; }')
      expect(styleTag.disabled).toBe(false)
    })

    it('should handle empty or null content gracefully', () => {
      createOrUpdateStyleTag('style_empty', '')
      let styleTag = $('#style_empty') as HTMLStyleElement
      expect(styleTag).toBeDefined()
      expect(styleTag.innerHTML).toBe('')
    })
  })
})
