import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGetBigDealProductsQuery } from '@/services/productsApi'
import ProductCard from '@/components/Common/ProductCard/ProductCard'

// ── Exact Argos CDN image URLs taken from argos.co.uk/events/big-event ──────────────
const CDN = 'https://media.4rgos.it/i/Argos'
const Q = '?w=760&h=507&qlt=75' // 3:2 promo tile quality
const Q4 = '?w=640&h=427&qlt=75' // 4-col tile quality
const QSQ = '?w=640&h=640&qlt=75' // square service cards

// 6 main promo deal tiles (3-column grid)
const MAIN_TILES = [
  {
    src: `${CDN}/1226-m0014-m007-m050-asym-m008-m022-big-red-2792385${Q}`,
    alt: 'The Big Red Event. Save 20% on selected lines. Use code RED20.',
    href: '/browse?onOffer=true',
  },
  {
    src: `${CDN}/1226-m0014-m007-m050-asym-m008-m022-big-red-8981671${Q}`,
    alt: 'The Big Red Event. Save up to 30% on selected garden and outdoor lines.',
    href: '/browse/garden-and-diy?onOffer=true',
  },
  {
    src: `${CDN}/1226-m050-7699830-big-red-save${Q}`,
    alt: 'Save up to 30% on selected hot weather essentials.',
    href: '/browse?onOffer=true',
  },
  {
    src: `${CDN}/1226-m0014-m007-m050-asym-m008-m022-big-red-7712236${Q}`,
    alt: 'The Big Red Event. Save 50% on selected lines. Use code RED50.',
    href: '/browse?onOffer=true',
  },
  {
    src: `${CDN}/1226-m0014-m007-m050-asym-m008-m022-big-red-7843947${Q}`,
    alt: 'The Big Red Event. Save 30% on selected lines. Use code RED30.',
    href: '/browse?onOffer=true',
  },
  {
    src: `${CDN}/1226-m0014-m007-m050-asym-m008-m022-big-red-8907844${Q}`,
    alt: 'The Big Red Event. Save 10% on selected lines. Use code RED10.',
    href: '/browse?onOffer=true',
  },
]

// 4 category deal tiles (4-column grid)
const CATEGORY_TILES = [
  {
    src: `${CDN}/1226-m0014-m007-m050-asym-m008-m022-big-red-7650817${Q4}`,
    alt: 'Save on selected TVs & soundbars. Use codes RED10 & RED20.',
    href: '/browse/technology?onOffer=true',
  },
  {
    src: `${CDN}/1226-m0014-m007-m050-asym-m008-m022-big-red-5810446${Q4}`,
    alt: 'Save on selected Furniture. Use codes RED10, RED20 & RED30.',
    href: '/browse/home-and-furniture?onOffer=true',
  },
  {
    src: `${CDN}/1226-m0014-m007-m050-asym-m008-m022-big-red-1252053${Q4}`,
    alt: 'Save on selected Toys & Nursery. Use codes RED10, RED20, RED30 & RED50.',
    href: '/browse/toys-and-games?onOffer=true',
  },
  {
    src: `${CDN}/1226-m050-7163184-big-red${Q4}`,
    alt: 'Save on selected Sports & Fitness. Use codes RED10, RED20, RED30 & RED50.',
    href: '/browse/sports-and-leisure?onOffer=true',
  },
]

// 4 service / trust cards (square, 4-col)
const SERVICE_CARDS = [
  { src: `${CDN}/0826-M050-1-1-tall-hp-WTP${QSQ}`, alt: 'Ways to pay.', href: '/help/argos-pay' },
  {
    src: `${CDN}/4726-M050-1-1-argos-plus${QSQ}`,
    alt: 'Unlimited delivery with Argos Plus.',
    href: '/features/argos-plus',
  },
  {
    src: `${CDN}/3525-M050-1-1-click-collect${QSQ}`,
    alt: 'Order online & pick up in-store.',
    href: '/help/delivery-and-collection',
  },
  {
    src: `${CDN}/3525-M050-1-1-fast-track${QSQ}`,
    alt: 'Same day delivery.',
    href: '/help/delivery-and-collection',
  },
]

// ── Page sections ───────────────────────────────────────────────────────────────

