import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import argosLogo from '@/assets/argos-logo.png'
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux'
import {
  toggleMobileMenu,
  closeMobileMenu,
  openShopMenu,
  closeShopMenu,
} from '@/store/slices/uiSlice'
import { PATHS, buildPath } from '@/constants/path'
import { useCart } from '@/hooks/useCart'
import MegaMenu from './MegaMenu'
import PromoStrip from './PromoStrip'
import ShopMegaMenu from './ShopMegaMenu'

/* ─── Exact SVG paths extracted from live argos.co.uk ─── */

// Utility bar icons — 20×20, fill=currentColor
const IconTrackOrder = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="20"
    height="20"
  >
    <path d="M18.813 17.25H21v-4.5h-3a.75.75 0 0 1-.712-.513L15.21 6H2.998l-.031 11.25h.97a2.751 2.751 0 0 1 5.126 0h4.624a2.751 2.751 0 0 1 5.126 0zm.142 1.5a2.75 2.75 0 0 1-5.41 0h-4.34a2.75 2.75 0 0 1-5.41 0h-1.58a.75.75 0 0 1-.75-.752L1.5 5.248a.75.75 0 0 1 .75-.748h13.5a.75.75 0 0 1 .712.513l2.079 6.237h3.209a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-.75.75h-2.795zM6.5 19.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5zm9.75 0a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5z" />
  </svg>
)
const IconReturns = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="20"
    height="20"
  >
    <path d="M12 1.5c5.799 0 10.5 4.701 10.5 10.5a10.47 10.47 0 0 1-1.569 5.525l1.366 1.463a.75.75 0 0 1-.442 1.255l-.106.007h-3.5a.75.75 0 0 1-.744-.648L17.5 19.5v-3.75c0-.645.748-.974 1.222-.584l.076.072 1.067 1.143A9 9 0 1 0 12 21a.75.75 0 1 1 0 1.5C6.201 22.5 1.5 17.799 1.5 12S6.201 1.5 12 1.5z" />
  </svg>
)
const IconStores = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="20"
    height="20"
  >
    <path d="M15 18v-5.25h-2.25V18H15zm1.5 0H21V6H3v12h4.5v-6a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 .75.75v6zM9 18h2.25v-5.25H9V18zm.75-10.5h4.5a.75.75 0 1 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5zM3 4.5h18A1.5 1.5 0 0 1 22.5 6v12a1.5 1.5 0 0 1-1.5 1.5H3A1.5 1.5 0 0 1 1.5 18V6A1.5 1.5 0 0 1 3 4.5z" />
  </svg>
)
const IconHelp = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="20"
    height="20"
  >
    <path d="M11.25 15v-3h-.75a.75.75 0 1 1 0-1.5H12a.75.75 0 0 1 .75.75V15h.75a.75.75 0 1 1 0 1.5h-3a.75.75 0 1 1 0-1.5h.75zm.75 7.5C6.201 22.5 1.5 17.799 1.5 12S6.201 1.5 12 1.5 22.5 6.201 22.5 12 17.799 22.5 12 22.5zm0-1.5a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-12a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z" />
  </svg>
)

