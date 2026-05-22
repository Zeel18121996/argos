import { useState, useCallback } from 'react'

const STORAGE_KEY = 'argos_recently_viewed'
const MAX_ITEMS = 12

function readSlugs(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeSlugs(slugs: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs))
  } catch {
    // localStorage may be unavailable (private mode, storage full, etc.)
  }
}

export function useRecentlyViewed() {
  const [slugs, setSlugs] = useState<string[]>(readSlugs)

  /** Call this when a product page is mounted. */
  const addSlug = useCallback((slug: string) => {
    setSlugs((prev) => {
      const next = [slug, ...prev.filter((s) => s !== slug)].slice(0, MAX_ITEMS)
      writeSlugs(next)
      return next
    })
  }, [])

  /** Remove a slug (e.g. if the product is deleted). */
  const removeSlug = useCallback((slug: string) => {
    setSlugs((prev) => {
      const next = prev.filter((s) => s !== slug)
      writeSlugs(next)
      return next
    })
  }, [])

  return { slugs, addSlug, removeSlug }
}
