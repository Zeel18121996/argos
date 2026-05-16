export interface Product {
  id: string
  sku: string
  name: string
  slug: string
  categoryId: string
  categorySlug: string
  categoryName: string
  images: string[]
  price: number
  wasPrice?: number
  rating: number
  reviewCount: number
  inStock: boolean
  stockCount?: number
  isNew?: boolean
  isSale?: boolean
  isClearance?: boolean
  brand?: string
  description: string
  features: string[]
  specifications: ProductSpec[]
  deliveryOptions: DeliveryOption[]
  reserveAvailable: boolean
  averageDeliveryDays?: number
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
  search?: string
  page?: number
  limit?: number
  sortBy?: 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest'
  minPrice?: number
  maxPrice?: number
  brand?: string
  inStock?: boolean
}

export interface ProductListResponse {
  items: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}
