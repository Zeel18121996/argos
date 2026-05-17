import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import {
  ChevronLeft,
  ChevronRight,
  Truck,
  RotateCcw,
  ShieldCheck,
  Store,
  MapPin,
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
import {
  useGetSaleProductsQuery,
  useGetNewProductsQuery,
  useGetFeaturedProductsQuery,
} from '@/services/productsApi'
import ProductCard from '@/components/Common/ProductCard/ProductCard'
import { cn } from '@/utils/cn'
import { resolveImageUrl } from '@/utils/imageUrl'

// Argos-style hero slides — first one mirrors the live "0% Interest / Argos Pay" promo
// you see on argos.co.uk: vibrant red diagonal background, bold headline, Argos Pay
// pill, product cluster on the right with "From £X.XX pm*" callouts.
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
        pricePerMonth: 'From £74.96 pm*',
      },
      {
        image: 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=400&q=80',
        name: 'Sage The Barista Express Espresso Coffee Machine',
        pricePerMonth: 'From £20.79 pm*',
      },
      {
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
        name: 'Habitat Julien Velvet 2 Seater Sofa',
        pricePerMonth: 'From £24.80 pm*',
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

// Argos pinned promo tiles — the ones that appear before the category icons
// on the live homepage (Argos Pay, Top 100 deals, Just for you).
type PinnedTile = {
  id: string
  label: string
  bg: string
  fg: string
  href: string
  badge?: string // small image / wordmark, optional
}
const PINNED_TILES: PinnedTile[] = [
  {
    id: 'argos-pay',
    label: '0% interest available^',
    bg: '#D42114',
    fg: '#FFFFFF',
    href: '/help/argos-pay',
    badge: 'Argos\nPay',
  },
  {
    id: 'top-100',
    label: 'Shop top 100 deals',
    bg: '#D42114',
    fg: '#FFFFFF',
    href: '/search?q=top-100-deals',
    badge: 'Top\n100 deals',
  },
]

// "Just for you" tile sits AFTER pinned promos but BEFORE the dynamic
// categories, exactly like on argos.co.uk.
const JUST_FOR_YOU_TILE: PinnedTile = {
  id: 'just-for-you',
  label: 'Just for you',
  bg: '#FFFFFF',
  fg: '#044C99',
  href: '/search?q=just-for-you',
  badge: 'Just for\nyou',
}

// Slug → Lucide icon mapping for category tiles. Falls back to ShoppingCart for
// any unmapped slug. Includes common Argos category slugs from the seeded data.
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

const SEASONAL_CARDS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
    title: 'Bring the Café home',
    subtitle: 'Barista-style at home, with up to 30% off selected machines.',
    link: '/browse/home-and-garden',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80',
    title: 'Save 20% on selected garden & outdoor',
    subtitle: 'Using code GREEN20 at checkout.',
    link: '/browse/home-and-garden',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    title: 'Save ½ on selected toys',
    subtitle: 'Includes arts & crafts, scooters & more!',
    link: '/browse/toys-and-games',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80',
    title: 'New LEGO sets just arrived',
    subtitle: 'Shop Technic, Icons and more.',
    link: '/browse/toys-and-games',
  },
]

const TRENDING_CARDS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
    title: 'A-mazing deals',
    subtitle: 'All the best deals in one place. See it. Love it. Get it.',
    link: '/search?q=deals',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
    title: 'Everyday value',
    subtitle: 'Quality you trust at prices you love. Includes home and furniture.',
    link: '/browse/home-and-garden',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600&q=80',
    title: 'New in Gaming',
    subtitle: 'The hottest consoles, accessories and games.',
    link: '/browse/technology',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=600&q=80',
    title: 'Health & Beauty',
    subtitle: 'Discover top brands and must-have products.',
    link: '/browse/health-and-beauty',
  },
]

const SERVICES = [
  {
    icon: Truck,
    title: 'Same day delivery',
    subtitle: 'Buy online by 1pm. Get it delivered by 9pm.',
  },
  {
    icon: Store,
    title: 'Reserve & collect',
    subtitle: 'Ready in 60 seconds at your nearest store.',
  },
  { icon: RotateCcw, title: 'Free returns', subtitle: 'Easy returns within 30 days of purchase.' },
  {
    icon: ShieldCheck,
    title: 'Secure payments',
    subtitle: 'Shop with confidence with safe checkout.',
  },
]

function SectionHeader({
  title,
  seeAllLink,
  seeAllLabel = 'See all',
}: {
  title: string
  seeAllLink?: string
  seeAllLabel?: string
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-[30px] font-bold text-argos-dark leading-normal">{title}</h2>
      {seeAllLink && (
        <Link
          to={seeAllLink}
          className="flex items-center gap-1 text-[16px] font-normal text-argos-blue hover:underline"
        >
          {seeAllLabel} <ChevronRight size={14} />
        </Link>
      )}
    </div>
  )
}

