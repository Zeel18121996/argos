import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation } from 'swiper/modules'
import type { Swiper as SwiperClass } from 'swiper'
import 'swiper/css'
import 'swiper/css/navigation'
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Tv,
  Sofa,
  Trees,
  Gamepad2,
  Baby,
  Sparkles,
  Dumbbell,
  Watch,
  Gift,
  Shirt,
  ChefHat,
  Wrench,
  HeartHandshake,
  type LucideIcon,
} from 'lucide-react'
import { useGetCategoriesQuery } from '@/services/categoriesApi'
import { useGetProductsQuery, useGetProductsBySlugsQuery } from '@/services/productsApi'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import ProductCard from '@/components/Common/ProductCard/ProductCard'
import { cn } from '@/utils/cn'
import { resolveImageUrl } from '@/utils/imageUrl'

type HeroSlide = {
  id: number
  variant: 'argos-pay' | 'image'
  title: string
  subtitle?: string
  cta: string
  ctaLink: string
  accent: string
  image?: string
  products?: { image: string; name: string; pricePerMonth: string }[]
  ctaButtons?: { label: string; href: string }[]
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 0,
    variant: 'image',
    // Real Argos Big Red Event hero — scraped from argos.co.uk 2026-05-25
    image: 'https://media.4rgos.it/i/Argos/1226-M001.5-hero-big-red-p1-desktab-v4_1',
    title: 'Big Red Event — up to 50% off',
    subtitle: 'Massive savings across the store. Ends Sunday 31 May.',
    cta: 'Shop the event',
    ctaLink: '/events/big-red-event',
    accent: '#D42114',
    ctaButtons: [
      { label: 'Save 10% with RED10', href: '/events/big-red-event' },
      { label: 'Save 20% with RED20', href: '/events/big-red-event' },
      { label: 'Save 30% with RED30', href: '/events/big-red-event' },
      { label: 'Save 50% with RED50', href: '/events/big-red-event' },
    ],
  },
  {
    id: 1,
    variant: 'image',
    // Real Argos second hero — scraped from argos.co.uk 2026-05-25
    image: 'https://media.4rgos.it/i/Argos/1226-M001.5-hero-8981671-desktab',
    title: 'Summer Garden Sale',
    subtitle: 'Save up to 30% on selected garden & outdoor lines',
    cta: 'Shop garden',
    ctaLink: '/browse/home-and-garden',
    accent: '#028940',
    ctaButtons: [
      { label: 'Save on garden furniture', href: '/browse/home-and-garden' },
      { label: 'Save on BBQs', href: '/browse/home-and-garden' },
      { label: 'Save on outdoor decorations', href: '/browse/home-and-garden' },
      { label: 'Shop all', href: '/browse/home-and-garden' },
    ],
  },
]

type PinnedTile = {
  id: string
  label: string
  bg: string
  fg: string
  href: string
  badge?: string
  image?: string
}

const PINNED_TILES: PinnedTile[] = [
  {
    id: 'big-red-event',
    label: 'The Big Red Event',
    bg: '#D42114',
    fg: '#FFFFFF',
    href: '/events/big-red-event',
    badge: 'The Big Red\nEvent',
    // Live Argos visual nav tile — scraped 2026-05-25
    image: 'https://media.4rgos.it/i/Argos/M052-visualnav-the-bigred-event-homepage',
  },
  {
    id: 'keeping-cool',
    label: 'Keeping cool',
    bg: '#044C99',
    fg: '#FFFFFF',
    href: '/browse/home-and-garden',
    badge: 'Keeping\ncool',
    // Live Argos visual nav tile — scraped 2026-05-25
    image: 'https://media.4rgos.it/i/Argos/1226-m052-visualnav-keeping-cool',
  },
  {
    id: 'top-100',
    label: 'Shop top 100 deals',
    bg: '#D42114',
    fg: '#FFFFFF',
    href: '/search?q=top-100-deals',
    badge: 'Top\n100 deals',
    image: 'https://media.4rgos.it/i/Argos/3925-m052-visualnav-bf-top-100-deal',
  },
]

