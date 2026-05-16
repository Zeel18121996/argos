import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import {
  ChevronRight,
  Truck,
  RotateCcw,
  ShieldCheck,
  Store,
  MapPin,
  Heart,
  ShoppingCart,
  Star,
} from 'lucide-react'
import { useGetCategoriesQuery } from '@/services/categoriesApi'
import { cn } from '@/utils/cn'
import { formatPrice } from '@/utils/formatPrice'

// ── Mock data (replace with real API calls in Phase 3) ────────────────────────

const HERO_SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1400&q=80',
    title: 'Up to 50% off Technology',
    subtitle: 'Laptops, TVs, gaming and more',
    cta: 'Shop now',
    ctaLink: '/browse/technology',
    accent: '#028940',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1400&q=80',
    title: 'Summer Garden Sale',
    subtitle: 'Save 20% on selected garden & outdoor',
    cta: 'Shop garden',
    ctaLink: '/browse/home-and-garden',
    accent: '#044C99',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=1400&q=80',
    title: 'Save ½ on selected toys',
    subtitle: 'Arts & crafts, scooters and more!',
    cta: 'Shop toys',
    ctaLink: '/browse/toys-and-games',
    accent: '#CC0000',
  },
]

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
    link: '/search/deals',
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

interface MockProduct {
  id: string
  name: string
  images: string[]
  price: number // in pence
  wasPrice?: number // in pence
  rating: number
  reviewCount: number
  inStock: boolean
  isNew?: boolean
  isSale?: boolean
  slug: string
}

