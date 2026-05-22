/**
 * download-product-images.js
 *
 * Downloads product images from Argos CDN / Unsplash and saves them
 * to server/uploads/products/, then updates product_images rows in the DB.
 *
 * Usage:
 *   node scripts/download-product-images.js
 *
 * Requires DATABASE_URL in .env (read from repo root).
 */

'use strict'

const https = require('https')
const http  = require('http')
const fs    = require('fs')
const path  = require('path')
const { Client } = require('pg')

// ── Database connection config ────────────────────────────────────────────────
const DB_CONFIG = {
  host:     'localhost',
  port:     5432,
  user:     'postgres',
  password: '123456',
  database: 'argos',
}

const UPLOADS_DIR  = path.resolve(__dirname, '../uploads/products')
const BASE_URL     = '/static/uploads/products'

// ── Fixed product UUIDs (must match the seeder) ───────────────────────────────
const P = {
  p1:  'aaaaaaaa-0000-0000-0000-000000000001',
  p2:  'aaaaaaaa-0000-0000-0000-000000000002',
  p3:  'aaaaaaaa-0000-0000-0000-000000000003',
  p4:  'aaaaaaaa-0000-0000-0000-000000000004',
  p5:  'aaaaaaaa-0000-0000-0000-000000000005',
  p6:  'aaaaaaaa-0000-0000-0000-000000000006',
  p7:  'aaaaaaaa-0000-0000-0000-000000000007',
  p8:  'aaaaaaaa-0000-0000-0000-000000000008',
  p9:  'aaaaaaaa-0000-0000-0000-000000000009',
  p10: 'aaaaaaaa-0000-0000-0000-000000000010',
  p11: 'aaaaaaaa-0000-0000-0000-000000000011',
  p12: 'aaaaaaaa-0000-0000-0000-000000000012',
  p13: 'aaaaaaaa-0000-0000-0000-000000000013',
  p14: 'aaaaaaaa-0000-0000-0000-000000000014',
  p15: 'aaaaaaaa-0000-0000-0000-000000000015',
  p16: 'aaaaaaaa-0000-0000-0000-000000000016',
  p17: 'aaaaaaaa-0000-0000-0000-000000000017',
  p18: 'aaaaaaaa-0000-0000-0000-000000000018',
  p19: 'aaaaaaaa-0000-0000-0000-000000000019',
  p20: 'aaaaaaaa-0000-0000-0000-000000000020',
  p21: 'aaaaaaaa-0000-0000-0000-000000000021',
  p22: 'aaaaaaaa-0000-0000-0000-000000000022',
  p23: 'aaaaaaaa-0000-0000-0000-000000000023',
  p24: 'aaaaaaaa-0000-0000-0000-000000000024',
  p25: 'aaaaaaaa-0000-0000-0000-000000000025',
  p26: 'aaaaaaaa-0000-0000-0000-000000000026',
  p27: 'aaaaaaaa-0000-0000-0000-000000000027',
  p28: 'aaaaaaaa-0000-0000-0000-000000000028',
  p29: 'aaaaaaaa-0000-0000-0000-000000000029',
  p30: 'aaaaaaaa-0000-0000-0000-000000000030',
  p31: 'aaaaaaaa-0000-0000-0000-000000000031',
  p32: 'aaaaaaaa-0000-0000-0000-000000000032',
  p33: 'aaaaaaaa-0000-0000-0000-000000000033',
  p34: 'aaaaaaaa-0000-0000-0000-000000000034',
  p35: 'aaaaaaaa-0000-0000-0000-000000000035',
  p36: 'aaaaaaaa-0000-0000-0000-000000000036',
  p37: 'aaaaaaaa-0000-0000-0000-000000000037',
  p38: 'aaaaaaaa-0000-0000-0000-000000000038',
  p39: 'aaaaaaaa-0000-0000-0000-000000000039',
  p40: 'aaaaaaaa-0000-0000-0000-000000000040',
  p41: 'aaaaaaaa-0000-0000-0000-000000000041',
  p42: 'aaaaaaaa-0000-0000-0000-000000000042',
  p43: 'aaaaaaaa-0000-0000-0000-000000000043',
  p44: 'aaaaaaaa-0000-0000-0000-000000000044',
  p45: 'aaaaaaaa-0000-0000-0000-000000000045',
  p46: 'aaaaaaaa-0000-0000-0000-000000000046',
  p47: 'aaaaaaaa-0000-0000-0000-000000000047',
  p48: 'aaaaaaaa-0000-0000-0000-000000000048',
  p49: 'aaaaaaaa-0000-0000-0000-000000000049',
  p50: 'aaaaaaaa-0000-0000-0000-000000000050',
  p51: 'aaaaaaaa-0000-0000-0000-000000000051',
  p52: 'aaaaaaaa-0000-0000-0000-000000000052',
  p53: 'aaaaaaaa-0000-0000-0000-000000000053',
  p54: 'aaaaaaaa-0000-0000-0000-000000000054',
  p55: 'aaaaaaaa-0000-0000-0000-000000000055',
  p56: 'aaaaaaaa-0000-0000-0000-000000000056',
  p57: 'aaaaaaaa-0000-0000-0000-000000000057',
  p58: 'aaaaaaaa-0000-0000-0000-000000000058',
  p59: 'aaaaaaaa-0000-0000-0000-000000000059',
  p60: 'aaaaaaaa-0000-0000-0000-000000000060',
}

