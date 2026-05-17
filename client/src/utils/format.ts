const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

const formatRupees = (rupees: number): string => {
  if (rupees % 1 === 0) {
    return `₹${rupees.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  }
  return inrFormatter.format(rupees)
}

export const formatPrice = (paise: number): string => formatRupees(paise / 100)

export const formatPriceFromPounds = (rupees: number): string => formatRupees(rupees)

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

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
