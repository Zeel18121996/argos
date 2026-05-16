import { useEffect, useRef, useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, User, Menu, X, ChevronDown } from 'lucide-react'
import { useGetCategoriesQuery } from '@/services/categoriesApi'
import { useAppSelector, useAppDispatch } from '@/app/store'
import { setMegaMenuOpen, setMobileNavOpen } from '@/features/ui/uiSlice'
import { useScrolled } from '@/hooks/useScrolled'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'
import { MegaMenu } from './MegaMenu'
import { MobileNavDrawer } from './MobileNavDrawer'

// ── Argos SVG logo ────────────────────────────────────────────────────────────
function ArgosLogo() {
  return (
    <Link to="/" aria-label="Argos — go to homepage" className="shrink-0 focus-ring rounded">
      <svg
        width="80"
        height="28"
        viewBox="0 0 80 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <text
          x="0"
          y="22"
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
          fontSize="26"
          fill="#e41b23"
          letterSpacing="-0.5"
        >
          argos
        </text>
      </svg>
    </Link>
  )
}

// ── Top utility bar ───────────────────────────────────────────────────────────
function TopUtilityBar() {
  return (
    <div className="hidden md:flex bg-argos-gray-700 h-8 items-center justify-end px-4 lg:px-6">
      <nav className="flex items-center gap-1 text-xs text-white" aria-label="Utility navigation">
        {[
          { label: 'Track Order', href: '/order/tracking' },
          { label: 'Returns', href: '/order/tracking?type=returns' },
          { label: 'Stores', href: '/stores' },
          { label: 'Help', href: '/help' },
        ].map((item, i, arr) => (
          <span key={item.href} className="flex items-center">
            <Link to={item.href} className="hover:underline px-2 py-1 focus-ring rounded">
              {item.label}
            </Link>
            {i < arr.length - 1 && <span className="text-argos-gray-500 select-none">|</span>}
          </span>
        ))}
      </nav>
    </div>
  )
}

// ── Search bar ────────────────────────────────────────────────────────────────
function SearchBar() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (q) navigate(`/search/${encodeURIComponent(q)}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      // flex-1 min-w-0: takes all available space, can shrink below content width
      className="flex-1 min-w-0 mx-2 lg:mx-4"
      role="search"
      aria-label="Search Argos"
    >
      <div className="flex items-center h-10 border border-argos-gray-300 rounded-full overflow-hidden bg-white focus-within:border-argos-blue focus-within:ring-1 focus-within:ring-argos-blue transition-colors">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Argos"
          aria-label="Search Argos"
          className="flex-1 h-full px-4 text-sm text-argos-gray-700 outline-none bg-transparent placeholder:text-argos-gray-400"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
            className="p-1 text-argos-gray-400 hover:text-argos-gray-700"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
        <button
          type="submit"
          className="w-10 h-10 bg-argos-red hover:bg-argos-red-dark text-white flex items-center justify-center shrink-0 transition-colors focus-ring"
          aria-label="Submit search"
        >
          <Search size={18} />
        </button>
      </div>
    </form>
  )
}

// ── Account menu ──────────────────────────────────────────────────────────────
function AccountButton() {
  const { user, isAuthenticated } = useAuth()

  return (
    <Link
      to={isAuthenticated ? '/account' : '/auth/login'}
      className="flex flex-col items-center gap-0.5 text-argos-gray-700 hover:text-argos-blue focus-ring rounded px-1 transition-colors"
      aria-label={isAuthenticated ? 'My Account' : 'Sign in'}
    >
      <User size={20} strokeWidth={1.5} />
      <span className="text-2xs leading-none hidden lg:block">
        {isAuthenticated ? user!.firstName : 'Sign in'}
      </span>
    </Link>
  )
}

// ── Basket icon ───────────────────────────────────────────────────────────────
function BasketButton() {
  const itemCount = useAppSelector((s) => s.basket.itemCount)

  return (
    <Link
      to="/basket"
      className="relative flex flex-col items-center gap-0.5 text-argos-gray-700 hover:text-argos-blue focus-ring rounded px-1 transition-colors"
      aria-label={`Shopping basket${itemCount > 0 ? `, ${itemCount} items` : ''}`}
    >
      <div className="relative">
        <ShoppingCart size={20} strokeWidth={1.5} />
        {itemCount > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 bg-argos-red text-white text-2xs font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none"
            aria-hidden="true"
          >
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </div>
      <span className="text-2xs leading-none hidden lg:block">Basket</span>
    </Link>
  )
}

// ── Nav tabs (Shop / Trending / Promo) ────────────────────────────────────────
function NavTabs({ onShopClick, isMenuOpen }: { onShopClick: () => void; isMenuOpen: boolean }) {
  return (
    // shrink-0: never compress nav tabs — search bar absorbs slack
    <nav className="hidden md:flex items-center gap-0 shrink-0" aria-label="Main navigation">
      <button
        onClick={onShopClick}
        aria-expanded={isMenuOpen}
        aria-haspopup="true"
        className={cn(
          'flex items-center gap-1 px-3 h-[56px] text-sm font-semibold border-b-2 transition-colors focus-ring',
          isMenuOpen
            ? 'border-argos-red text-argos-gray-800'
            : 'border-transparent text-argos-gray-700 hover:border-argos-gray-300',
        )}
      >
        Shop
        <ChevronDown
          size={14}
          className={cn('transition-transform duration-200', isMenuOpen && 'rotate-180')}
        />
      </button>
      <Link
        to="/browse/trending"
        className="flex items-center px-3 h-[56px] text-sm font-semibold text-argos-gray-700 border-b-2 border-transparent hover:border-argos-gray-300 transition-colors focus-ring"
      >
        Trending
      </Link>
      <Link
        to="/browse/offers"
        className="flex items-center px-3 h-[56px] text-sm font-semibold text-argos-gray-700 border-b-2 border-transparent hover:border-argos-gray-300 transition-colors focus-ring"
      >
        Offers
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
        className={cn(
          'sticky top-0 z-30 bg-white transition-shadow duration-150',
          scrolled ? 'shadow-header' : 'border-b border-argos-gray-200',
        )}
      >
        <TopUtilityBar />

        {/* Main bar */}
        <div className="flex items-center h-14 page-container gap-2">
          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-2 -ml-2 text-argos-gray-700 focus-ring rounded"
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

          {/* Account + Basket */}
          <div className="flex items-center gap-2 shrink-0">
            <AccountButton />
            <BasketButton />
          </div>
        </div>
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
