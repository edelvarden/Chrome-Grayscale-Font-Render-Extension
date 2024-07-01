/**
 * @jest-environment jsdom
 */

import { $, $$, $$$ } from '../utils/domUtils'

describe('DOM Utility Functions Tests', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    document.head.innerHTML = ''
  })

  describe('$ function', () => {
    it('should select a single element by CSS selector', () => {
      const styleTag1 = $$$('style', {
        innerHTML: '*{color: red;}',
        id: 'style_id1',
      }) as HTMLStyleElement

      const div1 = $$$('div', { innerHTML: 'test1', class: 'container' }) as HTMLElement
      const div2 = $$$('div', { innerHTML: 'test2', class: 'container' }) as HTMLElement

      document.head.prepend(styleTag1)
      document.body.prepend(div1)
      document.body.prepend(div2)

      const result = $('#style_id1')
      expect(result).toBeDefined()
      expect(result).toBeInstanceOf(HTMLStyleElement)
      expect(result?.id).toBe('style_id1')

      const resultAll = $$('.container')
      expect(resultAll).toBeDefined()
      expect(resultAll.length).toBe(2)
    })

    it('should return null if no element matches the selector', () => {
      const result = $('#nonexistent-selector')
      expect(result).toBeNull()
    })
  })

  describe('$$ function', () => {
    it('should select multiple elements by class name', () => {
      const div1 = $$$('div', { innerHTML: 'test1', class: 'test-class' }) as HTMLElement
      const div2 = $$$('div', { innerHTML: 'test2', class: 'test-class' }) as HTMLElement
      const span = $$$('span', { innerHTML: 'test3', class: 'test-class' }) as HTMLElement

      document.body.append(div1, div2, span)

      const elements = $$('.test-class')
      expect(elements).toBeDefined()
      expect(elements.length).toBe(3)
      elements.forEach((element) => {
        expect(element.classList.contains('test-class')).toBe(true)
      })
    })

    it('should return an empty NodeList if no elements are found', () => {
      const elements = $$('.nonexistent-class')
      expect(elements).toBeDefined()
      expect(elements.length).toBe(0)
    })
  })

  describe('$$$ function', () => {
    it('should create an HTML element with given attributes and styles', () => {
      const element = $$$(
        'div',
        { id: 'new-element', class: 'test', 'data-custom': 'value' },
        { backgroundColor: 'red' },
      ) as HTMLDivElement

      expect(element.tagName).toBe('DIV')
      expect(element.id).toBe('new-element')
      expect(element.classList.contains('test')).toBe(true)
      expect(element.getAttribute('data-custom')).toBe('value')
      expect(element.style.backgroundColor).toBe('red')
    })

    it('should create an element with default attributes and styles', () => {
      const element = $$$('span') as HTMLSpanElement

      expect(element.tagName).toBe('SPAN')
      expect(element.id).toBeFalsy()
      expect(element.className).toBeFalsy()
      expect(element.getAttribute('data-custom')).toBeFalsy()
      expect(element.style.backgroundColor).toBeFalsy()
    })
  })
})
