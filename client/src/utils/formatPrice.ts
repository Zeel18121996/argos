/**
 * Converts pence (integer) to a formatted GBP string.
 * ALL prices in the DB are stored in pence.
 *
 * @example
 * formatPrice(2999)  // "£29.99"
 * formatPrice(500)   // "£5.00"
 */
export function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`
}

/**
 * Converts a float pound value to integer pence for storage.
 *
 * @example
 * poundsToPence(29.99)  // 2999
 */
export function poundsToPence(pounds: number): number {
  return Math.round(pounds * 100)
}

/**
 * Returns the discount percentage between two prices.
 *
 * @example
 * discountPercent(3999, 2999)  // 25  (25% off)
 */
export function discountPercent(originalPence: number, salePence: number): number {
  if (originalPence <= 0) return 0
  return Math.round(((originalPence - salePence) / originalPence) * 100)
}