const JUST_FOR_YOU_TILE: PinnedTile = {
  id: 'just-for-you',
  label: 'Just for you',
  bg: '#FFFFFF',
  fg: '#044C99',
  href: '/search?q=just-for-you',
  badge: 'Just for\nyou',
  image: 'https://media.4rgos.it/i/Argos/1825-visualnav-hp-just-for-you',
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  technology: Tv,
  'home-and-garden': Sofa,
  'home-and-furniture': Sofa,
  'garden-and-diy': Trees,
  gaming: Gamepad2,
  toys: Baby,
  'toys-and-games': Baby,
  'health-and-beauty': Sparkles,
  'sports-and-leisure': Dumbbell,
  'jewellery-and-watches': Watch,
  'gifts-and-occasions': Gift,
  'tu-clothing': Shirt,
  clothing: Shirt,
  'appliances-and-floorcare': ChefHat,
  appliances: ChefHat,
  diy: Wrench,
  'just-for-you': HeartHandshake,
}

function getCategoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICONS[slug] ?? Sofa
}

const CATEGORY_IMAGES: Record<string, string> = {
  'home-and-furniture': 'https://media.4rgos.it/i/Argos/3125-visualnav-hp-sofa-7290411',
  'home-and-garden': 'https://media.4rgos.it/i/Argos/3125-visualnav-hp-sofa-7290411',
  'garden-and-diy': 'https://media.4rgos.it/i/Argos/2325-m052-visualnav-garden',
  technology: 'https://media.4rgos.it/i/Argos/3925-m052-visualnav-3240173',
  gaming: 'https://media.4rgos.it/i/Argos/1225-visualnav-hp-gaming',
  toys: 'https://media.4rgos.it/i/Argos/3525-m052-visualnav-7617874-toy',
  'toys-and-games': 'https://media.4rgos.it/i/Argos/3525-m052-visualnav-7617874-toy',
  'appliances-and-floorcare': 'https://media.4rgos.it/i/Argos/1225-visualnav-hp-homeappliance',
  appliances: 'https://media.4rgos.it/i/Argos/1225-visualnav-hp-homeappliance',
  'health-and-beauty': 'https://media.4rgos.it/i/Argos/1225-visualnav-hp-health-beauty',
  'tu-clothing': 'https://media.4rgos.it/i/Argos/2325-m052-visualnav-tu',
  clothing: 'https://media.4rgos.it/i/Argos/2325-m052-visualnav-tu',
  'sports-and-leisure': 'https://media.4rgos.it/i/Argos/3025-m052-visualnav-sports-liesure',
  'baby-and-nursery': 'https://media.4rgos.it/i/Argos/1225-visualnav-hp-baby',
  baby: 'https://media.4rgos.it/i/Argos/1225-visualnav-hp-baby',
  'jewellery-and-watches': 'https://media.4rgos.it/i/Argos/1225-visualnav-hp-watches',
  'pet-care': 'https://media.4rgos.it/i/Argos/1225-visualnav-hp-petcare',
  pets: 'https://media.4rgos.it/i/Argos/1225-visualnav-hp-petcare',
  'gifts-and-parties': 'https://media.4rgos.it/i/Argos/1225-visualnav-hp-gifting',
  'gifts-and-occasions': 'https://media.4rgos.it/i/Argos/1225-visualnav-hp-gifting',
  inspiration: 'https://media.4rgos.it/i/Argos/1225-visualnav-hp-idea',
  clearance: 'https://media.4rgos.it/i/Argos/2625-m052-visualnav-clearance',
  diy: 'https://media.4rgos.it/i/Argos/2325-m052-visualnav-garden',
}

function getCategoryFallbackImage(slug: string): string | undefined {
  return CATEGORY_IMAGES[slug]
}

// ── Build srcset for Unsplash-style URLs (paramised image CDN) ─────────────
function buildSrcSet(url: string | undefined): string | undefined {
  if (!url) return undefined
  // Replace any existing &w=NNN with the target widths.
  const base = url.replace(/&w=\d+/g, '')
  const join = base.includes('?') ? '&' : '?'
  return [600, 1000, 1400, 1800].map((w) => `${base}${join}w=${w} ${w}w`).join(', ')
}

