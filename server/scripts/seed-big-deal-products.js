/**
 * seed-big-deal-products.js
 *
 * Idempotent script to insert / update "Big Deal" products in the database.
 * Safe to re-run — uses ON CONFLICT (id) DO UPDATE for products, and
 * ON CONFLICT DO NOTHING for product_images.
 *
 * Usage:
 *   node scripts/seed-big-deal-products.js
 *
 * Requires DATABASE_URL in .env (or DB_HOST/DB_PORT/DB_USERNAME/DB_PASSWORD/DB_NAME).
 */

'use strict'

const path = require('path')
const { Client } = require('pg')

// Load env from repo root .env (same pattern as sequelize.config.js)
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

// ── Database connection config ───────────────────────────────────────────────
const DB_CONFIG = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: false }
  : {
      host:     process.env.DB_HOST     || 'localhost',
      port:     Number(process.env.DB_PORT) || 5432,
      user:     process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_NAME     || 'argos',
    }

// ── Fixed UUIDs for Big Deal products (separate prefix to avoid collision) ──
const B = {
  b1:  'bbbbbbbb-0000-0000-0000-000000000001',
  b2:  'bbbbbbbb-0000-0000-0000-000000000002',
  b3:  'bbbbbbbb-0000-0000-0000-000000000003',
  b4:  'bbbbbbbb-0000-0000-0000-000000000004',
  b5:  'bbbbbbbb-0000-0000-0000-000000000005',
  b6:  'bbbbbbbb-0000-0000-0000-000000000006',
  b7:  'bbbbbbbb-0000-0000-0000-000000000007',
  b8:  'bbbbbbbb-0000-0000-0000-000000000008',
  b9:  'bbbbbbbb-0000-0000-0000-000000000009',
  b10: 'bbbbbbbb-0000-0000-0000-000000000010',
  b11: 'bbbbbbbb-0000-0000-0000-000000000011',
  b12: 'bbbbbbbb-0000-0000-0000-000000000012',
}

