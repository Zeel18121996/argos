import type { Category } from '@/interfaces/category.interface'

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Technology',
    slug: 'technology',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80',
    children: [
      { id: 'cat-1-1', name: 'TVs', slug: 'tvs', parentId: 'cat-1' },
      { id: 'cat-1-2', name: 'Laptops', slug: 'laptops', parentId: 'cat-1' },
      { id: 'cat-1-3', name: 'Mobile Phones', slug: 'mobile-phones', parentId: 'cat-1' },
      { id: 'cat-1-4', name: 'Gaming', slug: 'gaming', parentId: 'cat-1' },
      { id: 'cat-1-5', name: 'Audio', slug: 'audio', parentId: 'cat-1' },
      { id: 'cat-1-6', name: 'Smart Home', slug: 'smart-home', parentId: 'cat-1' },
      { id: 'cat-1-7', name: 'Cameras & Drones', slug: 'cameras-drones', parentId: 'cat-1' },
      { id: 'cat-1-8', name: 'Tablets & E-readers', slug: 'tablets', parentId: 'cat-1' },
    ],
  },
  {
    id: 'cat-2',
    name: 'Home & Garden',
    slug: 'home-garden',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
    children: [
      { id: 'cat-2-1', name: 'Furniture', slug: 'furniture', parentId: 'cat-2' },
      { id: 'cat-2-2', name: 'Bedding & Curtains', slug: 'bedding', parentId: 'cat-2' },
      { id: 'cat-2-3', name: 'Kitchen & Dining', slug: 'kitchen-dining', parentId: 'cat-2' },
      { id: 'cat-2-4', name: 'Garden & Outdoors', slug: 'garden', parentId: 'cat-2' },
      { id: 'cat-2-5', name: 'Storage & Shelving', slug: 'storage', parentId: 'cat-2' },
      { id: 'cat-2-6', name: 'Rugs & Flooring', slug: 'rugs-flooring', parentId: 'cat-2' },
      { id: 'cat-2-7', name: 'Lighting', slug: 'lighting', parentId: 'cat-2' },
      { id: 'cat-2-8', name: 'Home Decor', slug: 'home-decor', parentId: 'cat-2' },
    ],
  },
  {
    id: 'cat-3',
    name: 'Sports & Leisure',
    slug: 'sports-leisure',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
    children: [
      { id: 'cat-3-1', name: 'Exercise & Fitness', slug: 'fitness', parentId: 'cat-3' },
      { id: 'cat-3-2', name: 'Cycling', slug: 'cycling', parentId: 'cat-3' },
      { id: 'cat-3-3', name: 'Outdoor & Camping', slug: 'outdoor-camping', parentId: 'cat-3' },
      { id: 'cat-3-4', name: 'Swimming', slug: 'swimming', parentId: 'cat-3' },
      { id: 'cat-3-5', name: 'Football', slug: 'football', parentId: 'cat-3' },
    ],
  },
  {
    id: 'cat-4',
    name: 'Toys',
    slug: 'toys',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    children: [
      { id: 'cat-4-1', name: 'Action Figures', slug: 'action-figures', parentId: 'cat-4' },
      { id: 'cat-4-2', name: 'Dolls & Playsets', slug: 'dolls', parentId: 'cat-4' },
      { id: 'cat-4-3', name: 'LEGO & Construction', slug: 'lego', parentId: 'cat-4' },
      { id: 'cat-4-4', name: 'Arts & Crafts', slug: 'arts-crafts', parentId: 'cat-4' },
      { id: 'cat-4-5', name: 'Outdoor Toys', slug: 'outdoor-toys', parentId: 'cat-4' },
      { id: 'cat-4-6', name: 'Baby & Toddler Toys', slug: 'baby-toys', parentId: 'cat-4' },
    ],
  },
  {
    id: 'cat-5',
    name: 'Baby & Nursery',
    slug: 'baby-nursery',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80',
    children: [
      { id: 'cat-5-1', name: 'Prams & Pushchairs', slug: 'prams', parentId: 'cat-5' },
      { id: 'cat-5-2', name: 'Car Seats', slug: 'car-seats', parentId: 'cat-5' },
      { id: 'cat-5-3', name: 'Baby Feeding', slug: 'baby-feeding', parentId: 'cat-5' },
      { id: 'cat-5-4', name: 'Nursery Furniture', slug: 'nursery-furniture', parentId: 'cat-5' },
    ],
  },
  {
    id: 'cat-6',
    name: 'Health & Beauty',
    slug: 'health-beauty',
    image: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=400&q=80',
    children: [
      { id: 'cat-6-1', name: 'Hair Care', slug: 'hair-care', parentId: 'cat-6' },
      { id: 'cat-6-2', name: 'Skincare', slug: 'skincare', parentId: 'cat-6' },
      { id: 'cat-6-3', name: 'Electric Shavers', slug: 'shavers', parentId: 'cat-6' },
    ],
  },
  {
    id: 'cat-7',
    name: 'Jewellery & Watches',
    slug: 'jewellery-watches',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
    children: [
      { id: 'cat-7-1', name: 'Watches', slug: 'watches', parentId: 'cat-7' },
      { id: 'cat-7-2', name: 'Rings', slug: 'rings', parentId: 'cat-7' },
      { id: 'cat-7-3', name: 'Necklaces', slug: 'necklaces', parentId: 'cat-7' },
    ],
  },
  {
    id: 'cat-8',
    name: 'DIY & Tools',
    slug: 'diy-tools',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80',
    children: [
      { id: 'cat-8-1', name: 'Power Tools', slug: 'power-tools', parentId: 'cat-8' },
      { id: 'cat-8-2', name: 'Hand Tools', slug: 'hand-tools', parentId: 'cat-8' },
      { id: 'cat-8-3', name: 'Ladders & Scaffolding', slug: 'ladders', parentId: 'cat-8' },
    ],
  },
]

export const NAV_CATEGORIES = MOCK_CATEGORIES.map((c) => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  children: c.children ?? [],
}))
