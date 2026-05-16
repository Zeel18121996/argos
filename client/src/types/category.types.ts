export interface Category {
  id: string
  slug: string
  name: string
  parentId: string | null
  depth: number
  imageUrl: string | null
  sortOrder: number
  children: Category[]
}