// ── Big Deal product definitions ────────────────────────────────────────────
// Prices are stored in pence (i.e. £1 = 100).
const BIG_DEAL_PRODUCTS = [
  {
    id: B.b1, key: 'b1',
    slug: 'lg-65-nano-4k-uhd-smart-tv',
    sku: 'LG-NANO65-2026',
    name: 'LG NANO 65" 4K UHD AI Smart TV 2026',
    brand: 'LG',
    description: 'Stunning NanoCell 4K with AI-powered upscaling, Dolby Vision IQ, and webOS smart hub.',
    categorySlug: 'tvs',
    price: 79999,
    compareAtPrice: 119999,
    stockCount: 35,
    ratingAverage: 4.7,
    reviewCount: 982,
    isOnOffer: true,
    isBigDeal: true,
    isFeatured: true,
    imageUrl: 'https://media.4rgos.it/s/Argos/8981671_R_SET/1?w=600&h=600&qlt=75',
  },
  {
    id: B.b2, key: 'b2',
    slug: 'samsung-galaxy-s25-fe-256gb',
    sku: 'SAM-GS25FE-256',
    name: 'Samsung Galaxy S25 FE 256GB',
    brand: 'Samsung',
    description: 'Fan Edition flagship with AI camera tools, 120Hz AMOLED, and all-day battery.',
    categorySlug: 'phones-smartwatches',
    price: 59999,
    compareAtPrice: 79999,
    stockCount: 80,
    ratingAverage: 4.6,
    reviewCount: 540,
    isOnOffer: true,
    isBigDeal: true,
    isNew: true,
    imageUrl: 'https://media.4rgos.it/s/Argos/7954465_R_SET/1?w=600&h=600&qlt=75',
  },
  {
    id: B.b3, key: 'b3',
    slug: 'shokz-openrun-pro-2-bone-conduction',
    sku: 'SHK-ORP2-001',
    name: 'Shokz OpenRun Pro 2 Bone Conduction Headphones',
    brand: 'Shokz',
    description: 'Open-ear design, premium audio, 12-hour battery and waterproof for running.',
    categorySlug: 'headphones-audio',
    price: 12999,
    compareAtPrice: 17999,
    stockCount: 120,
    ratingAverage: 4.5,
    reviewCount: 320,
    isOnOffer: true,
    isBigDeal: true,
    imageUrl: 'https://media.4rgos.it/s/Argos/2847319_R_SET/1?w=600&h=600&qlt=75',
  },
  {
    id: B.b4, key: 'b4',
    slug: 'argos-home-6-piece-rope-garden-set',
    sku: 'ARG-RGS6-001',
    name: 'Argos Home 6-Piece Rope Garden Dining Set',
    brand: 'Argos Home',
    description: 'Modern hand-woven rope chairs with cushions and 4-seater glass table. Weather resistant.',
    categorySlug: 'garden-outdoor',
    price: 49999,
    compareAtPrice: 74999,
    stockCount: 18,
    ratingAverage: 4.6,
    reviewCount: 210,
    isOnOffer: true,
    isBigDeal: true,
    isFeatured: true,
    imageUrl: 'https://media.4rgos.it/s/Argos/8038551_R_SET/1?w=600&h=600&qlt=75',
  },
  {
    id: B.b5, key: 'b5',
    slug: 'garmin-forerunner-265-gps-watch',
    sku: 'GAR-FR265-01',
    name: 'Garmin Forerunner 265 GPS Running Watch',
    brand: 'Garmin',
    description: 'AMOLED display, multi-band GPS, training readiness and 13-day battery in smartwatch mode.',
    categorySlug: 'phones-smartwatches',
    price: 34999,
    compareAtPrice: 42999,
    stockCount: 55,
    ratingAverage: 4.8,
    reviewCount: 670,
    isOnOffer: true,
    isBigDeal: true,
    imageUrl: 'https://media.4rgos.it/s/Argos/3288393_R_SET/1?w=600&h=600&qlt=75',
  },
  {
    id: B.b6, key: 'b6',
    slug: 'ninja-af100uk-air-fryer-39l',
    sku: 'NJ-AF100UK',
    name: 'Ninja AF100UK Air Fryer 3.9L',
    brand: 'Ninja',
    description: 'Cook crispy meals using little to no oil. 4 cooking functions, dishwasher safe.',
    categorySlug: 'kitchen-dining',
    price: 8999,
    compareAtPrice: 12999,
    stockCount: 200,
    ratingAverage: 4.7,
    reviewCount: 4200,
    isOnOffer: true,
    isBigDeal: true,
    imageUrl: 'https://media.4rgos.it/s/Argos/9473250_R_SET/1?w=600&h=600&qlt=75',
  },
  {
    id: B.b7, key: 'b7',
    slug: 'tefal-easy-fry-dual-xxl-11l',
    sku: 'TFL-EFD-11L',
    name: 'Tefal Easy Fry Dual XXL 11L Air Fryer',
    brand: 'Tefal',
    description: 'Cook two foods simultaneously with dual baskets. 11L capacity, feeds the whole family.',
    categorySlug: 'kitchen-dining',
    price: 14999,
    compareAtPrice: 22999,
    stockCount: 75,
    ratingAverage: 4.6,
    reviewCount: 1280,
    isOnOffer: true,
    isBigDeal: true,
    imageUrl: 'https://media.4rgos.it/s/Argos/2150130_R_SET/1?w=600&h=600&qlt=75',
  },
  {
    id: B.b8, key: 'b8',
    slug: 'dimplex-ion-fresh-cooling-tower-fan',
    sku: 'DIM-IFCT-CPR',
    name: 'Dimplex Ion Fresh Cooling Tower Fan - Copper',
    brand: 'Dimplex',
    description: 'Quiet, oscillating tower fan with ionizer for fresher air and remote control.',
    categorySlug: 'kitchen-dining',
    price: 9999,
    compareAtPrice: 14999,
    stockCount: 90,
    ratingAverage: 4.4,
    reviewCount: 540,
    isOnOffer: true,
    isBigDeal: true,
    imageUrl: 'https://media.4rgos.it/s/Argos/8636160_R_SET/1?w=600&h=600&qlt=75',
  },
  {
    id: B.b9, key: 'b9',
    slug: 'blink-video-doorbell-mini-2k-bundle',
    sku: 'BLK-VDM2K-BND',
    name: 'Blink Video Doorbell & Mini 2K+ Security Cam (2 Pack)',
    brand: 'Blink',
    description: 'HD video doorbell plus indoor security cameras with two-way audio and motion alerts.',
    categorySlug: 'smart-home',
    price: 11999,
    compareAtPrice: 17999,
    stockCount: 65,
    ratingAverage: 4.5,
    reviewCount: 890,
    isOnOffer: true,
    isBigDeal: true,
    imageUrl: 'https://media.4rgos.it/s/Argos/8114792_R_SET/1?w=600&h=600&qlt=75',
  },
  {
    id: B.b10, key: 'b10',
    slug: 'bestway-rectangular-paddling-pool-9ft',
    sku: 'BST-RPP-9FT',
    name: 'Bestway Rectangular Paddling Pool - 9ft',
    brand: 'Bestway',
    description: 'Spacious 9ft rectangular paddling pool, perfect for the whole family on warm days.',
    categorySlug: 'outdoor-toys',
    price: 3499,
    compareAtPrice: 4999,
    stockCount: 240,
    ratingAverage: 4.4,
    reviewCount: 431,
    isOnOffer: true,
    isBigDeal: true,
    imageUrl: 'https://media.4rgos.it/s/Argos/9539314_R_SET/1?w=600&h=600&qlt=75',
  },
  {
    id: B.b11, key: 'b11',
    slug: 'fitbit-sense-2-smart-watch',
    sku: 'FTB-SENSE2-WHT',
    name: 'Fitbit Sense 2 Smart Watch - Lunar White/Platinum',
    brand: 'Fitbit',
    description: 'Advanced health smartwatch with stress management, ECG and 6+ day battery.',
    categorySlug: 'phones-smartwatches',
    price: 19999,
    compareAtPrice: 29999,
    stockCount: 70,
    ratingAverage: 4.5,
    reviewCount: 1153,
    isOnOffer: true,
    isBigDeal: true,
    imageUrl: 'https://media.4rgos.it/s/Argos/1153712_R_SET/1?w=600&h=600&qlt=75',
  },
  {
    id: B.b12, key: 'b12',
    slug: 'habitat-julien-velvet-2-seater-sofa',
    sku: 'HAB-JUL-V2S',
    name: 'Habitat Julien Velvet 2 Seater Sofa',
    brand: 'Habitat',
    description: 'Modern mid-century inspired velvet sofa with solid wood legs. Available in multiple colours.',
    categorySlug: 'furniture',
    price: 39999,
    compareAtPrice: 59999,
    stockCount: 12,
    ratingAverage: 4.6,
    reviewCount: 180,
    isOnOffer: true,
    isBigDeal: true,
    isFeatured: true,
    imageUrl: 'https://media.4rgos.it/s/Argos/4269139_R_SET/1?w=600&h=600&qlt=75',
  },
]

