export interface Product {
  id: string
  slug: string
  sku: string
  name: string
  brand: string | null
  categoryId: string
  categorySlug: string
  categoryName: string
  images: string[]
  price: number
  compareAtPrice: number | null
  ratingAverage: number
  reviewCount: number
  stockCount: number
  inStock: boolean
  isNew: boolean
  isOnOffer: boolean
  isClearance: boolean
  isBigDeal: boolean
  isFeatured: boolean
  description: string | null
  features: string[]
  specifications: ProductSpec[]
  deliveryOptions: DeliveryOption[]
  reserveAvailable: boolean
  variants?: ProductVariant[]
  imagesFull?: ProductImage[]
  isActive?: boolean
}

export interface ProductVariant {
  id: string
  sku: string
  name: string
  attributes: Record<string, string>
  priceOverride: number | null
  stockCount: number
  isActive: boolean
}

export interface ProductImage {
  id: string
  url: string
  altText: string | null
  sortOrder: number
  sizeLabel: string | null
}

export interface ProductSpec {
  name: string
  value: string
}

export interface DeliveryOption {
  type: 'standard' | 'express' | 'next-day' | 'fast-track'
  label: string
  price: number
  availableFrom?: string
}

export interface ProductReview {
  id: string
  productId: string
  author: string
  rating: number
  title: string
  body: string
  createdAt: string
  verified: boolean
}

export interface ProductListParams {
  categorySlug?: string
  q?: string
  page?: number
  limit?: number
  sortBy?: 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'popular'
  minPrice?: number
  maxPrice?: number
  brand?: string
  inStock?: boolean
  onOffer?: boolean
  isNew?: boolean
  isFeatured?: boolean
  isClearance?: boolean
  isBigDeal?: boolean
  /** Fetch a specific set of products by slug (used for recently viewed). */
  slugs?: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ProductListResponse {
  items: Product[]
  meta: PaginationMeta
}
