export const formatPrice = (pence: number): string => {
  const pounds = pence / 100
  return pounds % 1 === 0 ? `£${pounds.toFixed(0)}` : `£${pounds.toFixed(2)}`
}

export const formatPriceFromPounds = (pounds: number): string =>
  pounds % 1 === 0 ? `£${pounds.toFixed(0)}` : `£${pounds.toFixed(2)}`

export const formatRating = (rating: number): string => rating.toFixed(1)

export const formatReviewCount = (count: number): string =>
  count > 1000 ? `${(count / 1000).toFixed(1)}k` : count.toString()

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
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