const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 'p1',
    name: 'Samsung 55" QLED 4K Smart TV',
    slug: 'samsung-55-qled',
    images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80'],
    price: 59999,
    wasPrice: 79999,
    rating: 4.5,
    reviewCount: 1243,
    inStock: true,
    isSale: true,
  },
  {
    id: 'p2',
    name: 'Apple AirPods Pro (2nd Gen)',
    slug: 'airpods-pro-2',
    images: ['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80'],
    price: 22900,
    rating: 4.8,
    reviewCount: 5621,
    inStock: true,
    isNew: true,
  },
  {
    id: 'p3',
    name: 'LEGO Technic Ferrari Daytona SP3',
    slug: 'lego-ferrari',
    images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80'],
    price: 34999,
    wasPrice: 39999,
    rating: 4.9,
    reviewCount: 892,
    inStock: true,
    isSale: true,
  },
  {
    id: 'p4',
    name: 'Dyson V15 Detect Absolute Cordless Vacuum',
    slug: 'dyson-v15',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'],
    price: 54999,
    wasPrice: 64999,
    rating: 4.7,
    reviewCount: 3210,
    inStock: true,
    isSale: true,
  },
  {
    id: 'p5',
    name: 'PlayStation 5 Console (Disc Edition)',
    slug: 'ps5',
    images: ['https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600&q=80'],
    price: 44999,
    rating: 4.8,
    reviewCount: 12450,
    inStock: false,
  },
  {
    id: 'p6',
    name: 'Ninja Foodi MAX 9-in-1 Multi-Cooker',
    slug: 'ninja-foodi',
    images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80'],
    price: 17999,
    wasPrice: 24999,
    rating: 4.6,
    reviewCount: 4560,
    inStock: true,
    isSale: true,
  },
  {
    id: 'p7',
    name: 'Apple iPhone 15 Pro 256GB',
    slug: 'iphone-15-pro',
    images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80'],
    price: 99900,
    rating: 4.7,
    reviewCount: 8930,
    inStock: true,
  },
  {
    id: 'p8',
    name: 'Fitbit Charge 6 Fitness Tracker',
    slug: 'fitbit-charge-6',
    images: ['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&q=80'],
    price: 12999,
    wasPrice: 15999,
    rating: 4.4,
    reviewCount: 2340,
    inStock: true,
    isSale: true,
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

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function ProductCard({ product }: { product: MockProduct }) {
  const discount = product.wasPrice
    ? Math.round(((product.wasPrice - product.price) / product.wasPrice) * 100)
    : null

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group bg-white border border-argos-border hover:shadow-md transition-shadow duration-200 flex flex-col relative"
    >
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {product.isSale && discount && (
          <span className="inline-block text-[14px] leading-[20px] font-medium px-2 py-0.5 rounded-sm bg-argos-green text-white">
            Save {discount}%
          </span>
        )}
        {product.isNew && (
          <span className="inline-block text-[14px] leading-[20px] font-medium px-2 py-0.5 rounded-sm bg-argos-blue text-white">
            New
          </span>
        )}
        {!product.inStock && (
          <span className="inline-block text-[14px] leading-[20px] font-medium px-2 py-0.5 rounded-sm bg-argos-gray-500 text-white">
            Out of stock
          </span>
        )}
      </div>

      {/* Wishlist */}
      <button
        onClick={(e) => e.preventDefault()}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white shadow-sm text-argos-gray-500 hover:text-argos-green transition-colors"
        aria-label="Add to wishlist"
      >
        <Heart size={15} />
      </button>

      {/* Image */}
      <div className="relative overflow-hidden bg-argos-gray-50 aspect-square">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3">
        <h3 className="text-[16px] leading-[24px] text-argos-dark font-bold line-clamp-2 mb-1.5 flex-1">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                className={cn(
                  i < Math.floor(product.rating)
                    ? 'text-argos-amber fill-argos-amber'
                    : 'text-argos-gray-300 fill-argos-gray-300',
                )}
              />
            ))}
          </div>
          <span className="text-xs text-argos-blue hover:underline cursor-pointer">
            (
            {product.reviewCount > 1000
              ? `${(product.reviewCount / 1000).toFixed(1)}k`
              : product.reviewCount}
            )
          </span>
        </div>

        {/* Price */}
        <div className="mb-1.5">
          {product.isSale && product.wasPrice && (
            <div className="text-[14px] font-medium text-argos-gray-500 capitalize mb-0.5">
              Less than half price
            </div>
          )}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[16px] leading-[24px] font-bold text-argos-dark">
              {formatPrice(product.price)}
            </span>
            {product.wasPrice && (
              <span className="text-[14px] text-argos-gray-500">
                Was <span className="line-through">{formatPrice(product.wasPrice)}</span>
              </span>
            )}
          </div>
        </div>

        {product.inStock && (
          <p className="text-[14px] text-argos-green mb-2 font-normal">Free delivery available</p>
        )}

        {/* CTA */}
        <button
          onClick={(e) => e.preventDefault()}
          disabled={!product.inStock}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-2.5 text-[18px] leading-[27px] font-semibold rounded-sm transition-colors mt-auto',
            product.inStock
              ? 'bg-argos-green text-white hover:bg-argos-green-dark'
              : 'bg-argos-gray-300 text-argos-gray-500 cursor-not-allowed',
          )}
        >
          <ShoppingCart size={16} />
          {!product.inStock ? 'Out of stock' : 'Add to trolley'}
        </button>
      </div>
    </Link>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { data: categories = [] } = useGetCategoriesQuery()
  const storeInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="bg-white">
      {/* 1. Hero Carousel */}
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop
        className="w-full"
      >
        {HERO_SLIDES.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-52 sm:h-72 md:h-[340px] lg:h-[400px] overflow-hidden">
              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex items-center">
                <div className="page-container">
                  <div className="max-w-md">
                    <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 leading-tight">
                      {slide.title}
                    </h2>
                    <p className="text-white/90 text-sm md:text-base mb-5">{slide.subtitle}</p>
                    <Link
                      to={slide.ctaLink}
                      className="inline-block text-white font-bold text-sm px-6 py-2.5 rounded-sm hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: slide.accent }}
                    >
                      {slide.cta}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 2. Category icon scroll */}
      <div className="border-b border-argos-border bg-white">
        <div className="page-container py-4">
          <div className="cat-scroll">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/browse/${cat.slug}`}
                className="flex flex-col items-center gap-2 flex-shrink-0 group"
                style={{ minWidth: 76 }}
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-argos-border group-hover:border-argos-green transition-colors bg-argos-gray-50">
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl bg-argos-gray-50">
                      🛒
                    </div>
                  )}
                </div>
                <span
                  className="text-[14px] font-normal text-argos-dark text-center leading-tight group-hover:text-argos-green transition-colors"
                  style={{ maxWidth: 72 }}
                >
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Seasonal inspiration */}
      <div className="page-container pt-8 mb-4">
        <SectionHeader title="Seasonal inspiration" seeAllLink="/search/seasonal" />
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

      {/* 4. Slim promo banner */}
      <div className="page-container mb-6">
        <div className="rounded-sm overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=80"
            alt="Argos Plus — unlimited delivery for a year"
            className="w-full h-28 md:h-36 object-cover"
          />
        </div>
      </div>

      {/* 5. Popular products */}
      <div className="page-container mb-8">
        <SectionHeader
          title="Popular products on Argos"
          seeAllLink="/search/sale"
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
          {MOCK_PRODUCTS.filter((p) => p.isSale).map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* 6. Trending now */}
      <div className="page-container mb-8">
        <SectionHeader title="Trending now" seeAllLink="/search/trending" />
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

      {/* 7. New arrivals */}
      <div className="page-container mb-8">
        <SectionHeader title="New in" seeAllLink="/search/new" />
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
          {MOCK_PRODUCTS.filter((p) => p.isNew).map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* 8. Just for you grid */}
      <div className="page-container mb-10">
        <SectionHeader title="Just for you" seeAllLink="/search/featured" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {MOCK_PRODUCTS.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* 9. Services 4-tile row */}
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

      {/* 10. Store finder widget */}
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
