'use strict'

const { v4: uuidv4 } = require('uuid')

// Fixed UUIDs so re-running the seed is idempotent (same IDs every time)
const IDS = {
  // Top-level
  technology:    '11111111-0000-0000-0000-000000000001',
  homeGarden:    '11111111-0000-0000-0000-000000000002',
  healthBeauty:  '11111111-0000-0000-0000-000000000003',
  sports:        '11111111-0000-0000-0000-000000000004',
  toys:          '11111111-0000-0000-0000-000000000005',
  jewellery:     '11111111-0000-0000-0000-000000000006',
  gifts:         '11111111-0000-0000-0000-000000000007',
}

module.exports = {
  async up(queryInterface) {
    const now = new Date()

    // ── Depth 0: Top-level ────────────────────────────────────────────────────
    await queryInterface.bulkInsert('categories', [
      { id: IDS.technology,   slug: 'technology',           name: 'Technology',           parent_id: null, depth: 0, sort_order: 1, is_active: true, created_at: now, updated_at: now },
      { id: IDS.homeGarden,   slug: 'home-and-garden',      name: 'Home & Garden',         parent_id: null, depth: 0, sort_order: 2, is_active: true, created_at: now, updated_at: now },
      { id: IDS.healthBeauty, slug: 'health-and-beauty',    name: 'Health & Beauty',       parent_id: null, depth: 0, sort_order: 3, is_active: true, created_at: now, updated_at: now },
      { id: IDS.sports,       slug: 'sports-and-leisure',   name: 'Sports & Leisure',      parent_id: null, depth: 0, sort_order: 4, is_active: true, created_at: now, updated_at: now },
      { id: IDS.toys,         slug: 'toys-and-games',       name: 'Toys & Games',          parent_id: null, depth: 0, sort_order: 5, is_active: true, created_at: now, updated_at: now },
      { id: IDS.jewellery,    slug: 'jewellery-and-watches','name': 'Jewellery & Watches',  parent_id: null, depth: 0, sort_order: 6, is_active: true, created_at: now, updated_at: now },
      { id: IDS.gifts,        slug: 'gifts-and-occasions',  name: 'Gifts & Occasions',     parent_id: null, depth: 0, sort_order: 7, is_active: true, created_at: now, updated_at: now },
    ], {})

    // ── Depth 1: Technology sub-categories ───────────────────────────────────
    await queryInterface.bulkInsert('categories', [
      { id: uuidv4(), slug: 'tvs',                  name: 'TVs',                     parent_id: IDS.technology,   depth: 1, sort_order: 1, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'computers-tablets',    name: 'Computers & Tablets',     parent_id: IDS.technology,   depth: 1, sort_order: 2, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'phones-smartwatches',  name: 'Phones & Smart Watches',  parent_id: IDS.technology,   depth: 1, sort_order: 3, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'gaming',               name: 'Gaming',                  parent_id: IDS.technology,   depth: 1, sort_order: 4, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'smart-home',           name: 'Smart Home',              parent_id: IDS.technology,   depth: 1, sort_order: 5, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'cameras',              name: 'Cameras',                 parent_id: IDS.technology,   depth: 1, sort_order: 6, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'headphones-audio',     name: 'Headphones & Audio',      parent_id: IDS.technology,   depth: 1, sort_order: 7, is_active: true, created_at: now, updated_at: now },
    ], {})

    // ── Depth 1: Home & Garden sub-categories ────────────────────────────────
    await queryInterface.bulkInsert('categories', [
      { id: uuidv4(), slug: 'furniture',            name: 'Furniture',               parent_id: IDS.homeGarden,   depth: 1, sort_order: 1, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'bedding-towels',       name: 'Bedding & Towels',        parent_id: IDS.homeGarden,   depth: 1, sort_order: 2, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'kitchen-dining',       name: 'Kitchen & Dining',        parent_id: IDS.homeGarden,   depth: 1, sort_order: 3, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'garden-outdoor',       name: 'Garden & Outdoor',        parent_id: IDS.homeGarden,   depth: 1, sort_order: 4, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'diy-tools',            name: 'DIY & Tools',             parent_id: IDS.homeGarden,   depth: 1, sort_order: 5, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'lighting',             name: 'Lighting',                parent_id: IDS.homeGarden,   depth: 1, sort_order: 6, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'home-decor',           name: 'Home Décor',              parent_id: IDS.homeGarden,   depth: 1, sort_order: 7, is_active: true, created_at: now, updated_at: now },
    ], {})

    // ── Depth 1: Health & Beauty sub-categories ──────────────────────────────
    await queryInterface.bulkInsert('categories', [
      { id: uuidv4(), slug: 'skincare',             name: 'Skincare',                parent_id: IDS.healthBeauty, depth: 1, sort_order: 1, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'haircare',             name: 'Haircare',                parent_id: IDS.healthBeauty, depth: 1, sort_order: 2, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'fragrance',            name: 'Fragrance',               parent_id: IDS.healthBeauty, depth: 1, sort_order: 3, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'makeup-cosmetics',     name: 'Makeup & Cosmetics',      parent_id: IDS.healthBeauty, depth: 1, sort_order: 4, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'personal-care',        name: 'Personal Care',           parent_id: IDS.healthBeauty, depth: 1, sort_order: 5, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'vitamins-supplements', name: 'Vitamins & Supplements',  parent_id: IDS.healthBeauty, depth: 1, sort_order: 6, is_active: true, created_at: now, updated_at: now },
    ], {})

    // ── Depth 1: Sports & Leisure sub-categories ─────────────────────────────
    await queryInterface.bulkInsert('categories', [
      { id: uuidv4(), slug: 'fitness-equipment',    name: 'Fitness Equipment',       parent_id: IDS.sports,       depth: 1, sort_order: 1, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'cycling',              name: 'Cycling',                 parent_id: IDS.sports,       depth: 1, sort_order: 2, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'outdoor-sports',       name: 'Outdoor Sports',          parent_id: IDS.sports,       depth: 1, sort_order: 3, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'team-sports',          name: 'Team Sports',             parent_id: IDS.sports,       depth: 1, sort_order: 4, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'water-sports',         name: 'Water Sports',            parent_id: IDS.sports,       depth: 1, sort_order: 5, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'camping-hiking',       name: 'Camping & Hiking',        parent_id: IDS.sports,       depth: 1, sort_order: 6, is_active: true, created_at: now, updated_at: now },
    ], {})

    // ── Depth 1: Toys & Games sub-categories ─────────────────────────────────
    await queryInterface.bulkInsert('categories', [
      { id: uuidv4(), slug: 'baby-toddler-toys',    name: 'Baby & Toddler Toys',     parent_id: IDS.toys,         depth: 1, sort_order: 1, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'action-figures',       name: 'Action Figures & Dolls',  parent_id: IDS.toys,         depth: 1, sort_order: 2, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'arts-crafts',          name: 'Arts & Crafts',           parent_id: IDS.toys,         depth: 1, sort_order: 3, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'board-games-puzzles',  name: 'Board Games & Puzzles',   parent_id: IDS.toys,         depth: 1, sort_order: 4, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'outdoor-toys',         name: 'Outdoor Toys',            parent_id: IDS.toys,         depth: 1, sort_order: 5, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'remote-control-toys',  name: 'Remote Control Toys',     parent_id: IDS.toys,         depth: 1, sort_order: 6, is_active: true, created_at: now, updated_at: now },
    ], {})

    // ── Depth 1: Jewellery & Watches sub-categories ───────────────────────────
    await queryInterface.bulkInsert('categories', [
      { id: uuidv4(), slug: 'rings-earrings',       name: 'Rings & Earrings',        parent_id: IDS.jewellery,    depth: 1, sort_order: 1, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'necklaces-bracelets',  name: 'Necklaces & Bracelets',   parent_id: IDS.jewellery,    depth: 1, sort_order: 2, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'watches',              name: 'Watches',                 parent_id: IDS.jewellery,    depth: 1, sort_order: 3, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'mens-jewellery',       name: "Men's Jewellery",         parent_id: IDS.jewellery,    depth: 1, sort_order: 4, is_active: true, created_at: now, updated_at: now },
    ], {})

    // ── Depth 1: Gifts & Occasions sub-categories ────────────────────────────
    await queryInterface.bulkInsert('categories', [
      { id: uuidv4(), slug: 'birthday-gifts',       name: 'Birthday Gifts',          parent_id: IDS.gifts,        depth: 1, sort_order: 1, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'christmas-gifts',      name: 'Christmas Gifts',         parent_id: IDS.gifts,        depth: 1, sort_order: 2, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'gift-cards',           name: 'Gift Cards',              parent_id: IDS.gifts,        depth: 1, sort_order: 3, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), slug: 'gift-wrapping',        name: 'Gift Wrapping',           parent_id: IDS.gifts,        depth: 1, sort_order: 4, is_active: true, created_at: now, updated_at: now },
    ], {})

    // ── Top-level category images — used by homepage category scroll & mega menu
    const topLevelImages = [
      { id: IDS.technology,   image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80' },
      { id: IDS.homeGarden,   image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80' },
      { id: IDS.healthBeauty, image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80' },
      { id: IDS.sports,       image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80' },
      { id: IDS.toys,         image_url: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&q=80' },
      { id: IDS.jewellery,    image_url: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=400&q=80' },
      { id: IDS.gifts,        image_url: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&q=80' },
    ]
    for (const { id, image_url } of topLevelImages) {
      await queryInterface.bulkUpdate('categories', { image_url, updated_at: now }, { id })
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('categories', null, {})
  },
}
