import { useState, useEffect } from 'react'

/**
 * Returns true when the page has scrolled past `threshold` pixels.
 *
 * Scroll events fire ~60×/s; we coalesce reads into a single
 * requestAnimationFrame and only call setState when the boolean
 * actually flips. So a long scroll triggers exactly two re-renders
 * regardless of scroll length.
 */
export function useScrolled(threshold = 10): boolean {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let rafId = 0
    let last = false

    const read = () => {
      const next = window.scrollY > threshold
      if (next !== last) {
        last = next
        setScrolled(next)
      }
    }

    const handler = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(read)
    }

    window.addEventListener('scroll', handler, { passive: true })
    read() // initial check on mount

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', handler)
    }
  }, [threshold])

  return scrolled
}