/** Full-width clickable header banner — identical to argos.co.uk */
function HeaderBanner() {
  return (
    <section aria-label="Big Red Event">
      <Link to="/browse?onOffer=true" data-testid="big-red-event-header-banner">
        <img
          src={`${CDN}/2525-1.2-header-big-red-event?w=1400&h=125&qlt=75`}
          alt="The Big Red Event — savings on 1000s of lines"
          width={1400}
          height={125}
          loading="eager"
          decoding="async"
          className="w-full h-auto block"
        />
      </Link>
    </section>
  )
}

/** 6-tile promo grid (3 columns) — mirrors Argos M050 asymmetric banner module */
function PromoBannerGrid() {
  return (
    <section aria-label="Big Red Event offers" className="bg-white">
      <div className="page-container py-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
          {MAIN_TILES.map((tile) => (
            <Link
              key={tile.src}
              to={tile.href}
              className="block overflow-hidden hover:opacity-95 transition-opacity"
            >
              <img
                src={tile.src}
                alt={tile.alt}
                width={760}
                height={507}
                loading="lazy"
                decoding="async"
                className="w-full h-auto block"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Full-width Argos Pay promotional banner */
function ArgosPayBanner() {
  return (
    <section aria-label="Argos Pay" className="bg-white">
      <div className="page-container py-2">
        <Link to="/help/argos-pay" className="block hover:opacity-95 transition-opacity">
          <img
            src={`${CDN}/1226-m020-M020-Argos-pay-desktab?w=1400&h=210&qlt=75`}
            alt="Buy now, pay in 12 months when you spend £199+. Argos Pay."
            width={1400}
            height={210}
            loading="lazy"
            decoding="async"
            className="w-full h-auto block"
          />
        </Link>
      </div>
    </section>
  )
}

/** 4 category deal tiles (4 columns) */
function CategoryDealBanners() {
  return (
    <section aria-label="Shop by category" className="bg-white">
      <div className="page-container py-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
          {CATEGORY_TILES.map((tile) => (
            <Link
              key={tile.src}
              to={tile.href}
              className="block overflow-hidden hover:opacity-95 transition-opacity"
            >
              <img
                src={tile.src}
                alt={tile.alt}
                width={640}
                height={427}
                loading="lazy"
                decoding="async"
                className="w-full h-auto block"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/** 4 service / trust cards (square, 4 columns) */
function ServiceCards() {
  return (
    <section aria-label="Services" className="bg-white">
      <div className="page-container py-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
          {SERVICE_CARDS.map((card) => (
            <Link
              key={card.src}
              to={card.href}
              className="block overflow-hidden hover:opacity-95 transition-opacity"
            >
              <img
                src={card.src}
                alt={card.alt}
                width={640}
                height={640}
                loading="lazy"
                decoding="async"
                className="w-full h-auto block"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function BigRedEventPage() {
  const { data: products = [], isLoading } = useGetBigDealProductsQuery({ limit: 24 })

  useEffect(() => {
    const prev = document.title
    document.title = 'Big Red Event | Savings on 1000s of Lines | Argos'
    return () => {
      document.title = prev
    }
  }, [])

  return (
    <div className="bg-white">
      {/* 1. Full-width header banner */}
      <HeaderBanner />

      {/* 2. 6-tile main promo grid */}
      <PromoBannerGrid />

      {/* 3. Argos Pay full-width banner */}
      <ArgosPayBanner />

      {/* 4. Category deal banners (4 col) */}
      <CategoryDealBanners />

      {/* 5. Big Deal product grid */}
      <section
        id="big-red-event-products"
        aria-labelledby="bre-products-heading"
        className="page-container py-8"
      >
        <div className="flex items-end justify-between mb-6">
          <h2
            id="bre-products-heading"
            className="text-2xl md:text-[28px] font-bold text-argos-dark leading-tight"
          >
            Big Red Event deals
          </h2>
          <Link
            to="/browse?onOffer=true"
            className="hidden md:inline text-sm font-normal text-argos-blue hover:underline"
          >
            See all offers
          </Link>
        </div>

        {isLoading ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            data-testid="big-red-event-loading"
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-argos-gray-200 rounded animate-pulse">
                <div className="aspect-square w-full" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-argos-gray-300 rounded w-full" />
                  <div className="h-4 bg-argos-gray-300 rounded w-3/4" />
                  <div className="h-10 bg-argos-gray-300 rounded-lg mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-lg font-bold text-argos-dark">Event products coming soon</p>
            <p className="text-sm text-argos-gray mt-2">
              Check back shortly — our buyers are finalising this week’s line-up.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 6. Service / trust cards */}
      <ServiceCards />
    </div>
  )
}