// Main-header icons — 1em (renders at 24px), fill=currentColor, viewBox 0 0 24 24
const IconAccount = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="1em"
    height="1em"
  >
    <path d="M12 12a5.25 5.25 0 1 1 0-10.5A5.25 5.25 0 0 1 12 12zm0-1.5A3.75 3.75 0 1 0 12 3a3.75 3.75 0 0 0 0 7.5zm-8.047 4.482C6.63 13.995 9.314 13.5 12 13.5c2.686 0 5.37.495 8.047 1.482A3.75 3.75 0 0 1 22.5 18.5v3.25a.75.75 0 0 1-.75.75H2.25a.75.75 0 0 1-.75-.75V18.5c0-1.57.98-2.975 2.453-3.518zM21 18.5a2.25 2.25 0 0 0-1.472-2.11C17.014 15.461 14.506 15 12 15c-2.506 0-5.014.462-7.528 1.39A2.25 2.25 0 0 0 3 18.5V21h18v-2.5z" />
  </svg>
)
const IconWishlist = ({ filled = false }: { filled?: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke={filled ? 'none' : 'currentColor'}
    strokeWidth={filled ? '0' : '1.5'}
    width="1em"
    height="1em"
  >
    {filled ? (
      <path d="M21.6 5.55l.07.115c2.73 5.458-.506 10.582-9.32 15.248a.75.75 0 0 1-.7 0C2.835 16.247-.4 11.123 2.33 5.665l.073-.119C4.83 2.351 8.86 2.182 12.006 4.97c3.221-2.796 7.185-2.625 9.594.58zm-1.24.847c-1.968-2.56-5.154-2.542-7.83.133a.75.75 0 0 1-1.068-.007C8.88 3.866 5.628 3.843 3.64 6.399c-2.182 4.453.483 8.748 8.36 13 7.878-4.253 10.543-8.548 8.36-13.002z" />
    ) : (
      <path d="M21.6 5.55l.07.115c2.73 5.458-.506 10.582-9.32 15.248a.75.75 0 0 1-.7 0C2.835 16.247-.4 11.123 2.33 5.665l.073-.119C4.83 2.351 8.86 2.182 12.006 4.97c3.221-2.796 7.185-2.625 9.594.58zm-1.24.847c-1.968-2.56-5.154-2.542-7.83.133a.75.75 0 0 1-1.068-.007C8.88 3.866 5.628 3.843 3.64 6.399c-2.182 4.453.483 8.748 8.36 13 7.878-4.253 10.543-8.548 8.36-13.002z" />
    )}
  </svg>
)
const IconTrolley = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="1em"
    height="1em"
  >
    <path d="M6.229 4.5H21.75a.75.75 0 0 1 .735.897l-1.5 7.5a.75.75 0 0 1-.735.603H7.129l.3 3H18.75a.75.75 0 1 1 0 1.5h-12a.75.75 0 0 1-.746-.675L4.57 3H2.25a.75.75 0 0 1 0-1.5h3a.75.75 0 0 1 .746.675L6.23 4.5zm.15 1.5l.6 6h12.656l1.2-6H6.38zM7.5 22.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm10.5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
  </svg>
)
/* ─── Reusable right icon link ─── */
const HeaderIconLink: React.FC<{
  to: string
  label: string
  badge?: number
  children: React.ReactNode
  className?: string
}> = ({ to, label, badge, children, className = '' }) => (
  // Each icon: w=71px, h=65px, flex-col, no padding — matches live Argos
  <Link
    to={to}
    className={`flex flex-col items-center w-[71px] h-[65px] justify-center text-[#333] hover:text-argos-green transition-colors relative ${className}`}
  >
    <div className="relative flex items-center justify-center" style={{ fontSize: 24 }}>
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-2 -right-2 bg-argos-green text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-0.5 leading-none">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </div>
    {/* Label: 15px / 400 / padding-top: 6px — exact Argos measurement */}
    <span
      style={{ fontSize: 15, fontWeight: 400, paddingTop: 6, color: 'inherit', display: 'block' }}
    >
      {label}
    </span>
  </Link>
)

