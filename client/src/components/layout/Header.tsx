import { useEffect, useRef, useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Heart,
  Truck,
  RotateCcw,
  Store,
  Info,
  PoundSterling,
  Percent,
} from 'lucide-react'
import { toast } from 'sonner'
import { useGetCategoriesQuery } from '@/services/categoriesApi'
import { useGetBasketQuery } from '@/services/basketApi'
import { useAppSelector, useAppDispatch } from '@/app/store'
import { setMegaMenuOpen, setMobileNavOpen, setBasketDrawerOpen } from '@/features/ui/uiSlice'
import { useScrolled } from '@/hooks/useScrolled'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'
import { useLogoutMutation } from '@/services/authApi'
import { clearAuth } from '@/features/auth/authSlice'
import { baseApi } from '@/app/baseApi'
import { MegaMenu } from './MegaMenu'
import { MobileNavDrawer } from './MobileNavDrawer'
import argosLogo from '@/assets/argos-logo.png'

// ── Argos logo — uses brand PNG, sized to match argos.co.uk responsive scale
// Argos's ._6MRVK wrapper: order:0; flex-shrink:0; flex-grow:0; margin-right:30px @ ≥1324px
// Argos's ._35NyS link: display:flex; align-items:center; gap:14px; height:49/51/60
// Argos's ._3lCcj img:  max-width:49/60/70 height:auto
function ArgosLogo() {
  return (
    <div className="shrink-0 grow-0 order-0 xl:mr-[30px]">
      <Link
        to="/"
        aria-label="Argos — go to homepage"
        className="flex items-center gap-[14px] h-[49px] md:h-[51px] xl:h-[60px] focus-ring rounded-md"
      >
        <img
          src={argosLogo}
          alt="Argos"
          className="max-w-[49px] md:max-w-[60px] xl:max-w-[70px] h-auto select-none"
          draggable={false}
        />
      </Link>
    </div>
  )
}

