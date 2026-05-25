'use strict'

const { v4: uuidv4 } = require('uuid')

// Fixed product UUIDs for idempotency
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

const now = new Date()

function makeProduct(
  id,
  slug,
  sku,
  name,
  brand,
  description,
  categoryId,
  price,
  compareAtPrice,
  stockCount,
  ratingAverage,
  reviewCount,
  opts = {}
) {
  return {
    id,
    slug,
    sku,
    name,
    brand: brand || null,
    description: description || null,
    category_id: categoryId,
    price,
    compare_at_price: compareAtPrice || null,
    stock_count: stockCount,
    rating_average: ratingAverage,
    review_count: reviewCount,
    features: JSON.stringify(opts.features || []),
    specifications: JSON.stringify(opts.specifications || []),
    delivery_options: JSON.stringify(opts.deliveryOptions || [
      { type: 'standard', label: 'Standard delivery', price: 395 },
      { type: 'express', label: 'Express delivery', price: 595 },
    ]),
    is_active: opts.isActive !== false,
    is_featured: opts.isFeatured === true,
    is_on_offer: opts.isOnOffer === true,
    is_new: opts.isNew === true,
    is_clearance: opts.isClearance === true,
    is_big_deal: opts.isBigDeal === true,
    reserve_available: opts.reserveAvailable === true,
    created_at: now,
    updated_at: now,
  }
}

function makeImage(id, productId, url, sortOrder = 0) {
  return {
    id,
    product_id: productId,
    url,
    alt_text: null,
    sort_order: sortOrder,
    size_label: 'medium',
    created_at: now,
    updated_at: now,
  }
}