// ── Source image URLs (Argos CDN + Unsplash fallbacks) ────────────────────────
const IMAGES = [
  { key: 'p1',  filename: 'p01-samsung-tv.jpg',            src: 'https://media.4rgos.it/s/Argos/7483383_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p2',  filename: 'p02-airpods-pro.jpg',           src: 'https://media.4rgos.it/s/Argos/7797134_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p3',  filename: 'p03-sony-wh1000xm5.jpg',        src: 'https://media.4rgos.it/s/Argos/2847319_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p4',  filename: 'p04-ps5-disc.jpg',              src: 'https://media.4rgos.it/s/Argos/7726844_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p5',  filename: 'p05-xbox-series-x.jpg',         src: 'https://media.4rgos.it/s/Argos/4881139_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p6',  filename: 'p06-nintendo-switch-oled.jpg',  src: 'https://media.4rgos.it/s/Argos/4651510_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p7',  filename: 'p07-iphone-15-pro.jpg',         src: 'https://media.4rgos.it/s/Argos/3298620_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p8',  filename: 'p08-galaxy-s24-ultra.jpg',      src: 'https://media.4rgos.it/s/Argos/7954465_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p9',  filename: 'p09-apple-watch-s9.jpg',        src: 'https://media.4rgos.it/s/Argos/7797639_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p10', filename: 'p10-dell-xps-15.jpg',           src: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80' },
  { key: 'p11', filename: 'p11-macbook-air-m3.jpg',        src: 'https://media.4rgos.it/s/Argos/7419405_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p12', filename: 'p12-galaxy-tab-s9.jpg',         src: 'https://media.4rgos.it/s/Argos/3134193_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p13', filename: 'p13-canon-eos-r6.jpg',          src: 'https://media.4rgos.it/s/Argos/2158259_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p14', filename: 'p14-gopro-hero12.jpg',          src: 'https://media.4rgos.it/s/Argos/3209011_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p15', filename: 'p15-philips-hue-starter.jpg',   src: 'https://media.4rgos.it/s/Argos/9182950_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p16', filename: 'p16-ring-doorbell-pro2.jpg',    src: 'https://media.4rgos.it/s/Argos/9441866_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p17', filename: 'p17-dyson-v15.jpg',             src: 'https://media.4rgos.it/s/Argos/4725666_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p18', filename: 'p18-ninja-foodi-max.jpg',       src: 'https://media.4rgos.it/s/Argos/9473250_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p19', filename: 'p19-nespresso-vertuo.jpg',      src: 'https://media.4rgos.it/s/Argos/7142583_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p20', filename: 'p20-ikea-billy.jpg',            src: 'https://media.4rgos.it/s/Argos/4861104_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p21', filename: 'p21-jl-sofa-bed.jpg',           src: 'https://media.4rgos.it/s/Argos/4269139_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p22', filename: 'p22-bosch-lawnmower.jpg',       src: 'https://media.4rgos.it/s/Argos/7468683_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p23', filename: 'p23-weber-bbq.jpg',             src: 'https://media.4rgos.it/s/Argos/7656536_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p24', filename: 'p24-philips-hue-strip.jpg',     src: 'https://media.4rgos.it/s/Argos/8465805_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p25', filename: 'p25-blackout-curtains.jpg',     src: 'https://media.4rgos.it/s/Argos/3347588_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p26', filename: 'p26-argos-shelving.jpg',        src: 'https://media.4rgos.it/s/Argos/4861104_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p27', filename: 'p27-dyson-supersonic.jpg',      src: 'https://media.4rgos.it/s/Argos/7662836_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p28', filename: 'p28-philips-sonicare.jpg',      src: 'https://media.4rgos.it/s/Argos/3112407_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p29', filename: 'p29-olay-serum.jpg',            src: 'https://media.4rgos.it/s/Argos/7818381_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p30', filename: 'p30-loreal-shampoo.jpg',        src: 'https://images.unsplash.com/photo-1626843693476-30e6a41b7f0b?w=600&q=80' },
  { key: 'p31', filename: 'p31-chanel-edp.jpg',            src: 'https://media.4rgos.it/s/Argos/8039712_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p32', filename: 'p32-maybelline-mascara.jpg',    src: 'https://images.unsplash.com/photo-1631214500004-de83b48f5edb?w=600&q=80' },
  { key: 'p33', filename: 'p33-vitabiotics-wellman.jpg',   src: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80' },
  { key: 'p34', filename: 'p34-liz-earle-cleanser.jpg',    src: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80' },
  { key: 'p35', filename: 'p35-fitbit-charge6.jpg',        src: 'https://media.4rgos.it/s/Argos/3288393_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p36', filename: 'p36-york-dumbbells.jpg',        src: 'https://media.4rgos.it/s/Argos/8962449_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p37', filename: 'p37-carrera-ebike.jpg',         src: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&q=80' },
  { key: 'p38', filename: 'p38-regatta-jacket.jpg',        src: 'https://media.4rgos.it/s/Argos/tuc147138354_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p39', filename: 'p39-intex-pool.jpg',            src: 'https://media.4rgos.it/s/Argos/9533169_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p40', filename: 'p40-wilson-racket.jpg',         src: 'https://media.4rgos.it/s/Argos/7343894_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p41', filename: 'p41-lego-ferrari.jpg',          src: 'https://media.4rgos.it/s/Argos/9549562_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p42', filename: 'p42-barbie-dreamhouse.jpg',     src: 'https://images.unsplash.com/photo-1631390694765-65a75e6a1614?w=600&q=80' },
  { key: 'p43', filename: 'p43-monopoly.jpg',              src: 'https://media.4rgos.it/s/Argos/7554731_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p44', filename: 'p44-ravensburger-puzzle.jpg',   src: 'https://media.4rgos.it/s/Argos/4589792_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p45', filename: 'p45-nerf-blaster.jpg',          src: 'https://media.4rgos.it/s/Argos/7700059_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p46', filename: 'p46-play-doh.jpg',              src: 'https://media.4rgos.it/s/Argos/7122448_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p47', filename: 'p47-djeco-watercolour.jpg',     src: 'https://media.4rgos.it/s/Argos/7950294_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p48', filename: 'p48-fisher-price-gym.jpg',      src: 'https://media.4rgos.it/s/Argos/8171687_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p49', filename: 'p49-hot-wheels.jpg',            src: 'https://media.4rgos.it/s/Argos/2259828_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p50', filename: 'p50-casio-gshock.jpg',          src: 'https://media.4rgos.it/s/Argos/2533393_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p51', filename: 'p51-pandora-bracelet.jpg',      src: 'https://media.4rgos.it/s/Argos/9591163_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p52', filename: 'p52-swarovski-earrings.jpg',    src: 'https://media.4rgos.it/s/Argos/7786509_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p53', filename: 'p53-seiko-watch.jpg',           src: 'https://media.4rgos.it/s/Argos/7565782_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p54', filename: 'p54-thomas-sabo-charm.jpg',     src: 'https://media.4rgos.it/s/Argos/3154087_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p55', filename: 'p55-yankee-candle.jpg',         src: 'https://media.4rgos.it/s/Argos/8199700_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p56', filename: 'p56-moonpig-card.jpg',          src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  { key: 'p57', filename: 'p57-thorntons-chocolates.jpg',  src: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&q=80' },
  { key: 'p58', filename: 'p58-gift-card-50.jpg',          src: 'https://media.4rgos.it/s/Argos/1359073_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p59', filename: 'p59-lego-christmas.jpg',        src: 'https://media.4rgos.it/s/Argos/7784312_R_SET/1?w=600&h=600&qlt=75' },
  { key: 'p60', filename: 'p60-hallmark-popup-card.jpg',   src: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&q=80' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function download(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http
    const file  = fs.createWriteStream(dest)

    const request = proto.get(url, (res) => {
      // Follow redirects (max 5)
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
        file.close()
        fs.unlink(dest, () => {})
        return download(res.headers.location, dest).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) {
        file.close()
        fs.unlink(dest, () => {})
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`))
      }
      res.pipe(file)
      file.on('finish', () => file.close(resolve))
    })

    request.on('error', (err) => {
      file.close()
      fs.unlink(dest, () => {})
      reject(err)
    })
  })
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // 1. Ensure uploads/products directory exists
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  console.log(`📁  Saving images to: ${UPLOADS_DIR}`)

  // 2. Download each image
  let downloaded = 0
  let skipped    = 0
  let failed     = 0

  for (const { key, filename, src } of IMAGES) {
    const dest = path.join(UPLOADS_DIR, filename)

    // Skip if already downloaded
    if (fs.existsSync(dest)) {
      console.log(`  ⏭  ${filename} (already exists)`)
      skipped++
      continue
    }

    try {
      process.stdout.write(`  ⬇  ${filename} ... `)
      await download(src, dest)
      console.log('✓')
      downloaded++
    } catch (err) {
      console.log(`✗  ${err.message}`)
      failed++
    }
  }

  console.log(`\n📊  Downloaded: ${downloaded}  |  Skipped: ${skipped}  |  Failed: ${failed}`)

  // 3. Connect to DB and update product_images URLs
  const client = new Client(DB_CONFIG)
  await client.connect()
  console.log('\n🔌  Connected to database. Updating image URLs...\n')

  let updated = 0
  let missing = 0

  for (const { key, filename } of IMAGES) {
    const productId  = P[key]
    const localUrl   = `${BASE_URL}/${filename}`
    const localPath  = path.join(UPLOADS_DIR, filename)

    // Only update if the file actually downloaded
    if (!fs.existsSync(localPath)) {
      console.log(`  ⚠  ${filename} not found on disk — skipping DB update`)
      missing++
      continue
    }

    const result = await client.query(
      `UPDATE product_images
          SET url = $1, updated_at = NOW()
        WHERE product_id = $2`,
      [localUrl, productId],
    )

    if (result.rowCount > 0) {
      console.log(`  ✓  ${key} → ${localUrl}`)
      updated++
    } else {
      // Row may not exist yet — insert it
      await client.query(
        `INSERT INTO product_images (id, product_id, url, alt_text, sort_order, size_label, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, NULL, 0, 'medium', NOW(), NOW())
         ON CONFLICT DO NOTHING`,
        [productId, localUrl],
      )
      console.log(`  ➕  ${key} → inserted ${localUrl}`)
      updated++
    }
  }

  await client.end()
  console.log(`\n✅  DB update complete. ${updated} rows updated/inserted, ${missing} skipped.\n`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
