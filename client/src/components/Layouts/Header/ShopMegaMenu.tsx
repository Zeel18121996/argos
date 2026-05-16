import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux'
import { closeShopMenu, setActiveShopCategory } from '@/store/slices/uiSlice'
import { buildPath } from '@/constants/path'
import { MOCK_CATEGORIES } from '@/data/mock-categories'

/* ─── Argos-style two-panel mega menu ─────────────────────────────────────
   Left sidebar  : 257px wide, categories each h=53px, pl=10px, pt/pb=14px
   Right panel   : flex-1, "Shop all X" (18px/700) + sub-links (15px/400)
   Position      : fixed, full-width, below header (top = header height)
   Triggered by  : clicking "Shop" in the main header nav
──────────────────────────────────────────────────────────────────────────── */

const ShopMegaMenu: React.FC = () => {
  const dispatch = useAppDispatch()
  const { isShopMenuOpen, activeShopCategory } = useAppSelector((s) => s.ui)
  const menuRef = useRef<HTMLDivElement>(null)

  // Default to first category if none active
  const activeCatId = activeShopCategory ?? MOCK_CATEGORIES[0]?.id ?? null
  const activeCat = MOCK_CATEGORIES.find((c) => c.id === activeCatId) ?? MOCK_CATEGORIES[0]

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch(closeShopMenu())
    }
    if (isShopMenuOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isShopMenuOpen, dispatch])

  if (!isShopMenuOpen) return null

  return (
    <>
      {/* Backdrop — click outside to close */}
      <div
        className="fixed inset-0 z-40"
        onClick={() => dispatch(closeShopMenu())}
        aria-hidden="true"
      />

      {/* Mega menu panel */}
      <div
        ref={menuRef}
        id="shopMegaMenu"
        role="dialog"
        aria-label="Shop all categories"
        className="fixed left-0 right-0 z-50 bg-white shadow-2xl border-t border-argos-border"
        style={{ top: 124 }} // 30px utility + 94px main header
      >
        <div
          className="flex w-full"
          style={{ minHeight: 400, maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}
        >
          {/* ── Left sidebar: 257px, all categories ── */}
          <div
            className="flex-shrink-0 border-r border-argos-border bg-white"
            style={{ width: 257 }}
          >
            <ul>
              {MOCK_CATEGORIES.map((cat) => {
                const isActive = cat.id === activeCatId
                return (
                  <li key={cat.id}>
                    <button
                      onMouseEnter={() => dispatch(setActiveShopCategory(cat.id))}
                      onClick={() => dispatch(setActiveShopCategory(cat.id))}
                      className={`w-full flex items-center justify-between transition-colors text-left ${
                        isActive
                          ? 'bg-argos-gray-bg text-argos-dark font-semibold'
                          : 'bg-white text-[#333] hover:bg-argos-gray-bg'
                      }`}
                      style={{
                        paddingLeft: 10,
                        paddingRight: 12,
                        paddingTop: 14,
                        paddingBottom: 14,
                        fontSize: 16,
                        fontWeight: isActive ? 600 : 400,
                        minHeight: 53,
                      }}
                    >
                      {cat.name}
                      <ChevronRight
                        size={14}
                        className={isActive ? 'text-argos-green' : 'text-argos-gray-mid'}
                      />
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* ── Right panel: sub-categories ── */}
          <div className="flex-1 bg-white p-8 overflow-y-auto">
            {activeCat && (
              <>
                {/* "Shop all [Category]" heading — 18px/700, matches Argos */}
                <Link
                  to={buildPath.category(activeCat.slug)}
                  onClick={() => dispatch(closeShopMenu())}
                  className="inline-flex items-center gap-2 hover:underline mb-6"
                  style={{ fontSize: 18, fontWeight: 700, color: '#333' }}
                >
                  Shop all {activeCat.name}
                  <ChevronRight size={16} />
                </Link>

                {/* Sub-category links — 15px/400, 3-column grid, matches Argos */}
                {activeCat.children.length > 0 && (
                  <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                    {activeCat.children.map((child) => (
                      <Link
                        key={child.id}
                        to={buildPath.category(child.slug)}
                        onClick={() => dispatch(closeShopMenu())}
                        className="hover:underline hover:text-argos-green transition-colors"
                        style={{ fontSize: 15, fontWeight: 400, color: '#333' }}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom close bar */}
        <div className="border-t border-argos-border px-8 py-3 flex justify-end bg-argos-gray-bg">
          <button
            onClick={() => dispatch(closeShopMenu())}
            className="text-[14px] font-normal text-argos-gray hover:text-argos-dark transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  )
}

export default ShopMegaMenu
