import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

import { ChevronRight, Truck, RotateCcw, ShieldCheck, Store, MapPin } from 'lucide-react'
import { buildPath } from '@/constants/path'
import { MOCK_CATEGORIES } from '@/data/mock-categories'
import { getFeaturedProducts, getSaleProducts, getNewProducts } from '@/data/mock-products'
import ProductCard from '@/components/Common/ProductCard/ProductCard'

/* ─── Data ─── */
const HERO_SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1400&q=80',
    title: 'Up to 50% off Technology',
    subtitle: 'Laptops, TVs, gaming and more',
    cta: 'Shop now',
    ctaLink: buildPath.category('technology'),
    accent: '#028940',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1400&q=80',
    title: 'Summer Garden Sale',
    subtitle: 'Save 20% on selected garden & outdoor',
    cta: 'Shop garden',
    ctaLink: buildPath.category('home-garden'),
    accent: '#044C99',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=1400&q=80',
    title: 'Save ½ on selected toys',
    subtitle: 'Arts & crafts, scooters and more!',
    cta: 'Shop toys',
    ctaLink: buildPath.category('toys'),
    accent: '#CC0000',
  },
]

const SEASONAL_CARDS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
    title: 'Bring the Café home',
    subtitle: 'Barista-style at home, with up to 30% off selected machines.',
    link: buildPath.category('home-garden'),
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80',
    title: 'Save 20% on selected garden & outdoor',
    subtitle: 'Using code GREEN20 at checkout.',
    link: buildPath.category('home-garden'),
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    title: 'Save ½ on selected toys',
    subtitle: 'Includes arts & crafts, scooters & more!',
    link: buildPath.category('toys'),
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80',
    title: 'New LEGO sets just arrived',
    subtitle: 'Shop Technic, Icons and more.',
    link: buildPath.category('toys'),
  },
]

const TRENDING_CARDS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
    title: 'A-mazing deals',
    subtitle: 'All the best deals in one place. See it. Love it. Get it.',
    link: buildPath.search('deals'),
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
    title: 'Everyday value',
    subtitle: 'Quality you trust at prices you love. Includes home and furniture.',
    link: buildPath.category('home-garden'),
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600&q=80',
    title: 'New in Gaming',
    subtitle: 'The hottest consoles, accessories and games.',
    link: buildPath.category('technology'),
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=600&q=80',
    title: 'Health & Beauty',
    subtitle: 'Discover top brands and must-have products.',
    link: buildPath.category('health-beauty'),
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
  {
    icon: RotateCcw,
    title: 'Free returns',
    subtitle: 'Easy returns within 30 days of purchase.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure payments',
    subtitle: 'Shop with confidence with safe checkout.',
  },
]

/* ─── Small helpers ─── */
const SectionHeader: React.FC<{ title: string; seeAllLink?: string; seeAllLabel?: string }> = ({
  title,
  seeAllLink,
  seeAllLabel = 'See all',
}) => (
  // Section H2: 30px / 700 / normal — matches live Argos section heading
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

const EditorialCard: React.FC<{ image: string; title: string; subtitle: string; link: string }> = ({
  image,
  title,
  subtitle,
  link,
}) => (
  <Link
    to={link}
    className="group block overflow-hidden rounded-sm border border-argos-border bg-white hover:shadow-md transition-shadow"
  >
    <div className="aspect-[4/3] overflow-hidden bg-argos-gray-bg">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
    </div>
    {/* Editorial card h4: 20px / 700 / normal — matches live Argos */}
    <div className="p-3">
      <h4 className="text-[20px] font-bold text-argos-dark mb-1 line-clamp-2 leading-normal">
        {title}
      </h4>
      <p className="text-[16px] leading-[24px] text-argos-gray mb-2 line-clamp-2">{subtitle}</p>
      <span className="text-[16px] font-normal text-argos-green">Shop now</span>
    </div>
  </Link>
)

/* ─── Page ─── */
const Home: React.FC = () => {
  const featuredProducts = getFeaturedProducts()
  const saleProducts = getSaleProducts()
  const newProducts = getNewProducts()
  const storeInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="bg-white">
      {/* ── 1. Hero Carousel (full-width) ── */}
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
                <div className="argos-container">
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

      {/* ── 2. Category icon scroll ── */}
      <div className="border-b border-argos-border bg-white">
        <div className="argos-container py-4">
          <div className="cat-scroll">
            {MOCK_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={buildPath.category(cat.slug)}
                className="flex flex-col items-center gap-2 flex-shrink-0 group"
                style={{ minWidth: 76 }}
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-argos-border group-hover:border-argos-green transition-colors bg-argos-gray-bg">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
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

      {/* ── 3. Seasonal inspiration ── */}
      <div className="argos-container pt-8 mb-4">
        <SectionHeader title="Seasonal inspiration" seeAllLink={buildPath.search('seasonal')} />
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

      {/* ── 4. Slim promo banner ── */}
      <div className="argos-container mb-6">
        <div className="rounded-sm overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=80"
            alt="Argos Plus — unlimited delivery for a year"
            className="w-full h-28 md:h-36 object-cover"
          />
        </div>
      </div>

      {/* ── 5. Popular products ── */}
      <div className="argos-container mb-8">
        <SectionHeader
          title="Popular products on Argos"
          seeAllLink={buildPath.search('sale')}
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
          {saleProducts.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ── 6. Trending now ── */}
      <div className="argos-container mb-8">
        <SectionHeader title="Trending now" seeAllLink={buildPath.search('trending')} />
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

      {/* ── 7. New arrivals carousel ── */}
      {newProducts.length > 0 && (
        <div className="argos-container mb-8">
          <SectionHeader title="New in" seeAllLink={buildPath.search('new')} />
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
            {newProducts.map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* ── 8. Featured products grid fallback ── */}
      <div className="argos-container mb-10">
        <SectionHeader title="Just for you" seeAllLink={buildPath.search('featured')} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* ── 9. Services 4-tile row ── */}
      <div className="bg-argos-gray-bg border-t border-argos-border">
        <div className="argos-container py-8">
          <SectionHeader title="There’s even more to Argos" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SERVICES.map(({ icon: Icon, title, subtitle }) => (
              <div
                key={title}
                className="bg-white rounded-sm border border-argos-border p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow"
              >
                <Icon size={28} className="text-argos-green" />
                {/* Service tile h4: 20px / 700 — matches live Argos */}
                <div>
                  <h4 className="text-[20px] font-bold text-argos-dark mb-1 leading-normal">
                    {title}
                  </h4>
                  <p className="text-[16px] leading-[24px] text-argos-gray">{subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 10. Store finder widget ── */}
      <div className="bg-white border-t border-argos-border">
        <div className="argos-container py-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
              <MapPin size={32} className="text-argos-green" />
              <div>
                <h3 className="text-[16px] font-bold text-argos-dark">Find your nearest store</h3>
                <p className="text-[12px] text-argos-gray">Over 800 stores across the UK</p>
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

export default Home