// ── "Ask Trevor" green pill button — Argos's AI assistant ───────────────────
// Mirrors .gnQ4T: h-44 rounded-25 (full), gradient #045228 → #008542,
// font Barlow 16/600, gap-1, padding-left 6 on lg+
function AskTrevorButton() {
  return (
    <button
      type="button"
      aria-label="Ask Trevor — Argos AI assistant"
      className="hidden lg:inline-flex items-center justify-start gap-1 h-[44px] ml-[12px] pl-[6px] pr-1 rounded-full text-white shrink-0 transition-shadow focus-ring"
      style={{
        background: 'linear-gradient(90deg, #045228, #008542)',
        fontFamily: 'Barlow, "Helvetica Neue", Helvetica, Arial, sans-serif',
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.375,
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className="ml-1"
      >
        <path d="M12 2l1.7 4.6L18 8l-4.3 1.4L12 14l-1.7-4.6L6 8l4.3-1.4L12 2zM5 14l1 2.5L8.5 17l-2.5 1L5 20.5 4 18l-2.5-1L4 16l1-2zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" />
      </svg>
      <span className="pr-1">Ask Trevor</span>
      <span
        aria-hidden="true"
        className="flex items-center justify-center w-9 h-9 rounded-full bg-argos-green-light overflow-hidden shrink-0"
        style={{ border: '2px solid #fff' }}
      >
        {/* Stylised Trevor avatar — tiny green character with antennae */}
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="13" r="7" fill="#028940" />
          <circle cx="9.5" cy="12" r="1.4" fill="#fff" />
          <circle cx="14.5" cy="12" r="1.4" fill="#fff" />
          <path
            d="M9 16 Q12 18 15 16"
            stroke="#fff"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />
          <line
            x1="9"
            y1="6.5"
            x2="9"
            y2="4"
            stroke="#028940"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <line
            x1="15"
            y1="6.5"
            x2="15"
            y2="4"
            stroke="#028940"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <circle cx="9" cy="3.4" r="0.9" fill="#028940" />
          <circle cx="15" cy="3.4" r="0.9" fill="#028940" />
        </svg>
      </span>
    </button>
  )
}

// ── Top utility bar ───────────────────────────────────────────────────────────
function TopUtilityBar() {
  const items = [
    { label: 'Track Order', href: '/order/tracking', icon: Truck },
    { label: 'Returns', href: '/order/tracking?type=returns', icon: RotateCcw },
    { label: 'Stores', href: '/stores', icon: Store },
    { label: 'Help', href: '/help', icon: Info },
  ]
  // Mirrors argos.co.uk's `.m-jtR` utility bar + `._1JjmG` links + `._3l0Ci`
  // labels + `._1II2j` icons + `::before` separator, value-for-value.
  return (
    <div
      className="hidden md:flex justify-end items-center h-[30px] bg-[#f5f5f5]"
      style={{ padding: '0 15px 1px' }}
    >
      <nav className="flex items-center" aria-label="Utility navigation">
        {items.map((item, i) => {
          const Icon = item.icon
          const isFirst = i === 0
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-row items-center h-[29px] no-underline hover:underline focus-ring',
                !isFirst &&
                  "relative ml-[15px] pl-[15px] before:content-[''] before:absolute before:top-[7px] before:left-0 before:w-px before:h-[15px] before:bg-[#333333]",
              )}
              style={{
                color: '#333333',
                fontFamily: 'Barlow, ArgosBook, sans-serif',
                fontSize: 16,
                fontWeight: 400,
                lineHeight: 'normal',
                letterSpacing: 'normal',
              }}
            >
              {/* svg._1II2j — display:block, 20×20, fill:#333 */}
              <Icon
                size={20}
                strokeWidth={1.5}
                className="block"
                style={{ color: '#333333' }}
                aria-hidden="true"
              />
              {/* span._3l0Ci — padding-left:10px gap from icon */}
              <span
                style={{
                  paddingLeft: 10,
                  color: '#333333',
                  fontFamily: 'Barlow, ArgosBook, sans-serif',
                  fontSize: 16,
                  fontWeight: 400,
                }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

// ── Search bar — matches argos.co.uk dominant search style ──────────────────
function SearchBar() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  // Mirrors argos.co.uk search:
  //   ._7blr5 form: height 44, min-width 230, flex 1
  //   ._1Rz0y input: bg #f5f5f5, h44, border-radius 30 0 0 30, font Barlow/16,
  //                  padding 0 35px 0 14px (or 40 left on lg+)
  //   ._2mKaC button: h44 w44 (or w79 on lg+), bg #707070, hover #333,
  //                   border-radius 0 30 30 0
  //   ._1gqeQ label: font Barlow 16/600, color #fff, display flex on lg+
  return (
    <form
      onSubmit={handleSubmit}
      className="order-3 lg:order-2 flex flex-1 min-w-[230px] h-[44px] mt-[10px] md:mt-0 lg:mx-[30px] xl:mx-[30px]"
      role="search"
      aria-label="Search Argos"
    >
      <div className="relative flex-1">
        {/* lg+ search icon, absolutely positioned inside the input padding */}
        <span
          className="hidden lg:flex items-center absolute left-[15px] top-1/2 -translate-y-1/2 text-argos-gray-500 pointer-events-none"
          aria-hidden="true"
        >
          <Search size={18} strokeWidth={2} />
        </span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products or brands"
          aria-label="Search products or brands"
          className="w-full h-[44px] bg-[#f5f5f5] hover:bg-[#f5f5f5] text-[16px] text-argos-charcoal outline-none border-0 placeholder:text-argos-gray-500 pl-[14px] lg:pl-[40px] pr-[35px]"
          style={{
            fontFamily: 'Barlow, ArgosBook, sans-serif',
            borderRadius: '30px 0 0 30px',
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-1 text-argos-gray-500 hover:text-argos-charcoal"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <button
        type="submit"
        className="h-[44px] w-[44px] lg:w-[79px] bg-[#707070] hover:bg-[#333333] flex items-center justify-center shrink-0 transition-colors border-0 focus-ring"
        style={{ borderRadius: '0 30px 30px 0' }}
        aria-label="Submit search"
      >
        {/* Mobile: icon only. Desktop: label "Search" (._1gqeQ). */}
        <Search size={20} strokeWidth={2} className="lg:hidden text-white" />
        <span
          className="hidden lg:flex text-white text-[16px]"
          style={{ fontFamily: 'Barlow, ArgosBook, sans-serif', fontWeight: 600 }}
        >
          Search
        </span>
      </button>
    </form>
  )
}

// ── Account menu ──────────────────────────────────────────────────────────────
function AccountButton() {
  const { user, isAuthenticated, isStaff } = useAuth()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation()
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', escHandler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', escHandler)
    }
  }, [open])

  if (!isAuthenticated) {
    // Argos's icon button shell: ._20hv0 w-48/61/71 h-48/65 hover #d42114
    return (
      <Link
        to="/auth/login"
        className="flex flex-col items-center justify-end w-[48px] md:w-[56px] lg:w-[60px] h-[48px] xl:h-[65px] xl:justify-center text-argos-charcoal hover:text-[#d42114] focus-ring rounded-sm transition-colors"
        aria-label="Account"
      >
        <User size={25} strokeWidth={1.5} className="lg:hidden block mx-auto" />
        <User size={24} strokeWidth={1.5} className="hidden lg:block mx-auto" />
        <span className="hidden md:inline-block w-full text-center pt-[5px] lg:pt-[6px] text-[15px] leading-none">
          Account
        </span>
      </Link>
    )
  }

  const handleLogout = async () => {
    setOpen(false)
    try {
      await logout().unwrap()
    } catch {
      // Even if logout fails server-side, clear local state.
    }
    dispatch(clearAuth())
    dispatch(baseApi.util.resetApiState())
    toast.success('Signed out')
    navigate('/')
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex flex-col items-center justify-end w-[48px] md:w-[56px] lg:w-[60px] h-[48px] xl:h-[65px] xl:justify-center text-argos-charcoal hover:text-[#d42114] focus-ring rounded-sm transition-colors"
      >
        <User size={25} strokeWidth={1.5} className="lg:hidden block mx-auto" />
        <User size={24} strokeWidth={1.5} className="hidden lg:block mx-auto" />
        <span className="hidden md:inline-block w-full text-center pt-[5px] lg:pt-[6px] text-[15px] leading-none truncate">
          {user!.firstName}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 w-56 bg-white border border-argos-gray-200 rounded shadow-lg z-40 py-1 animate-fade-in"
        >
          <div className="px-3 py-2 border-b border-argos-gray-200">
            <p className="text-sm font-bold text-argos-charcoal truncate">
              {user!.firstName} {user!.lastName}
            </p>
            <p className="text-xs text-argos-gray truncate">{user!.email}</p>
          </div>
          <Link
            to="/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-argos-charcoal hover:bg-argos-gray-bg"
          >
            My account
          </Link>
          <Link
            to="/account/orders"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-argos-charcoal hover:bg-argos-gray-bg"
          >
            My orders
          </Link>
          <Link
            to="/account/wishlist"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-argos-charcoal hover:bg-argos-gray-bg"
          >
            Wishlist
          </Link>
          {isStaff && (
            <Link
              to="/admin"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-argos-blue hover:bg-argos-blue-light"
            >
              Admin panel
            </Link>
          )}
          <div className="border-t border-argos-gray-200 mt-1 pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-argos-charcoal hover:bg-argos-gray-bg disabled:opacity-60"
            >
              <LogOut size={14} />
              {isLoggingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Wishlist icon ─────────────────────────────────────────────────────────────
function WishlistButton() {
  return (
    <Link
      to="/account/wishlist"
      className="flex flex-col items-center justify-end w-[48px] md:w-[56px] lg:w-[60px] h-[48px] xl:h-[65px] xl:justify-center text-argos-charcoal hover:text-[#d42114] focus-ring rounded-sm transition-colors"
      aria-label="Wishlist"
    >
      <Heart size={25} strokeWidth={1.5} className="lg:hidden block mx-auto" />
      <Heart size={24} strokeWidth={1.5} className="hidden lg:block mx-auto" />
      <span className="hidden md:inline-block w-full text-center pt-[5px] lg:pt-[6px] text-[15px] leading-none">
        Wishlist
      </span>
    </Link>
  )
}

// ── Trolley icon ──────────────────────────────────────────────────────────────
// Argos .LQbCV badge: bg #d42114 (red), 14×15, top -3/-7/+1, right 6/10, font 11/600
function TrolleyButton() {
  const { data: basket } = useGetBasketQuery()
  const itemCount = basket?.summary.itemCount ?? 0
  const dispatch = useAppDispatch()

  return (
    <button
      type="button"
      onClick={() => dispatch(setBasketDrawerOpen(true))}
      className="relative flex flex-col items-center justify-end w-[48px] md:w-[56px] lg:w-[60px] h-[48px] xl:h-[65px] xl:justify-center text-argos-charcoal hover:text-[#d42114] focus-ring rounded-sm transition-colors"
      aria-label={`Trolley${itemCount > 0 ? `, ${itemCount} items` : ''}`}
    >
      <div className="relative mx-auto">
        <ShoppingCart size={25} strokeWidth={1.5} className="lg:hidden block" />
        <ShoppingCart size={24} strokeWidth={1.5} className="hidden lg:block" />
        {itemCount > 0 && (
          <span
            className="absolute -top-[3px] right-[-6px] lg:-top-[7px] xl:top-[1px] xl:right-[10px] bg-[#d42114] text-white border-2 border-white rounded-full flex items-center justify-center leading-none"
            style={{
              fontFamily: 'Barlow, ArgosBook, sans-serif',
              fontSize: 11,
              fontWeight: 600,
              minWidth: 18,
              height: 18,
              paddingLeft: itemCount > 9 ? 2 : 0,
              paddingRight: itemCount > 9 ? 2 : 0,
            }}
            aria-hidden="true"
          >
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </div>
      <span className="hidden md:inline-block w-full text-center pt-[5px] lg:pt-[6px] text-[15px] leading-none">
        Trolley
      </span>
    </button>
  )
}

// ── Promo strip — sits below the main header bar ────────────────────────────
type PromoItem = { icon: React.ReactNode; label: string; href: string }

function PromoStrip() {
  const items: PromoItem[] = [
    {
      icon: <PoundSterling size={16} strokeWidth={2} />,
      label: 'Argos Pay Credit Available',
      href: '/help/argos-pay',
    },
    {
      icon: <Percent size={16} strokeWidth={2} />,
      label: 'Shop our latest offers',
      href: '/browse/offers',
    },
    {
      icon: <Truck size={16} strokeWidth={2} />,
      label: 'A year of fast delivery with Argos Plus',
      href: '/help/argos-plus',
    },
  ]
  return (
    <div className="hidden md:block border-t border-argos-gray-200 bg-white">
      <ul className="flex items-stretch justify-center text-sm text-argos-charcoal w-full px-4 lg:px-6">
        {items.map((item, i) => (
          <li
            key={item.href}
            className={cn(
              'flex-1 flex items-center justify-center',
              i > 0 && 'border-l border-argos-gray-200',
            )}
          >
            <Link
              to={item.href}
              className="flex items-center gap-2.5 h-11 px-4 text-argos-charcoal hover:text-argos-blue hover:underline focus-ring rounded-sm transition-colors"
            >
              <span
                aria-hidden="true"
                className="flex items-center justify-center w-7 h-7 rounded-full border border-argos-charcoal shrink-0"
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Nav tabs (Shop / Trending / Seasonal promo) ─────────────────────────────
// Each item mirrors Argos's computed nav-link styles:
//   font-family: Barlow, Helvetica Neue, Helvetica, Arial, sans-serif
//   font-size: 16px  font-weight: 400  line-height: 19.2px
//   color: #333  background: transparent  no padding / margin / border / shadow
// Spacing between items comes from the parent flex `gap`.
// The chevron mirrors ._6AYyb: inline-block, margin-left 6px, rotates on open.
function NavTabs({ onShopClick, isMenuOpen }: { onShopClick: () => void; isMenuOpen: boolean }) {
  const item =
    'flex items-center text-[16px] font-normal leading-[19.2px] text-[#333333] m-0 p-0 border-0 bg-transparent transition-none cursor-pointer'
  return (
    <nav
      className="hidden md:flex items-center gap-[30px] shrink-0"
      aria-label="Main navigation"
      style={{ fontFamily: 'Barlow, "Helvetica Neue", Helvetica, Arial, sans-serif' }}
    >
      <button
        onClick={onShopClick}
        aria-expanded={isMenuOpen}
        aria-haspopup="true"
        className={item}
      >
        Shop
        <ChevronDown
          size={16}
          className={cn(
            'inline-block ml-[6px] transition-transform duration-150 ease-in',
            isMenuOpen && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>
      <Link to="/browse/trending" className={item}>
        Trending
        <ChevronDown size={16} className="inline-block ml-[6px]" aria-hidden="true" />
      </Link>
      {/* Seasonal promo slot (Argos changes this every few weeks) */}
      <Link to="/browse/offers" className={cn(item, 'max-w-[110px] text-left whitespace-normal')}>
        <span className="block">
          Summer of
          <br />
          football
        </span>
      </Link>
    </nav>
  )
}

// ── Main Header ───────────────────────────────────────────────────────────────
export function Header() {
  const dispatch = useAppDispatch()
  const scrolled = useScrolled()
  const isMegaMenuOpen = useAppSelector((s) => s.ui.isMegaMenuOpen)
  const isMobileNavOpen = useAppSelector((s) => s.ui.isMobileNavOpen)
  const { data: categories = [] } = useGetCategoriesQuery()
  const headerRef = useRef<HTMLElement>(null)
  const [headerHeight, setHeaderHeight] = useState(88)

  const closeMegaMenu = useCallback(() => dispatch(setMegaMenuOpen(false)), [dispatch])
  const toggleMegaMenu = useCallback(
    () => dispatch(setMegaMenuOpen(!isMegaMenuOpen)),
    [dispatch, isMegaMenuOpen],
  )

  // Track real header height for MegaMenu positioning
  useEffect(() => {
    if (!headerRef.current) return
    const obs = new ResizeObserver(() => {
      setHeaderHeight(headerRef.current?.offsetHeight ?? 88)
    })
    obs.observe(headerRef.current)
    setHeaderHeight(headerRef.current.offsetHeight)
    return () => obs.disconnect()
  }, [])

  // Close mega menu on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMegaMenu()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [closeMegaMenu])

  return (
    <>
      <header
        ref={headerRef}
        // Mirrors the computed styles of <header._1TMAp> on argos.co.uk:
        //   position: relative; z-index: 61; bg: #fff; color: #333; font: 16px/400 Barlow;
        //   border: none; box-shadow: none.
        // We also keep `sticky top-0` for the better dev experience — Argos uses position:
        // relative for the wrapper but their main content scrolls past the header anyway;
        // sticky is a visual upgrade that doesn't change the layout box.
        style={{
          fontFamily: 'Barlow, ArgosBook, "Helvetica Neue", Helvetica, Arial, sans-serif',
          color: '#333333',
        }}
        className={cn(
          'sticky top-0 z-[61] bg-white text-[16px] font-normal transition-shadow duration-150',
          scrolled ? 'shadow-header' : '',
        )}
      >
        <TopUtilityBar />

        {/* Main bar — mirrors Argos ._3-aaF wrapper + ._1ni9g inner container:
          ._3-aaF: border-bottom:1px solid #ccc; width:100%
          ._1ni9g: max-width 1920px; centered; responsive padding 10/15/16;
                   height 93px at ≥1324px. */}
        <div className="border-b border-[#cccccc] w-full">
          <div className="flex flex-row flex-wrap items-center w-full max-w-[1920px] mx-auto min-w-[320px] p-[10px] md:p-[15px] xl:p-4 xl:h-[93px]">
            {/* Hamburger — mobile only */}
            <button
              className="md:hidden p-2 -ml-2 text-argos-charcoal focus-ring rounded-sm"
              onClick={() => dispatch(setMobileNavOpen(true))}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <ArgosLogo />

            {/* Nav tabs — desktop only */}
            <NavTabs onShopClick={toggleMegaMenu} isMenuOpen={isMegaMenuOpen} />

            {/* Search bar — takes all remaining space */}
            <SearchBar />

            {/* Ask Trevor + Account + Wishlist + Trolley */}
            <div className="flex items-center order-2 lg:order-3 shrink-0">
              <AskTrevorButton />
              <AccountButton />
              <WishlistButton />
              <TrolleyButton />
            </div>
          </div>
        </div>

        {/* ── Promo strip ───────────────────────────────────────────────── */}
        <PromoStrip />
      </header>

      {/* MegaMenu — positioned dynamically below real header */}
      {isMegaMenuOpen && (
        <MegaMenu categories={categories} onClose={closeMegaMenu} topOffset={headerHeight} />
      )}

      <MobileNavDrawer
        categories={categories}
        isOpen={isMobileNavOpen}
        onClose={() => dispatch(setMobileNavOpen(false))}
      />
    </>
  )
}
