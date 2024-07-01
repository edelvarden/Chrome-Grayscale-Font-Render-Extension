import { memo } from '../utils/memo'

describe('memo', () => {
  it('should memoize results', () => {
    const fn = jest.fn((x: number) => x * 2)
    const memoizedFn = memo(fn)

    expect(memoizedFn(2)).toBe(4)
    expect(memoizedFn(2)).toBe(4)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should clear cache when clearCache is called', () => {
    const fn = jest.fn((x: number) => x * 2)
    const memoizedFn = memo(fn)

    memoizedFn(2)
    memoizedFn(2)
    expect(fn).toHaveBeenCalledTimes(1)

    memoizedFn.clearCache()
    memoizedFn(2)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should respect the maxSize limit', () => {
    const fn = jest.fn((x: number) => x * 2)
    const memoizedFn = memo(fn, 2)

    memoizedFn(1) // cache: { [1]: 2 }
    memoizedFn(2) // cache: { [1]: 2, [2]: 4 }
    memoizedFn(3) // cache: { [2]: 4, [3]: 6 }, [1] should be evicted

    expect(memoizedFn(2)).toBe(4) // should be cached
    expect(memoizedFn(3)).toBe(6) // should be cached
    expect(memoizedFn(1)).toBe(2) // recomputed, fn called again

    expect(fn).toHaveBeenCalledTimes(4) // called again for [1]
  })

  it('should update the cache order for existing keys', () => {
    const fn = jest.fn((x: number) => x * 2)
    const memoizedFn = memo(fn, 2)

    memoizedFn(1) // cache: { [1]: 2 }
    memoizedFn(2) // cache: { [1]: 2, [2]: 4 }
    memoizedFn(1) // move [1] to most recently used, cache: { [2]: 4, [1]: 2 }
    memoizedFn(3) // cache: { [1]: 2, [3]: 6 }, [2] should be evicted

    expect(memoizedFn(1)).toBe(2) // should be cached
    expect(memoizedFn(3)).toBe(6) // should be cached
    expect(memoizedFn(2)).toBe(4) // recomputed, fn called again

    expect(fn).toHaveBeenCalledTimes(4) // called again for [2]
  })
})
