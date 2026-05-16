export const PATHS = {
  HOME: '/',
  CATEGORY: '/browse/:categorySlug',
  PRODUCT: '/product/:productSlug',
  SEARCH: '/search',
  BASKET: '/basket',
  CHECKOUT: '/checkout',
  CHECKOUT_CONFIRM: '/checkout/confirmation',
  LOGIN: '/login',
  REGISTER: '/register',
  ACCOUNT: '/account',
  ACCOUNT_ORDERS: '/account/orders',
  ACCOUNT_ORDER_DETAIL: '/account/orders/:orderId',
  ACCOUNT_ADDRESSES: '/account/addresses',
  ACCOUNT_WISHLIST: '/account/wishlist',
  STORE_FINDER: '/store-finder',
  TRACK_ORDER: '/track-order',
  HELP: '/help',
} as const

// Helpers that accept params
export const buildPath = {
  category: (slug: string) => `/browse/${slug}`,
  product: (slug: string) => `/product/${slug}`,
  search: (query: string) => `/search?q=${encodeURIComponent(query)}`,
  orderDetail: (orderId: string) => `/account/orders/${orderId}`,
}
