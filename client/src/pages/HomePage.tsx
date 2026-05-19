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
import { useGetProductsQuery } from '@/services/productsApi'
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
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    variant: 'argos-pay',
    title: '0% Interest.^ Pay over 24 months on 100s of products.',
    subtitle: 'Across top brands, home essentials and everyday must-haves.',
    cta: 'Argos Pay',
    ctaLink: '/help/argos-pay',
    accent: '#D42114',
    products: [
      {
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&q=80',
        name: 'Sony BRAVIA 7 Smart 4K HDR QLED Freeview TV',
        pricePerMonth: 'From ₹7,499 pm*',
      },
      {
        image: 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=400&q=80',
        name: 'Sage The Barista Express Espresso Coffee Machine',
        pricePerMonth: 'From ₹2,099 pm*',
      },
      {
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
        name: 'Habitat Julien Velvet 2 Seater Sofa',
        pricePerMonth: 'From ₹2,499 pm*',
      },
    ],
  },
  {
    id: 2,
    variant: 'image',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1400&q=80',
    title: 'Up to 50% off Technology',
    subtitle: 'Laptops, TVs, gaming and more',
    cta: 'Shop now',
    ctaLink: '/browse/technology',
    accent: '#028940',
  },
  {
    id: 3,
    variant: 'image',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1400&q=80',
    title: 'Summer Garden Sale',
    subtitle: 'Save 20% on selected garden & outdoor',
    cta: 'Shop garden',
    ctaLink: '/browse/home-and-garden',
    accent: '#044C99',
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
    id: 'argos-pay',
    label: '0% interest available^',
    bg: '#D42114',
    fg: '#FFFFFF',
    href: '/help/argos-pay',
    badge: 'Argos\nPay',
    image: 'https://media.4rgos.it/i/Argos/0925-m052-visualnav-argos-pay',
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
  return [600, 1000, 1400, 1800]
    .map((w) => `${base}${join}w=${w} ${w}w`)
    .join(', ')
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
  const heroSwiperRef = useRef<SwiperClass | null>(null)
  const [heroActiveIndex, setHeroActiveIndex] = useState(0)
  const reduceMotion = usePrefersReducedMotion()

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

            <div ref={catScrollRef} onScroll={updateCatArrows} className="category-carousel-container">
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
                              <Icon size={44} strokeWidth={1.5} className="text-argos-charcoal" aria-hidden="true" />
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
            autoplay={reduceMotion ? false : { delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true }}
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
                    <div className="relative aspect-[16/7] min-h-[280px] sm:aspect-[16/6] lg:aspect-[16/5] overflow-hidden bg-argos-gray-bg">
                      <img
                        src={slide.image}
                        srcSet={buildSrcSet(slide.image)}
                        sizes="(min-width: 1024px) 1400px, 100vw"
                        alt={slide.title}
                        className="w-full h-full object-cover"
                        // First slide is the LCP — prioritise it and load eagerly.
                        loading={index === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                        // @ts-expect-error — fetchpriority is valid HTML but missing from React types <19.2
                        fetchpriority={index === 0 ? 'high' : 'auto'}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                      <div className="absolute inset-0 flex items-center">
                        <div className="page-container">
                          <div className="max-w-md">
                            <h2 className="text-2xl md:text-[42px] font-bold text-white mb-2 leading-tight tracking-tight">
                              {slide.title}
                            </h2>
                            <p className="text-white/90 text-sm md:text-base mb-5 font-normal">
                              {slide.subtitle}
                            </p>
                            <Link
                              to={slide.ctaLink}
                              className="inline-block text-white font-bold text-sm px-6 py-3 rounded-sm hover:brightness-110 transition-all"
                              style={{ backgroundColor: slide.accent }}
                            >
                              {slide.cta}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Pagination — proper tablist semantics so a screen reader knows
            which slide is active without relying on visual styling. */}
        <div className="flex items-center justify-center gap-3 py-2.5 bg-white">
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
        </div>
      </section>

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
          spaceBetween={12}
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