// Deterministic placeholder images using picsum with seed
function img(seed, w = 600, h = 600) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`
}

module.exports = {
  async up(queryInterface) {
    // Resolve category IDs by slug so this seeder works even if subcategory UUIDs vary
    const cats = await queryInterface.sequelize.query(
      `SELECT id, slug FROM categories WHERE is_active = true`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    )
    const catMap = {}
    for (const c of cats) catMap[c.slug] = c.id

    const c = (slug) => catMap[slug]
    if (!catMap['tvs'] || !catMap['gaming'] || !catMap['furniture']) {
      console.warn('Warning: not all expected category slugs found. Seeding may be incomplete.')
    }

    // ── Technology ───────────────────────────────────────────────────────────
    await queryInterface.bulkInsert('products', [
      makeProduct(P.p1,  'samsung-55-qled-4k-smart-tv',       'SAM-TV-55Q',   'Samsung 55" QLED 4K Smart TV',                'Samsung',  'Stunning 4K QLED display with Quantum HDR and built-in streaming apps.',        c('tvs'),                 59999, 79999,  42, 4.5, 1243,  { isOnOffer: true, isBigDeal: true }),
      makeProduct(P.p2,  'apple-airpods-pro-2nd-gen',          'APP-APD-PRO2', 'Apple AirPods Pro (2nd Gen)',                 'Apple',    'Active noise cancellation, transparency mode, and spatial audio.',               c('headphones-audio'),   22900, null,   350, 4.8, 5621,  { isNew: true }),
      makeProduct(P.p3,  'sony-wh-1000xm5-wireless',           'SNY-WH-XM5',   'Sony WH-1000XM5 Wireless Headphones',       'Sony',     'Industry-leading noise cancellation with 30-hour battery life.',                 c('headphones-audio'),   29900, 37900,  88, 4.7, 2100,  { isOnOffer: true, isBigDeal: true }),
      makeProduct(P.p4,  'playstation-5-console-disc',         'PS5-DISC-001', 'PlayStation 5 Console (Disc Edition)',        'Sony',     'Next-gen gaming with ultra-high speed SSD and ray tracing support.',             c('gaming'),             44999, null,    0, 4.8, 12450, { reserveAvailable: true, isBigDeal: true }),
      makeProduct(P.p5,  'xbox-series-x-console',              'XBX-SX-001',   'Xbox Series X Console',                     'Microsoft','12 TFLOPS, 1TB SSD, backward compatible with thousands of games.',               c('gaming'),             47999, null,   15, 4.7, 8900),
      makeProduct(P.p6,  'nintendo-switch-oled',               'NTD-SW-OLED',  'Nintendo Switch OLED Model',                'Nintendo', '7-inch OLED screen, enhanced audio, and 64GB internal storage.',                  c('gaming'),             29999, null,   120, 4.6, 3400),
      makeProduct(P.p7,  'apple-iphone-15-pro-256gb',          'APP-IP15P256', 'Apple iPhone 15 Pro 256GB',                 'Apple',    'Titanium design, A17 Pro chip, and advanced camera system.',                    c('phones-smartwatches'),99900, null,   200, 4.7, 8930),
      makeProduct(P.p8,  'samsung-galaxy-s24-ultra-512gb',     'SAM-GS24U512', 'Samsung Galaxy S24 Ultra 512GB',            'Samsung',  '200MP camera, S Pen, and Galaxy AI features.',                                    c('phones-smartwatches'),114900, null,  65, 4.6, 1200, { isNew: true }),
      makeProduct(P.p9,  'apple-watch-series-9-gps',           'APP-AWS9GPS',  'Apple Watch Series 9 GPS',                  'Apple',    'Advanced health sensors and Double Tap gesture.',                                c('phones-smartwatches'),39900, null,   180, 4.7, 4500),
      makeProduct(P.p10, 'dell-xps-15-laptop',                 'DLL-XPS15-01', 'Dell XPS 15 Laptop',                        'Dell',     '13th Gen Intel Core, InfinityEdge display, and premium build.',                    c('computers-tablets'), 139900, null,  30, 4.4, 980),
      makeProduct(P.p11, 'apple-macbook-air-m3-15',            'APP-MBA15M3',  'Apple MacBook Air 15" M3',                 'Apple',    'Thin and light with the powerful M3 chip and 18-hour battery.',                 c('computers-tablets'), 149900, 169900,  55, 4.8, 3200, { isOnOffer: true, isBigDeal: true }),
      makeProduct(P.p12, 'samsung-galaxy-tab-s9-plus',         'SAM-GTS9P',    'Samsung Galaxy Tab S9 Plus',                'Samsung',  '12.4" AMOLED, Snapdragon 8 Gen 2, and included S Pen.',                         c('computers-tablets'), 89900, null,   40, 4.5, 670),
      makeProduct(P.p13, 'canon-eos-r6-mark-ii',               'CAN-R6M2-01',  'Canon EOS R6 Mark II Mirrorless',           'Canon',    'Full-frame 24.2MP, 40fps burst, and advanced autofocus.',                         c('cameras'),           249900, 279900, 12, 4.9, 340,  { isOnOffer: true, isBigDeal: true }),
      makeProduct(P.p14, 'gopro-hero-12-black',                'GOP-H12B-01',  'GoPro HERO12 Black',                        'GoPro',    '5.3K video, HyperSmooth 6.0, and waterproof to 33ft.',                           c('cameras'),           44900, 49900,  78, 4.6, 890,  { isOnOffer: true, isBigDeal: true }),
      makeProduct(P.p15, 'philips-hue-white-colour-starter',   'PHL-HUE-WCS',  'Philips Hue White & Colour Starter Kit',    'Philips',  '3 bulbs, bridge, and 16 million colours with app control.',                      c('smart-home'),         12999, 17999,  110, 4.5, 560,  { isOnOffer: true, isBigDeal: true }),
      makeProduct(P.p16, 'ring-video-doorbell-pro-2',          'RNG-VDBP2-01', 'Ring Video Doorbell Pro 2',                 'Ring',     '1536p HD video, 3D motion detection, and bird\'s eye view.',                      c('smart-home'),         22900, null,   45, 4.3, 2100),
    ], {})

    // ── Home & Garden ────────────────────────────────────────────────────────
    await queryInterface.bulkInsert('products', [
      makeProduct(P.p17, 'dyson-v15-detect-absolute',          'DYS-V15DA-01', 'Dyson V15 Detect Absolute Cordless Vacuum',   'Dyson',    'Laser illumination reveals microscopic dust. Up to 60 minutes runtime.',           c('diy-tools'),          54999, 64999,  28, 4.7, 3210, { isOnOffer: true, isBigDeal: true }),
      makeProduct(P.p18, 'ninja-foodi-max-9in1',              'NJ-FMAX9IN1',  'Ninja Foodi MAX 9-in-1 Multi-Cooker',         'Ninja',    'Pressure cook, air fry, slow cook, bake, and more in one pot.',                    c('kitchen-dining'),     17999, 24999,  95, 4.6, 4560, { isOnOffer: true, isBigDeal: true }),
      makeProduct(P.p19, 'nespresso-vertuo-next-coffee',       'NSP-VRT-NEXT', 'Nespresso Vertuo Next Coffee Machine',      'Nespresso','Centrifusion technology for coffee and espresso in multiple sizes.',                c('kitchen-dining'),     14900, null,   150, 4.4, 1800),
      makeProduct(P.p20, 'ikea-billy-bookcase-white',           'IKE-BILLY-WH', 'IKEA Billy Bookcase White',                 'IKEA',     'Adjustable shelves, classic design, and easy to assemble.',                       c('furniture'),          4500,  null,   300, 4.3, 5600),
      makeProduct(P.p21, 'john-lewis-anyday-sofa-bed',         'JL-ANYSFB-01', 'John Lewis Anyday Sofa Bed',                'John Lewis','Compact sofa that folds out into a comfortable double bed.',                        c('furniture'),          39900, 49900,  18, 4.2, 340,  { isOnOffer: true, isBigDeal: true }),
      makeProduct(P.p22, 'bosch-rotak-340r-lawnmower',         'BSH-RTK340R',  'Bosch Rotak 340R Electric Lawnmower',       'Bosch',    'Lightweight with grass combs for neat edges and 40L grass box.',                  c('garden-outdoor'),     13999, null,   65, 4.5, 780),
      makeProduct(P.p23, 'weber-spirit-ii-e-310-bbq',          'WB-SPII-E310', 'Weber Spirit II E-310 Gas BBQ',             'Weber',    '3 burners, GS4 grilling system, and 10-year warranty.',                          c('garden-outdoor'),     64900, 74900,  22, 4.8, 450,  { isOnOffer: true, isBigDeal: true }),
      makeProduct(P.p24, 'philips-hue-outdoor-light-strip',    'PHL-HUE-OLS',  'Philips Hue Outdoor Light Strip',           'Philips',  'Weatherproof LED strip with millions of colours and app control.',                c('garden-outdoor'),     14999, 19999,  40, 4.4, 320,  { isOnOffer: true, isBigDeal: true }),
      makeProduct(P.p25, 'dunelm-thermal-blackout-curtains',   'DUN-THBC-01',  'Dunelm Thermal Blackout Curtains',          'Dunelm',   'Blocks light and draughts. Machine washable and available in multiple sizes.',     c('bedding-towels'),     3499,  null,   200, 4.1, 1200),
      makeProduct(P.p26, 'argos-home-4-tier-shelving-unit',    'ARG-4TSU-01',  'Argos Home 4-Tier Shelving Unit',           'Argos Home','Metal and wood effect shelving for garage, office, or kitchen.',                   c('furniture'),          2999,  null,   500, 4.0, 890),
    ], {})

    // ── Health & Beauty ──────────────────────────────────────────────────────
    await queryInterface.bulkInsert('products', [
      makeProduct(P.p27, 'dyson-supersonic-hair-dryer',        'DYS-SUP-HD',   'Dyson Supersonic Hair Dryer',               'Dyson',    'Fast drying with intelligent heat control and magnetic attachments.',              c('haircare'),          32900, 37900,  60, 4.7, 4100, { isOnOffer: true, isBigDeal: true }),
      makeProduct(P.p28, 'philips-sonicare-diamondclean-9000', 'PHL-SDC9K-01', 'Philips Sonicare DiamondClean 9000',        'Philips',  'Advanced sonic brushing with smart pressure sensor and app.',                      c('personal-care'),     29999, null,   85, 4.6, 1500),
      makeProduct(P.p29, 'olay-retinol24-night-serum',         'OLY-R24NS-01', 'Olay Retinol24 Night Serum',                'Olay',     'Visible improvements in fine lines, smoothness, and brightness.',                  c('skincare'),          3499,  null,   300, 4.3, 2200),
      makeProduct(P.p30, 'loreal-paris-elvive-dream-lengths',  'LOR-ELVDL-01', 'L\'Oréal Paris Elvive Dream Lengths Shampoo','L\'Oréal','Repairs damaged lengths and prevents split ends with castor oil.',                  c('haircare'),          499,   null,   800, 4.2, 5600),
      makeProduct(P.p31, 'chanel-coco-mademoiselle-edp',       'CHN-CM-EDP50', 'Chanel Coco Mademoiselle EDP 50ml',         'Chanel',   'Oriental fragrance with notes of jasmine, rose, and patchouli.',                    c('fragrance'),         8500,  null,   45, 4.8, 980),
      makeProduct(P.p32, 'maybelline-lash-sensational-maskara','MAY-LSM-01',   'Maybelline Lash Sensational Mascara',       'Maybelline','Fan-effect brush captures every lash for full volume.',                             c('makeup-cosmetics'),  1099,  null,   600, 4.4, 3400),
      makeProduct(P.p33, 'vitabiotics-wellman-30-tablets',     'VTB-WLM-30',   'Vitabiotics Wellman 30 Tablets',            'Vitabiotics','Comprehensive multivitamin for men with 30 nutrients.',                            c('vitamins-supplements'),899,  null,   400, 4.5, 1200),
      makeProduct(P.p34, 'liz-earle-cleanse-polish-150ml',     'LZE-CP-150',   'Liz Earle Cleanse & Polish 150ml',          'Liz Earle','Hot cloth cleanser that removes makeup and daily grime.',                           c('skincare'),          1999,  null,   250, 4.6, 1800),
    ], {})

    // ── Sports & Leisure ─────────────────────────────────────────────────────
    await queryInterface.bulkInsert('products', [
      makeProduct(P.p35, 'fitbit-charge-6-fitness-tracker',    'FTB-C6-001',   'Fitbit Charge 6 Fitness Tracker',           'Fitbit',   'Built-in GPS, 40+ exercise modes, and 7-day battery life.',                      c('fitness-equipment'), 12999, 15999,  150, 4.4, 2340, { isOnOffer: true, isBigDeal: true }),
      makeProduct(P.p36, 'york-fitness-20kg-dumbbell-set',     'YRK-20DBS-01', 'York Fitness 20kg Dumbbell Set',            'York Fitness','Cast iron plates with spinlock collars and comfortable grips.',                    c('fitness-equipment'), 3499,  null,   80, 4.3, 670),
      makeProduct(P.p37, 'carrera-vulcan-e-bike',              'CAR-VUL-E01',  'Carrera Vulcan Electric Mountain Bike',     'Carrera',  '250W motor, 27.5" wheels, and hydraulic disc brakes.',                            c('cycling'),           109900, null,  12, 4.5, 210),
      makeProduct(P.p38, 'regatta-mens-waterproof-jacket',     'REG-MWPJ-01',  'Regatta Men\'s Waterproof Jacket',         'Regatta',  'Breathable Isotex 5000 fabric with sealed seams and adjustable hood.',           c('camping-hiking'),    4999,  null,   120, 4.1, 890),
      makeProduct(P.p39, 'intex-easy-set-pool-10ft',           'INT-ESP10-01', 'Intex Easy Set Pool 10ft',                  'Intex',    'Quick to inflate top ring, easy setup, and includes filter pump.',                c('water-sports'),      5999,  null,   45, 4.0, 340),
      makeProduct(P.p40, 'wilson-us-open-tennis-racket',       'WLS-USO-TR01', 'Wilson US Open Tennis Racket',              'Wilson',   'Lightweight aluminium frame, ideal for beginners and recreational play.',          c('team-sports'),       2499,  null,   90, 4.2, 560),
    ], {})

    // ── Toys & Games ─────────────────────────────────────────────────────────
    await queryInterface.bulkInsert('products', [
      makeProduct(P.p41, 'lego-technic-ferrari-daytona-sp3',   'LEG-42143',    'LEGO Technic Ferrari Daytona SP3',          'LEGO',     '3778 pieces, V12 engine, and opening doors. A collector\'s masterpiece.',         c('action-figures'),    34999, 39999,  35, 4.9, 892,  { isOnOffer: true, isBigDeal: true }),
      makeProduct(P.p42, 'barbie-dreamhouse-playset',          'BRB-DREAM-01', 'Barbie DreamHouse Playset',                 'Barbie',   '3 stories, 8 rooms, pool, slide, and 70+ accessories.',                            c('action-figures'),    9999,  12999,  60, 4.6, 1200, { isOnOffer: true, isBigDeal: true }),
      makeProduct(P.p43, 'monopoly-classic-board-game',        'HB-MON-CLAS',  'Monopoly Classic Board Game',             'Hasbro',   'Buy, sell, and trade properties to build your real estate empire.',                c('board-games-puzzles'),1999,  null,   300, 4.4, 4500),
      makeProduct(P.p44, 'ravensburger-escape-puzzle-759pc',   'RAV-ESC-759',  'Ravensburger Escape Puzzle 759pc',        'Ravensburger','Jigsaw puzzle with hidden riddles and escape-room narrative.',                      c('board-games-puzzles'),1499,  null,   75, 4.5, 340),
      makeProduct(P.p45, 'nerf-elite-2-0-commander-blaster',   'NER-E20-CMD',  'Nerf Elite 2.0 Commander Blaster',        'Nerf',     '6-dart capacity, tactical rails, and slam-fire action.',                           c('outdoor-toys'),      1499,  null,   200, 4.3, 780),
      makeProduct(P.p46, 'play-doh-kitchen-creations-ultimate','PD-KCU-01',    'Play-Doh Kitchen Creations Ultimate',     'Play-Doh', '20 colours and 20 tools for unlimited imaginative cooking fun.',                   c('arts-crafts'),       2499,  null,   150, 4.5, 560),
      makeProduct(P.p47, 'djeco-watercolour-set-36-colours',   'DJC-WC36-01',  'Djeco Watercolour Set 36 Colours',          'Djeco',    'Vibrant, mixable watercolours in a sturdy storage case.',                          c('arts-crafts'),       1299,  null,   80, 4.7, 210),
      makeProduct(P.p48, 'fisher-price-baby-gym',              'FP-BGYM-01',   'Fisher-Price Baby Gym',                   'Fisher-Price','Soft mat with detachable toys, music, and lights for sensory play.',                c('baby-toddler-toys'), 3499,  null,   110, 4.4, 890),
      makeProduct(P.p49, 'hot-wheels-20-car-gift-pack',        'HW-20CGP-01',  'Hot Wheels 20 Car Gift Pack',             'Hot Wheels','Iconic die-cast vehicles in a collectible set.',                                   c('remote-control-toys'),1999,  null,   250, 4.6, 1500),
    ], {})

    // ── Jewellery & Watches ──────────────────────────────────────────────────
    await queryInterface.bulkInsert('products', [
      makeProduct(P.p50, 'casio-g-shock-ga-2100',              'CAS-GA2100-01','Casio G-Shock GA-2100',                     'Casio',    'Carbon core guard, shock resistant, and 200m water resistant.',                    c('watches'),           9999,  null,   100, 4.7, 2300),
      makeProduct(P.p51, 'pandora-moments-snake-chain-bracelet','PAN-MOM-SCB','Pandora Moments Snake Chain Bracelet',      'Pandora',  'Iconic sterling silver bracelet for collecting charms.',                           c('necklaces-bracelets'),5500,  null,   180, 4.5, 1200),
      makeProduct(P.p52, 'swarovski-attract-stud-earrings',    'SWV-ATR-ES01', 'Swarovski Attract Stud Earrings',         'Swarovski','Round-cut crystal in a rhodium-plated setting.',                                  c('rings-earrings'),    6999,  null,   60, 4.6, 450),
      makeProduct(P.p53, 'seiko-5-sports-automatic',           'SEI-5S-AUTO',  'Seiko 5 Sports Automatic Watch',          'Seiko',    'Reliable automatic movement, day-date display, and 100m water resistance.',        c('watches'),           24999, null,   35, 4.4, 320),
      makeProduct(P.p54, 'thomas-sabo-charm-club-heart',       'TSB-CCH-HEART','Thomas Sabo Charm Club Heart',             'Thomas Sabo','Sterling silver heart charm with red enamel.',                                     c('necklaces-bracelets'),3999,  null,   70, 4.3, 180),
    ], {})

    // ── Gifts & Occasions ──────────────────────────────────────────────────────
    await queryInterface.bulkInsert('products', [
      makeProduct(P.p55, 'yankee-candle-large-jar-vanilla',    'YNC-LJV-01',   'Yankee Candle Large Jar Vanilla',           'Yankee Candle','110-150 hours burn time, iconic fragrance, and classic glass jar.',               c('gift-wrapping'),     2499,  null,   300, 4.5, 2100),
      makeProduct(P.p56, 'moonpig-personalised-birthday-card', 'MP-PBC-01',    'Moonpig Personalised Birthday Card',        'Moonpig',  'Upload photos and write custom messages for a unique card.',                      c('birthday-gifts'),    349,   null,   500, 4.2, 3400),
      makeProduct(P.p57, 'thorntons-classic-collection-box',   'THR-CCB-01',   'Thorntons Classic Collection Box',        'Thorntons','Assorted milk, white, and dark chocolates in a gift box.',                         c('christmas-gifts'),   799,   null,   400, 4.4, 1200),
      makeProduct(P.p58, 'john-lewis-gift-card-50',            'JL-GC50-01',   'John Lewis Gift Card £50',                'John Lewis','Redeemable online and in-store across John Lewis and Waitrose.',                   c('gift-cards'),        5000,  null,   1000,4.8, 560),
      makeProduct(P.p59, 'lego-christmas-ornament-santa',      'LEG-XMAS-SAN', 'LEGO Christmas Ornament Santa',             'LEGO',     'Buildable Santa decoration with hanger for the tree.',                             c('christmas-gifts'),   999,   null,   200, 4.6, 340),
      makeProduct(P.p60, 'hallmark-3d-pop-up-birthday-card',     'HMK-3DPBC-01', 'Hallmark 3D Pop-Up Birthday Card',        'Hallmark', 'Intricate pop-up design with envelope and message space.',                         c('birthday-gifts'),    499,   null,   350, 4.3, 890),
    ], {})

    // ── Images (placeholder) ─────────────────────────────────────────────────
    // Insert one placeholder image per product
    const images = []
    for (let i = 1; i <= 60; i++) {
      const id = Object.values(P)[i - 1]
      images.push(makeImage(uuidv4(), id, img(`argos-${i}`), 0))
    }
    await queryInterface.bulkInsert('product_images', images, {})
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('product_images', null, {})
    await queryInterface.bulkDelete('products', null, {})
  },
}
