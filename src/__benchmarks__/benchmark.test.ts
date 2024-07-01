/**
 * @jest-environment jsdom
 */

import { getStyles } from '../utils/styleParser'
import { styles } from './constants'

const mockStylesheet = styles

beforeAll(() => {
  document.documentElement.innerHTML = `<style>${mockStylesheet}</style>`
  globalThis.fetch = jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      text: () => Promise.resolve(mockStylesheet),
    }),
  )
})

test('Benchmark getStyles performance', async () => {
  const sansFontFamily = 'Arial, sans-serif'
  const monospaceFontFamily = 'Courier New, monospace'
  const iterations = 10
  const times: number[] = []

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now()
    const styles = await getStyles(sansFontFamily, monospaceFontFamily)
    document.head.innerHTML = `<style>${styles}</style>`
    const endTime = performance.now()
    times.push(endTime - startTime)
  }

  const averageTime = times.reduce((a, b) => a + b, 0) / times.length

  // expect(averageTime).toBeLessThan(500)

  return averageTime
})
