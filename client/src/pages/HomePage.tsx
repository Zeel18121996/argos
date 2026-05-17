import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation } from 'swiper/modules'
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

const JUST_FOR_YOU_TILE: PinnedTile = {
  id: 'just-for-you',
  label: 'Just for you',
  bg: '#FFFFFF',
  fg: '#044C99',
  href: '/search?q=just-for-you',
  badge: 'Just for\nyou',
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

function ArgosPayHeroSlide({ slide }: { slide: HeroSlide }) {
  return (
    <div
      className="relative h-[280px] sm:h-[360px] md:h-[420px] lg:h-[460px] overflow-hidden"
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
                alt={slide.products[0].name}
                className="max-h-[280px] object-contain"
                loading="lazy"
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
  const heroSwiperRef = useRef<any>(null)
  const [heroActiveIndex, setHeroActiveIndex] = useState(0)

  return (
    <div className="bg-white">
      {/* Category icon scroll */}
      <div className="bg-white">
        <div className="page-container py-8">
          <div className="cat-scroll items-start" style={{ gap: '20px' }}>
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

      {/* Hero Carousel */}
      <div className="hero-slider-wrap px-4">
        <div className="overflow-hidden rounded-2xl">
          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            loop
            onSwiper={(s) => {
              heroSwiperRef.current = s
            }}
            onSlideChange={(s) => {
              setHeroActiveIndex(s.realIndex)
            }}
            className="w-full"
          >
            {HERO_SLIDES.map((slide) => (
              <SwiperSlide key={slide.id}>
                {slide.variant === 'argos-pay' ? (
                  <ArgosPayHeroSlide slide={slide} />
                ) : (
                  <div className="relative h-[280px] sm:h-[360px] md:h-[420px] lg:h-[460px] overflow-hidden bg-argos-gray-bg">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover"
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
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

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

      {/* Products */}
      <div className="page-container py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[30px] font-bold text-argos-dark leading-normal">Products</h2>
          <Link
            to="/browse"
            className="flex items-center gap-1 text-[16px] font-normal text-argos-blue hover:underline"
          >
            See all <ChevronRight size={14} />
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
                <div key={i} className="bg-gray-200 aspect-square rounded animate-pulse" />
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
