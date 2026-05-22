// ─── Currency / unit primitives ──────────────────────────────────────────────
//
// The DB stores prices in **paise** (minor unit of INR, 1/100 of a rupee).
// Always pass paise to `formatPaise` — let this module handle the conversion.
// Pre-divided "rupees" arguments are accepted by `formatRupees` for the few
// call sites that already work in major units (e.g. order summaries computed
// client-side).
//
// Older code uses the names `formatPrice` / `formatPriceFromPounds` — both are
// kept as aliases below so we don't have to touch ~30 call sites in one go.
// Prefer the new names in any new code; the old ones are marked @deprecated.

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

const formatRupeesInternal = (rupees: number): string => {
  if (Number.isFinite(rupees) && rupees % 1 === 0) {
    return `₹${rupees.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  }
  return inrFormatter.format(rupees)
}

/** Format a minor-unit value (paise) as an INR string. */
export const formatPaise = (paise: number): string => formatRupeesInternal(paise / 100)

/** Format a major-unit value (rupees) as an INR string. */
export const formatRupees = (rupees: number): string => formatRupeesInternal(rupees)

// ─── Backwards-compat aliases ───────────────────────────────────────────────
// Existing call sites use these. Keep them working; mark deprecated so new
// code uses the unambiguous names above.

/** @deprecated Use `formatPaise` — same behaviour, clearer name. */
export const formatPrice = formatPaise

/**
 * @deprecated Misnamed historical artefact — the function formats rupees,
 * not pounds. Use `formatRupees` for major units or `formatPaise` for minor.
 */
export const formatPriceFromPounds = formatRupees

// ─── Misc formatters (unchanged) ────────────────────────────────────────────

export const formatRating = (rating: number): string => rating.toFixed(1)

export const formatReviewCount = (count: number): string =>
  count > 1000 ? `${(count / 1000).toFixed(1)}k` : count.toString()

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  const datePart = date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const timePart = date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
  return `${datePart}, ${timePart}`
}

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
