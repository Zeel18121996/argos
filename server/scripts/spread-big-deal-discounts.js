/**
 * spread-big-deal-discounts.js
 *
 * One-off script to spread the existing Big Deal products' discount % across
 * the four Big Red Event buckets so RED10 / RED20 / RED30 / RED50 each have
 * matching products on the storefront filter.
 *
 * Targets products inserted by `seed-big-deal-products.js` (matched by SKU).
 * Idempotent — re-running yields the same final state.
 *
 * Usage:
 *   node scripts/spread-big-deal-discounts.js
 *
 * Requires DATABASE_URL in .env (or DB_HOST/DB_PORT/DB_USERNAME/DB_PASSWORD/DB_NAME).
 */

'use strict'

const path = require('path')
const { Client } = require('pg')

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

// ── Database connection ─────────────────────────────────────────────────────
const DB_CONFIG = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: false }
  : {
      host:     process.env.DB_HOST     || 'localhost',
      port:     Number(process.env.DB_PORT) || 5432,
      user:     process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_NAME     || 'argos',
    }

// ── Target prices, by SKU ───────────────────────────────────────────────────
// Each row sets price + compareAtPrice so the resulting discount % lands in
// the desired RED10 / RED20 / RED30 / RED50 bucket. All values in pence.
const TARGETS = [
  // RED10 — 10-19% off
  { sku: 'GAR-FR265-01',  price: 34999, compareAtPrice: 42999, bucket: 'RED10' }, // 19%
  { sku: 'BLK-VDM2K-BND', price: 14999, compareAtPrice: 17999, bucket: 'RED10' }, // 17%
  { sku: 'FTB-SENSE2-WHT',price: 24999, compareAtPrice: 29999, bucket: 'RED10' }, // 17%

  // RED20 — 20-29% off
  { sku: 'SAM-GS25FE-256',price: 59999, compareAtPrice: 79999, bucket: 'RED20' }, // 25%
  { sku: 'SHK-ORP2-001',  price: 12999, compareAtPrice: 17999, bucket: 'RED20' }, // 28%
  { sku: 'HAB-JUL-V2S',   price: 47999, compareAtPrice: 59999, bucket: 'RED20' }, // 20%

  // RED30 — 30-49% off
  { sku: 'LG-NANO65-2026',price: 79999, compareAtPrice: 119999,bucket: 'RED30' }, // 33%
  { sku: 'TFL-EFD-11L',   price: 14999, compareAtPrice: 22999, bucket: 'RED30' }, // 35%
  { sku: 'DIM-IFCT-CPR',  price: 9999,  compareAtPrice: 14999, bucket: 'RED30' }, // 33%

  // RED50 — 50%+ off
  { sku: 'ARG-RGS6-001',  price: 37499, compareAtPrice: 74999, bucket: 'RED50' }, // 50%
  { sku: 'NJ-AF100UK',    price: 6499,  compareAtPrice: 12999, bucket: 'RED50' }, // 50%
  { sku: 'BST-RPP-9FT',   price: 2499,  compareAtPrice: 4999,  bucket: 'RED50' }, // 50%
]

function pct(price, compare) {
  if (!compare || compare <= price) return 0
  return Math.round(((compare - price) / compare) * 100)
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const client = new Client(DB_CONFIG)
  await client.connect()
  console.log('🔌  Connected to database\n')

  let updated = 0
  let missing = 0
  const summary = { RED10: 0, RED20: 0, RED30: 0, RED50: 0 }

  for (const t of TARGETS) {
    const result = await client.query(
      `UPDATE products
         SET price            = $1,
             compare_at_price = $2,
             is_on_offer      = TRUE,
             is_big_deal      = TRUE,
             updated_at       = NOW()
       WHERE sku = $3
       RETURNING name`,
      [t.price, t.compareAtPrice, t.sku],
    )

    if (result.rowCount === 0) {
      console.warn(`  ⚠  ${t.sku} not found — run seed-big-deal-products.js first`)
      missing++
      continue
    }

    const name = result.rows[0].name
    const actual = pct(t.price, t.compareAtPrice)
    summary[t.bucket]++
    updated++
    console.log(
      `  ✓  ${t.bucket}  ${actual.toString().padStart(2)}% off  →  ${t.sku.padEnd(16)}  ${name}`,
    )
  }

  await client.end()

  console.log('\n📊  Bucket distribution:')
  for (const [bucket, count] of Object.entries(summary)) {
    console.log(`     ${bucket}: ${count} product(s)`)
  }
  console.log(`\n✅  Done. Updated: ${updated}  |  Missing: ${missing}\n`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