const Header: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { summary } = useCart()
  const { isAuthenticated, user } = useAppSelector((s) => s.auth)
  const { isMobileMenuOpen, isShopMenuOpen } = useAppSelector((s) => s.ui)
  const wishlistCount = useAppSelector((s) => s.wishlist.items.length)

  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(buildPath.search(searchQuery.trim()))
      setSearchQuery('')
    }
  }

  return (
    <header className="bg-white sticky top-0 z-40 shadow-sm">
      {/* ═══════════════════════════════════════════════════════
          TIER 1 — Utility bar
          h=30px, bg=#F5F5F5
          Links: Track Order (no left pad), Returns/Stores/Help (pl=15px)
          Icons: 20×20 SVG, fill=#333
      ═══════════════════════════════════════════════════════ */}
      <div
        className="hidden md:block border-b border-argos-border"
        style={{ backgroundColor: '#F5F5F5', height: 30 }}
      >
        {/* Full-width: pl=15px pr=15px — matches live Argos (maxWidth 1920px, left=0) */}
        <div className="w-full h-full" style={{ paddingLeft: 15, paddingRight: 15 }}>
          <div className="flex items-center justify-end h-full">
            {/* Track Order — no left padding (first item) */}
            <Link
              to={PATHS.TRACK_ORDER}
              className="flex items-center text-[16px] font-normal text-[#333] hover:text-argos-green transition-colors"
              style={{ gap: 6 }}
            >
              <IconTrackOrder />
              Track Order
            </Link>
            {/* Returns, Stores, Help — pl=15px each */}
            {(
              [
                { label: 'Returns', icon: <IconReturns />, to: PATHS.HELP },
                { label: 'Stores', icon: <IconStores />, to: PATHS.STORE_FINDER },
                { label: 'Help', icon: <IconHelp />, to: PATHS.HELP },
              ] as const
            ).map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="flex items-center text-[16px] font-normal text-[#333] hover:text-argos-green transition-colors"
                style={{ gap: 6, paddingLeft: 15 }}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          TIER 2 — Main header row
          h=94px, bg=white, border-bottom
          Inner container: padding=16px, display=flex, align-items=center
          Structure: [Logo 70×60] [Nav 16px/400] [Search flex-1] [Icons 3×71px]
      ═══════════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-argos-border">
        {/* Full-width: padding=16px, height=93px (border-box) — outer row = 93+1px border = 94px, matches live Argos */}
        <div className="flex items-center w-full" style={{ padding: 16, gap: 0, height: 93 }}>
          {/* Mobile hamburger */}
          <button
            onClick={() => dispatch(toggleMobileMenu())}
            className="md:hidden p-2 text-[#333] mr-2"
            aria-label="Open menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* ── Logo: real Argos logo PNG, 70×60px — matches live argos.co.uk ── */}
          <Link
            to={PATHS.HOME}
            aria-label="Logo - go to homepage"
            className="flex-shrink-0 flex items-center"
            style={{ width: 70, height: 60 }}
          >
            <img
              src={argosLogo}
              alt="Argos logo"
              width={70}
              height={60}
              style={{ width: 70, height: 60, objectFit: 'contain', display: 'block' }}
            />
            <span className="sr-only">Logo - go to homepage</span>
          </Link>

          {/* ── Nav: 3 links, 16px/400, h=61 ── */}
          {/* Logo margin-right=30px on live Argos → use marginLeft:30 here */}
          <nav
            aria-label="Categories"
            className="hidden md:flex items-stretch flex-shrink-0"
            style={{ height: 61, marginLeft: 30 }}
          >
            {/* Shop — chevron-down SVG (exact Argos path), opens mega menu */}
            <button
              id="ShopLink"
              aria-haspopup="true"
              aria-expanded={isShopMenuOpen}
              aria-controls="shopMegaMenu"
              onClick={() =>
                isShopMenuOpen ? dispatch(closeShopMenu()) : dispatch(openShopMenu())
              }
              className="flex items-center text-[16px] font-normal text-[#333] hover:text-argos-green transition-colors whitespace-nowrap h-full"
              style={{
                paddingLeft: 12,
                paddingRight: 12,
                gap: 4,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Shop
              {/* Chevron-down — exact SVG path from live Argos */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="1em"
                height="1em"
                style={{
                  transition: 'transform 0.2s',
                  transform: isShopMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                <path d="M12 14.69L5.03 7.72a.75.75 0 0 0-1.06 1.06l7.5 7.5a.75.75 0 0 0 1.06 0l7.5-7.5a.75.75 0 0 0-1.06-1.06L12 14.69z" />
              </svg>
            </button>

            {/* Trending + seasonal link */}
            {[
              { label: 'Trending', to: buildPath.search('trending') },
              { label: 'Summer of football', to: buildPath.search('football') },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="flex items-center text-[16px] font-normal text-[#333] hover:text-argos-green transition-colors whitespace-nowrap"
                style={{ padding: 0, paddingLeft: 12, paddingRight: 12 }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* ── Search bar — exact live argos.co.uk structure:
                 Container: flex, transparent bg, relative
                 SVG icon: position absolute, 16×16px, left:15px, vertically centered
                 Label: sr-only (visually hidden)
                 INPUT: flex:1, radius 30 0 0 30, pl:40px, pr:35px, bg:#F5F5F5, h:44, no border
                 BUTTON: 79×44, bg:rgb(112,112,112), radius 0 30 30 0
            ── */}
          <form
            onSubmit={handleSearch}
            className="flex flex-1 min-w-0"
            role="search"
            style={{ marginLeft: 30, height: 44 }}
          >
            {/* Flex container: transparent, relative (icon positioned inside) */}
            <div className="flex flex-1" style={{ position: 'relative', height: 44 }}>
              {/* Search icon: position absolute, 16×16px, left:15px, vertically centred — exact Argos */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="16px"
                height="16px"
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: 15,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#333',
                  zIndex: 1,
                  pointerEvents: 'none',
                }}
              >
                <path d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5zM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5z" />
              </svg>

              {/* Hidden label — matches Argos sr-only pattern */}
              <label htmlFor="argos-search" className="sr-only">
                Search
              </label>

              {/* INPUT: pill-rounded on LEFT (30px) to match button's right-pill — exact Argos */}
              <input
                id="argos-search"
                type="text"
                role="combobox"
                aria-expanded={false}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products or brands"
                aria-label="Search"
                style={{
                  flex: 1,
                  height: 44,
                  paddingLeft: 40, // room for the 16px absolute icon at left:15px
                  paddingRight: 35,
                  fontSize: 16,
                  fontWeight: 400,
                  color: '#333',
                  backgroundColor: '#F5F5F5',
                  border: 'none',
                  outline: 'none',
                  borderRadius: '30px 0px 0px 30px', // LEFT pill — matches live Argos
                  width: '100%',
                }}
              />
            </div>

            {/* Search button: gray pill on RIGHT — radius 0 30 30 0, exact Argos */}
            <button
              type="submit"
              aria-label="Search button"
              className="flex items-center justify-center text-white flex-shrink-0 transition-opacity hover:opacity-90"
              style={{
                backgroundColor: 'rgb(112, 112, 112)',
                borderRadius: '0px 30px 30px 0px',
                width: 79,
                height: 44,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <b>Search</b>
            </button>
          </form>

          {/* ── Right icon area: Account + Wishlist + Trolley, each 71×65 ── */}
          {/* marginLeft:30 — live Argos search→icons gap = 30px */}
          <div className="hidden md:flex items-center flex-shrink-0" style={{ marginLeft: 30 }}>
            <HeaderIconLink
              to={isAuthenticated ? PATHS.ACCOUNT : PATHS.LOGIN}
              label={isAuthenticated ? (user?.firstName ?? 'Account') : 'Account'}
            >
              <IconAccount />
            </HeaderIconLink>

            <HeaderIconLink to={PATHS.HOME} label="Wishlist" badge={wishlistCount}>
              <IconWishlist filled={wishlistCount > 0} />
            </HeaderIconLink>

            <HeaderIconLink to={PATHS.BASKET} label="Trolley" badge={summary.itemCount}>
              <IconTrolley />
            </HeaderIconLink>
          </div>

          {/* Mobile trolley only */}
          <Link
            to={PATHS.BASKET}
            className="md:hidden flex items-center justify-center text-[#333] hover:text-argos-green transition-colors relative ml-auto"
            style={{ fontSize: 24, width: 40, height: 40 }}
          >
            <IconTrolley />
            {summary.itemCount > 0 && (
              <span className="absolute top-0 right-0 bg-argos-green text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                {summary.itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* ── Tier 3: Category nav bar (desktop only) ── */}
      <div className="hidden md:block">
        <MegaMenu />
      </div>

      {/* ── Promo ticker strip ── */}
      <PromoStrip />

      {/* ── Argos Shop mega menu — two-panel overlay ── */}
      <ShopMegaMenu />

      {/* ── Mobile slide-out menu ── */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-argos-border shadow-lg">
          {/* Full-width mobile menu */}
          <div className="w-full py-2 flex flex-col" style={{ paddingLeft: 16, paddingRight: 16 }}>
            {[
              {
                label: isAuthenticated ? `Hi, ${user?.firstName}` : 'Sign in / Register',
                to: isAuthenticated ? PATHS.ACCOUNT : PATHS.LOGIN,
                icon: <IconAccount />,
              },
              { label: 'Track order', to: PATHS.TRACK_ORDER, icon: <IconTrackOrder /> },
              { label: 'Store finder', to: PATHS.STORE_FINDER, icon: <IconStores /> },
              { label: 'Help', to: PATHS.HELP, icon: <IconHelp /> },
            ].map((item, i, arr) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => dispatch(closeMobileMenu())}
                className={`flex items-center gap-3 text-[16px] font-normal text-[#333] py-3 ${
                  i < arr.length - 1 ? 'border-b border-argos-border' : ''
                }`}
              >
                <span style={{ fontSize: 20, color: '#333' }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
