const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'
const STATIC_BASE = API_BASE.replace(/\/api\/v1\/?$/, '')

export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return 'https://via.placeholder.com/600'
  if (url.startsWith('http')) return url
  return `${STATIC_BASE}${url.startsWith('/') ? '' : '/'}${url}`
}