function EditorialCard({
  image,
  title,
  subtitle,
  link,
}: {
  image: string
  title: string
  subtitle: string
  link: string
}) {
  return (
    <Link
      to={link}
      className="group block overflow-hidden rounded-sm border border-argos-border bg-white hover:shadow-md transition-shadow"
    >
      <div className="aspect-[4/3] overflow-hidden bg-argos-gray-50">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <h4 className="text-[20px] font-bold text-argos-dark mb-1 line-clamp-2 leading-normal">
          {title}
        </h4>
        <p className="text-[16px] leading-[24px] text-argos-gray-600 mb-2 line-clamp-2">
          {subtitle}
        </p>
        <span className="text-[16px] font-normal text-argos-green">Shop now</span>
      </div>
    </Link>
  )
}

// ── "0% Interest" Argos-Pay hero slide ─────────────────────────────────────
function ArgosPayHeroSlide({ slide }: { slide: HeroSlide }) {
  return (
    <div
      className="relative h-[280px] sm:h-[360px] md:h-[420px] lg:h-[460px] overflow-hidden"
      style={{ backgroundColor: slide.accent }}
    >
      {/* Diagonal lighter-red stripe — purely decorative */}
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
          {/* Left: headline + Argos Pay CTA — even padding via page-container */}
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

          {/* Centre: featured product image (largest) */}
          <div className="hidden lg:flex items-center justify-center h-full">
            {slide.products?.[0] && (
              <img
                src={slide.products[0].image}
                alt={slide.products[0].name}
                className="max-h-[280px] object-contain"
                loading="lazy"
              />
            )}
          </div>

          {/* Right: secondary product list with "From £X.XX pm*" */}
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
  const { data: saleProducts = [], isLoading: saleLoading } = useGetSaleProductsQuery()
  const { data: newProducts = [], isLoading: newLoading } = useGetNewProductsQuery()
  const { data: featuredProducts = [], isLoading: featuredLoading } = useGetFeaturedProductsQuery()
  const storeInputRef = useRef<HTMLInputElement>(null)
  // Hero carousel state — Argos-style bottom-center navigation
  const heroSwiperRef = useRef<any>(null)
  const [heroActiveIndex, setHeroActiveIndex] = useState(0)

  return (
    <div className="bg-white">
      {/* Category icon scroll — pinned promo tiles first, then "Just for you",
          then dynamic categories. Tiles are rounded SQUARES (matches Argos),
          horizontally spaced with a generous gap. */}
      <div className="bg-white">
        <div className="page-container py-8">
          <div className="cat-scroll items-start" style={{ gap: '20px' }}>
            {/* Pinned promo tiles (Argos Pay, Top 100 deals) */}
            {[...PINNED_TILES, JUST_FOR_YOU_TILE].map((tile) => (
              <Link
                key={tile.id}
                to={tile.href}
                className="flex flex-col items-center gap-2 flex-shrink-0 group"
                style={{ minWidth: 100 }}
              >
                <div
                  className={cn(
                    'w-[88px] h-[88px] rounded-2xl flex items-center justify-center text-center px-2 shadow-sm group-hover:shadow-md transition-shadow',
                    tile.bg === '#FFFFFF' && 'border border-argos-gray-200',
                  )}
                  style={{ backgroundColor: tile.bg, color: tile.fg }}
                >
                  <span className="text-[14px] font-bold leading-tight whitespace-pre-line">
                    {tile.badge}
                  </span>
                </div>
                <span className="text-[13px] font-medium text-argos-dark text-center leading-tight max-w-[100px]">
                  {tile.label}
                </span>
              </Link>
            ))}

            {/* Dynamic categories — rounded squares with category image or
                slug-mapped Lucide icon when no imageUrl. */}
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.slug)
              return (
                <Link
                  key={cat.id}
                  to={`/browse/${cat.slug}`}
                  className="flex flex-col items-center gap-2 flex-shrink-0 group"
                  style={{ minWidth: 100 }}
                >
                  <div className="w-[88px] h-[88px] rounded-2xl overflow-hidden bg-white border border-argos-gray-200 shadow-sm group-hover:shadow-md transition-shadow flex items-center justify-center">
                    {cat.imageUrl ? (
                      <img
                        src={resolveImageUrl(cat.imageUrl)}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <Icon size={44} strokeWidth={1.5} className="text-argos-charcoal" />
                    )}
                  </div>
                  <span className="text-[13px] font-medium text-argos-dark text-center leading-tight max-w-[100px]">
                    {cat.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Hero Carousel — constrained to page-container width (matches argos.co.uk) */}
      <div className="hero-slider-wrap px-4">
        <div className="overflow-hidden rounded-2xl">
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          loop
          onSwiper={(s) => { heroSwiperRef.current = s }}
          onSlideChange={(s) => { setHeroActiveIndex(s.realIndex) }}
          className="w-full"
        >
          {HERO_SLIDES.map((slide) => (
            <SwiperSlide key={slide.id}>
              {slide.variant === 'argos-pay' ? (
                <ArgosPayHeroSlide slide={slide} />
              ) : (
                <div className="relative h-[280px] sm:h-[360px] md:h-[420px] lg:h-[460px] overflow-hidden bg-argos-gray-bg">
                  <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
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
            </SwiperSlide>
          ))}
        </Swiper>
        </div>

        {/* Argos-style bottom controls: ← dots → (centered, below the slide) */}
        <div className="flex items-center justify-center gap-3 py-2.5 bg-white">
          <button
            onClick={() => heroSwiperRef.current?.slidePrev()}
            className="w-8 h-8 rounded-full bg-white border border-argos-gray-200 flex items-center justify-center hover:bg-argos-gray-50 transition-colors shrink-0"
            aria-label="Previous slide"
          >
            <ChevronLeft size={14} className="text-argos-charcoal" />
          </button>

          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => heroSwiperRef.current?.slideToLoop(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`transition-all duration-300 rounded-full h-3 ${
                i === heroActiveIndex
                  ? 'w-8 bg-argos-blue'
                  : 'w-3 bg-argos-gray-300 hover:bg-argos-gray-400'
              }`}
            />
          ))}

          <button
            onClick={() => heroSwiperRef.current?.slideNext()}
            className="w-8 h-8 rounded-full bg-white border border-argos-gray-200 flex items-center justify-center hover:bg-argos-gray-50 transition-colors shrink-0"
            aria-label="Next slide"
          >
            <ChevronRight size={14} className="text-argos-charcoal" />
          </button>
        </div>
      </div>

      {/* Seasonal inspiration */}
      <div className="page-container pt-8 mb-4">
        <SectionHeader title="Seasonal inspiration" seeAllLink="/search?q=seasonal" />
        <Swiper
          modules={[Navigation]}
          navigation
          slidesPerView={1.2}
          spaceBetween={12}
          breakpoints={{
            480: { slidesPerView: 2.1 },
            768: { slidesPerView: 3.1 },
            1024: { slidesPerView: 4 },
          }}
        >
          {SEASONAL_CARDS.map((c) => (
            <SwiperSlide key={c.id}>
              <EditorialCard {...c} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Promo banner */}
      <div className="page-container mb-6">
        <div className="rounded-sm overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=80"
            alt="Argos Plus — unlimited delivery for a year"
            className="w-full h-28 md:h-36 object-cover"
          />
        </div>
      </div>

      {/* Sale products */}
      <div className="page-container mb-8">
        <SectionHeader
          title="Popular products on Argos"
          seeAllLink="/search?q=deals"
          seeAllLabel="See all deals"
        />
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
          {saleLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-200 aspect-square rounded animate-pulse" />
              ))
            : saleProducts.map((product) => (
                <SwiperSlide key={product.id}>
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
        </Swiper>
      </div>

      {/* Trending now */}
      <div className="page-container mb-8">
        <SectionHeader title="Trending now" seeAllLink="/search?q=trending" />
        <Swiper
          modules={[Navigation]}
          navigation
          slidesPerView={1.2}
          spaceBetween={12}
          breakpoints={{
            480: { slidesPerView: 2.1 },
            768: { slidesPerView: 3.1 },
            1024: { slidesPerView: 4 },
          }}
        >
          {TRENDING_CARDS.map((c) => (
            <SwiperSlide key={c.id}>
              <EditorialCard {...c} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* New arrivals */}
      <div className="page-container mb-8">
        <SectionHeader title="New in" seeAllLink="/search?q=new" />
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
          {newLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-200 aspect-square rounded animate-pulse" />
              ))
            : newProducts.map((product) => (
                <SwiperSlide key={product.id}>
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
        </Swiper>
      </div>

      {/* Just for you grid */}
      <div className="page-container mb-10">
        <SectionHeader title="Just for you" seeAllLink="/search?q=featured" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {featuredLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-200 aspect-square rounded animate-pulse" />
              ))
            : featuredProducts
                .slice(0, 6)
                .map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>

      {/* Services */}
      <div className="bg-argos-gray-50 border-t border-argos-border">
        <div className="page-container py-8">
          <SectionHeader title="There's even more to Argos" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SERVICES.map(({ icon: Icon, title, subtitle }) => (
              <div
                key={title}
                className="bg-white rounded-sm border border-argos-border p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow"
              >
                <Icon size={28} className="text-argos-green" />
                <div>
                  <h4 className="text-[20px] font-bold text-argos-dark mb-1 leading-normal">
                    {title}
                  </h4>
                  <p className="text-[16px] leading-[24px] text-argos-gray-600">{subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Store finder */}
      <div className="bg-white border-t border-argos-border">
        <div className="page-container py-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
              <MapPin size={32} className="text-argos-green" />
              <div>
                <h3 className="text-[16px] font-bold text-argos-dark">Find your nearest store</h3>
                <p className="text-[12px] text-argos-gray-600">Over 800 stores across the UK</p>
              </div>
            </div>
            <div className="flex gap-2 flex-1 max-w-md">
              <input
                ref={storeInputRef}
                type="text"
                placeholder="Town or postcode"
                className="flex-1 border border-argos-border rounded-sm px-4 py-2.5 text-[14px] text-argos-dark focus:outline-none focus:ring-2 focus:ring-argos-green"
              />
              <button className="bg-argos-green text-white font-bold text-[14px] px-5 py-2.5 rounded-sm hover:bg-argos-green-dark transition-colors">
                Let&rsquo;s go!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