// ── Reduced-motion preference hook ─────────────────────────────────────────
function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefers(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefers(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return prefers
}

function ArgosPayHeroSlide({ slide }: { slide: HeroSlide }) {
  return (
    <div
      className="relative aspect-[16/7] min-h-[280px] sm:aspect-[16/6] lg:aspect-[16/5] overflow-hidden"
      style={{ backgroundColor: slide.accent }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(110deg, #fde8e9 0%, #fde8e9 40%, transparent 40.5%, transparent 60%, #B31B10 60.5%, #B31B10 100%)',
        }}
      />
      <div className="relative page-container h-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_minmax(180px,220px)] gap-4 h-full items-center">
          <div className="py-6">
            <h2 className="text-[28px] sm:text-[34px] md:text-[40px] font-bold text-argos-red leading-[1.1] mb-3">
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p className="text-argos-charcoal text-[14px] sm:text-base mb-4 max-w-md">
                {slide.subtitle}
              </p>
            )}
            <Link
              to={slide.ctaLink}
              className="inline-flex items-center justify-center bg-argos-red text-white font-bold text-[14px] px-5 py-2.5 rounded-sm hover:bg-argos-red-dark transition-colors"
            >
              {slide.cta}
            </Link>
          </div>

          <div className="hidden lg:flex items-center justify-center h-full">
            {slide.products?.[0] && (
              <img
                src={slide.products[0].image}
                srcSet={buildSrcSet(slide.products[0].image)}
                sizes="(min-width: 1024px) 33vw, 0px"
                alt={slide.products[0].name}
                className="max-h-[280px] object-contain"
                loading="lazy"
                decoding="async"
              />
            )}
          </div>

          <div className="hidden lg:flex flex-col justify-center gap-4 text-white">
            {slide.products?.slice(0, 3).map((p) => (
              <div key={p.name}>
                <p className="text-[12px] font-bold leading-tight line-clamp-2">{p.name}</p>
                <p className="text-[16px] font-bold mt-0.5">{p.pricePerMonth}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { data: categories = [] } = useGetCategoriesQuery()
  const { data: productsResponse, isLoading: productsLoading } = useGetProductsQuery({ limit: 24 })
  const products = productsResponse?.items ?? []

  // Recently viewed — loaded from localStorage, then fetched from the API
  const { slugs: recentSlugs } = useRecentlyViewed()
  const { data: recentProducts = [], isLoading: recentLoading } = useGetProductsBySlugsQuery(
    recentSlugs,
    { skip: recentSlugs.length === 0 },
  )
  // Re-sort API results to match the localStorage order (most recently viewed first).
  const sortedRecentProducts = recentSlugs
    .map((slug) => recentProducts.find((p) => p.slug === slug))
    .filter(Boolean) as typeof recentProducts
  const heroSwiperRef = useRef<SwiperClass | null>(null)
  const [heroActiveIndex, setHeroActiveIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const reduceMotion = usePrefersReducedMotion()

  const toggleAutoplay = () => {
    const swiper = heroSwiperRef.current
    if (!swiper) return
    if (isPlaying) {
      swiper.autoplay.stop()
      setIsPlaying(false)
    } else {
      swiper.autoplay.start()
      setIsPlaying(true)
    }
  }

  const catScrollRef = useRef<HTMLDivElement>(null)
  const [showCatPrev, setShowCatPrev] = useState(false)
  const [showCatNext, setShowCatNext] = useState(true)

  const updateCatArrows = () => {
    const el = catScrollRef.current
    if (!el) return
    setShowCatPrev(el.scrollLeft > 4)
    setShowCatNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    updateCatArrows()
  }, [categories.length])

  const scrollCats = (dir: 'prev' | 'next') => {
    const el = catScrollRef.current
    if (!el) return
    const amount = Math.max(el.clientWidth * 0.75, 320)
    el.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' })
  }

  return (
    <div className="bg-white">
      {/* Category icon carousel — argos.co.uk visualnav layout */}
      <div className="category-carousel-wrapper">
        <div className="page-container">
          <div className="category-carousel-overflow">
            {showCatPrev && (
              <button
                type="button"
                onClick={() => scrollCats('prev')}
                aria-label="Previous"
                className="carousel-btn carousel-btn--prev hidden md:flex"
              >
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
            )}

            <div
              ref={catScrollRef}
              onScroll={updateCatArrows}
              className="category-carousel-container"
            >
              <ol className="category-carousel-list">
                {[...PINNED_TILES, JUST_FOR_YOU_TILE].map((tile) => (
                  <li key={tile.id} className="category-carousel-item">
                    <div className="category-slide-item">
                      <Link to={tile.href} className="category-link">
                        {tile.image ? (
                          <img
                            src={tile.image}
                            alt=""
                            className="category-img"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div
                            className="category-img category-img--icon"
                            style={{ backgroundColor: tile.bg, color: tile.fg }}
                          >
                            <span className="text-[15px] font-bold leading-tight whitespace-pre-line text-center">
                              {tile.badge}
                            </span>
                          </div>
                        )}
                        <p className="category-label">{tile.label}</p>
                      </Link>
                    </div>
                  </li>
                ))}

                {categories.map((cat) => {
                  const Icon = getCategoryIcon(cat.slug)
                  const imgSrc = cat.imageUrl
                    ? resolveImageUrl(cat.imageUrl)
                    : getCategoryFallbackImage(cat.slug)
                  return (
                    <li key={cat.id} className="category-carousel-item">
                      <div className="category-slide-item">
                        <Link to={`/browse/${cat.slug}`} className="category-link">
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt=""
                              className="category-img"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="category-img category-img--icon">
                              <Icon
                                size={44}
                                strokeWidth={1.5}
                                className="text-argos-charcoal"
                                aria-hidden="true"
                              />
                            </div>
                          )}
                          <p className="category-label">{cat.name}</p>
                        </Link>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>

            {showCatNext && (
              <button
                type="button"
                onClick={() => scrollCats('next')}
                aria-label="Next"
                className="carousel-btn carousel-btn--next hidden md:flex"
              >
                <ChevronRight size={20} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hero Carousel — accessible carousel pattern */}
      <section
        className="hero-slider-wrap px-4"
        aria-roledescription="carousel"
        aria-label="Featured promotions"
      >
        <div className="overflow-hidden rounded-2xl">
          <Swiper
            modules={[Autoplay]}
            autoplay={
              reduceMotion
                ? false
                : { delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true }
            }
            loop
            onSwiper={(s) => {
              heroSwiperRef.current = s
            }}
            onSlideChange={(s) => {
              setHeroActiveIndex(s.realIndex)
            }}
            a11y={{
              prevSlideMessage: 'Previous slide',
              nextSlideMessage: 'Next slide',
            }}
            className="w-full"
          >
            {HERO_SLIDES.map((slide, index) => (
              <SwiperSlide key={slide.id}>
                <div
                  id={`hero-slide-${index}`}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${HERO_SLIDES.length}: ${slide.title}`}
                >
                  {slide.variant === 'argos-pay' ? (
                    <ArgosPayHeroSlide slide={slide} />
                  ) : (
                    <div className="relative aspect-[4/3] sm:aspect-[10/3] overflow-hidden bg-argos-gray-bg">
                      <img
                        src={slide.image}
                        srcSet={buildSrcSet(slide.image)}
                        sizes="(min-width: 640px) 1440px, 100vw"
                        alt={slide.title}
                        className="absolute inset-0 w-full h-full object-cover object-center"
                        // First slide is the LCP — prioritise it and load eagerly.
                        loading={index === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                        // @ts-expect-error — fetchpriority is valid HTML but missing from React types <19.2
                        fetchpriority={index === 0 ? 'high' : 'auto'}
                      />
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* ── Slide-specific CTA button row — sits directly below the image */}
        {(() => {
          const slide = HERO_SLIDES[heroActiveIndex]
          const btns = slide?.ctaButtons
          if (!btns?.length) return null
          return (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
              {btns.map((btn) => (
                <Link
                  key={btn.label}
                  to={btn.href}
                  className="flex items-center justify-center py-4 px-3 rounded-lg text-white text-[15px] font-bold text-center transition-colors hover:brightness-110"
                  style={{ backgroundColor: slide.accent }}
                >
                  {btn.label}
                </Link>
              ))}
            </div>
          )
        })()}

        {/* Pagination — proper tablist semantics so a screen reader knows
            which slide is active without relying on visual styling. */}
        <div className="relative flex items-center justify-center gap-3 py-2.5 bg-white">
          <button
            onClick={() => heroSwiperRef.current?.slidePrev()}
            className="w-8 h-8 rounded-full bg-white border border-argos-gray-200 flex items-center justify-center hover:bg-argos-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-argos-blue transition-colors shrink-0"
            aria-label="Previous slide"
            type="button"
          >
            <ChevronLeft size={14} className="text-argos-charcoal" aria-hidden="true" />
          </button>

          <div role="tablist" aria-label="Hero slides" className="flex items-center gap-3">
            {HERO_SLIDES.map((_, i) => {
              const isActive = i === heroActiveIndex
              return (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`hero-slide-${i}`}
                  aria-label={`Slide ${i + 1} of ${HERO_SLIDES.length}`}
                  onClick={() => heroSwiperRef.current?.slideToLoop(i)}
                  className={cn(
                    'transition-all duration-300 rounded-full h-3',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-argos-blue focus-visible:ring-offset-1',
                    isActive
                      ? 'w-8 bg-argos-blue'
                      : 'w-3 bg-argos-gray-500 hover:bg-argos-gray-mid',
                  )}
                />
              )
            })}
          </div>

          <button
            onClick={() => heroSwiperRef.current?.slideNext()}
            className="w-8 h-8 rounded-full bg-white border border-argos-gray-200 flex items-center justify-center hover:bg-argos-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-argos-blue transition-colors shrink-0"
            aria-label="Next slide"
            type="button"
          >
            <ChevronRight size={14} className="text-argos-charcoal" aria-hidden="true" />
          </button>

          {/* Pause / Play — right-aligned like live Argos */}
          {!reduceMotion && (
            <button
              type="button"
              onClick={toggleAutoplay}
              aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
              className="absolute right-0 flex items-center gap-1.5 text-[14px] font-bold text-argos-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-argos-blue"
            >
              {isPlaying ? (
                <>
                  <Pause size={14} aria-hidden="true" /> Pause
                </>
              ) : (
                <>
                  <Play size={14} aria-hidden="true" /> Play
                </>
              )}
            </button>
          )}
        </div>
        {/* end pagination row */}
      </section>

      {/* ── Pick up where you left off ────────────────────────────────── */}
      {(recentLoading || sortedRecentProducts.length > 0) && (
        <div className="bg-white border-t border-argos-border">
          <div className="page-container py-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[26px] font-bold text-argos-dark leading-normal">
                Pick up where you left off
              </h2>
              <Link
                to="/browse"
                className="flex items-center gap-1 text-[16px] font-normal text-argos-blue hover:underline"
              >
                See all <ChevronRight size={14} aria-hidden="true" />
              </Link>
            </div>

            {recentLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-gray-200 aspect-square rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <Swiper
                modules={[Navigation]}
                navigation
                slidesPerView={2}
                spaceBetween={16}
                className="swiper-product-cards"
                breakpoints={{
                  480: { slidesPerView: 3 },
                  768: { slidesPerView: 4 },
                  1024: { slidesPerView: 5 },
                  1280: { slidesPerView: 6 },
                }}
              >
                {sortedRecentProducts.map((product) => (
                  <SwiperSlide key={product.id}>
                    <ProductCard product={product} />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>
        </div>
      )}

      {/* Products */}
      <div className="page-container py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[30px] font-bold text-argos-dark leading-normal">Products</h2>
          <Link
            to="/browse"
            className="flex items-center gap-1 text-[16px] font-normal text-argos-blue hover:underline"
          >
            See all <ChevronRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <Swiper
          modules={[Navigation]}
          navigation
          slidesPerView={2}
          spaceBetween={16}
          className="swiper-product-cards"
          breakpoints={{
            480: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 5 },
            1280: { slidesPerView: 6 },
          }}
        >
          {productsLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <SwiperSlide key={i}>
                  <div className="bg-gray-200 aspect-square rounded animate-pulse" />
                </SwiperSlide>
              ))
            : products.map((product) => (
                <SwiperSlide key={product.id}>
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
        </Swiper>
      </div>
    </div>
  )
}