const DEFAULT_DELIVERY_OPTIONS = JSON.stringify([
  { type: 'standard', label: 'Standard delivery', price: 395 },
  { type: 'express',  label: 'Express delivery',  price: 595 },
])

// Stable image UUIDs derived from product UUID (so re-runs don't duplicate)
function imageIdFor(productId) {
  // Replace the first segment so it visually differs from product UUID.
  return productId.replace(/^bbbbbbbb/, 'cccccccc')
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const client = new Client(DB_CONFIG)
  await client.connect()
  console.log('🔌  Connected to database\n')

  // 1. Resolve category IDs by slug
  const { rows: cats } = await client.query(
    `SELECT id, slug FROM categories WHERE is_active = true`
  )
  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]))

  // 2. Upsert each product
  let inserted = 0
  let updated  = 0
  let skipped  = 0

  for (const p of BIG_DEAL_PRODUCTS) {
    const categoryId = catMap[p.categorySlug]
    if (!categoryId) {
      console.warn(`  ⚠  Skipping ${p.key} (${p.slug}) — category '${p.categorySlug}' not found`)
      skipped++
      continue
    }

    // Upsert product
    const result = await client.query(
      `INSERT INTO products (
         id, slug, sku, name, brand, description,
         category_id, price, compare_at_price, stock_count,
         rating_average, review_count,
         features, specifications, delivery_options,
         is_active, is_featured, is_on_offer, is_new, is_clearance, is_big_deal, reserve_available,
         created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6,
         $7, $8, $9, $10,
         $11, $12,
         $13::jsonb, $14::jsonb, $15::jsonb,
         $16, $17, $18, $19, $20, $21, $22,
         NOW(), NOW()
       )
       ON CONFLICT (id) DO UPDATE SET
         slug             = EXCLUDED.slug,
         sku              = EXCLUDED.sku,
         name             = EXCLUDED.name,
         brand            = EXCLUDED.brand,
         description      = EXCLUDED.description,
         category_id      = EXCLUDED.category_id,
         price            = EXCLUDED.price,
         compare_at_price = EXCLUDED.compare_at_price,
         stock_count      = EXCLUDED.stock_count,
         rating_average   = EXCLUDED.rating_average,
         review_count     = EXCLUDED.review_count,
         is_featured      = EXCLUDED.is_featured,
         is_on_offer      = EXCLUDED.is_on_offer,
         is_new           = EXCLUDED.is_new,
         is_big_deal      = EXCLUDED.is_big_deal,
         updated_at       = NOW()
       RETURNING (xmax = 0) AS inserted`,
      [
        p.id, p.slug, p.sku, p.name, p.brand, p.description,
        categoryId, p.price, p.compareAtPrice ?? null, p.stockCount,
        p.ratingAverage, p.reviewCount,
        JSON.stringify(p.features || []),
        JSON.stringify(p.specifications || []),
        DEFAULT_DELIVERY_OPTIONS,
        true,                       // is_active
        p.isFeatured  === true,     // is_featured
        p.isOnOffer   === true,     // is_on_offer
        p.isNew       === true,     // is_new
        p.isClearance === true,     // is_clearance
        p.isBigDeal   === true,     // is_big_deal
        p.reserveAvailable === true,// reserve_available
      ],
    )

    const wasInserted = result.rows[0]?.inserted === true
    if (wasInserted) {
      inserted++
      console.log(`  ➕  ${p.key} → inserted "${p.name}"`)
    } else {
      updated++
      console.log(`  ✓  ${p.key} → updated  "${p.name}"`)
    }

    // Upsert primary product image
    if (p.imageUrl) {
      await client.query(
        `INSERT INTO product_images (
           id, product_id, url, alt_text, sort_order, size_label, created_at, updated_at
         ) VALUES ($1, $2, $3, $4, 0, 'medium', NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET
           url        = EXCLUDED.url,
           alt_text   = EXCLUDED.alt_text,
           updated_at = NOW()`,
        [imageIdFor(p.id), p.id, p.imageUrl, p.name],
      )
    }
  }

  await client.end()
  console.log(
    `\n✅  Done. Inserted: ${inserted}  |  Updated: ${updated}  |  Skipped: ${skipped}\n`
  )
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
