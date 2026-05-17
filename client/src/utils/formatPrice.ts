/**
 * Converts paise (integer) to a formatted INR string.
 * ALL prices in the DB are stored in paise (1/100 ₹).
 *
 * @example
 * formatPrice(2999)  // "₹29.99"
 * formatPrice(500)   // "₹5.00"
 */
export function formatPrice(paise: number): string {
  return `₹${(paise / 100).toFixed(2)}`
}

/**
 * Converts a float rupee value to integer paise for storage.
 *
 * @example
 * poundsToPence(29.99)  // 2999
 */
export function poundsToPence(rupees: number): number {
  return Math.round(rupees * 100)
}

/**
 * Returns the discount percentage between two prices.
 *
 * @example
 * discountPercent(3999, 2999)  // 25  (25% off)
 */
export function discountPercent(originalPaise: number, salePaise: number): number {
  if (originalPaise <= 0) return 0
  return Math.round(((originalPaise - salePaise) / originalPaise) * 100)
}
