import '@testing-library/jest-dom/vitest'

// jsdom does not provide IntersectionObserver (used by framer-motion)
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null
  readonly rootMargin = ''
  readonly thresholds: ReadonlyArray<number> = []
  observe = () => undefined
  unobserve = () => undefined
  disconnect = () => undefined
  takeRecords = (): IntersectionObserverEntry[] => []
}
;(globalThis as typeof globalThis & { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver
