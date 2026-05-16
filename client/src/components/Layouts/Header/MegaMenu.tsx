import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux'
import { closeMegaMenu, openMegaMenu } from '@/store/slices/uiSlice'
import { buildPath } from '@/constants/path'
import { NAV_CATEGORIES } from '@/data/mock-categories'

const MegaMenu: React.FC = () => {
  const dispatch = useAppDispatch()
  const { isMegaMenuOpen, activeMegaMenuCategory } = useAppSelector((s) => s.ui)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeCategory = NAV_CATEGORIES.find((c) => c.id === activeMegaMenuCategory)

  const handleMouseEnter = (categoryId: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    dispatch(openMegaMenu(categoryId))
  }

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => dispatch(closeMegaMenu()), 150)
  }

  return (
    <div className="relative" onMouseLeave={handleMouseLeave}>
      {/* Nav bar — full-width, pl=15px matches live Argos */}
      <nav className="bg-white border-b border-argos-border">
        <div className="w-full" style={{ paddingLeft: 15, paddingRight: 15 }}>
          <ul className="flex items-center gap-0 overflow-x-auto">
            {NAV_CATEGORIES.map((cat) => (
              <li key={cat.id}>
                <Link
                  to={buildPath.category(cat.slug)}
                  onMouseEnter={() => handleMouseEnter(cat.id)}
                  onClick={() => dispatch(closeMegaMenu())}
                  className={`flex items-center gap-1 px-3 py-3 text-[16px] leading-[24px] font-normal whitespace-nowrap border-b-2 transition-colors hover:text-argos-green hover:border-argos-green
                    ${
                      activeMegaMenuCategory === cat.id && isMegaMenuOpen
                        ? 'text-argos-green border-argos-green'
                        : 'text-argos-dark border-transparent'
                    }`}
                >
                  {cat.name}
                  {cat.children.length > 0 && <ChevronRight size={12} className="rotate-90" />}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Dropdown panel */}
      {isMegaMenuOpen && activeCategory && (
        <div
          className="absolute top-full left-0 right-0 bg-white border-b border-argos-border shadow-2xl z-50"
          onMouseEnter={() => {
            if (closeTimer.current) clearTimeout(closeTimer.current)
          }}
        >
          {/* Dropdown also full-width — pl=15px matches live Argos */}
          <div className="w-full py-6" style={{ paddingLeft: 15, paddingRight: 15 }}>
            <div className="grid grid-cols-4 gap-8">
              {/* Columns 1-3: Sub-category links */}
              <div className="col-span-3 grid grid-cols-3 gap-x-6 gap-y-2">
                {activeCategory.children.map((child) => (
                  <Link
                    key={child.id}
                    to={buildPath.category(child.slug)}
                    onClick={() => dispatch(closeMegaMenu())}
                    className="text-[16px] leading-[24px] font-normal text-argos-dark hover:text-argos-green hover:underline"
                  >
                    {child.name}
                  </Link>
                ))}
              </div>

              {/* Column 4: View all CTA */}
              <div className="border-l border-argos-border pl-6">
                <p className="text-[16px] font-normal text-argos-gray-mid mb-3">Shop all</p>
                <Link
                  to={buildPath.category(activeCategory.slug)}
                  onClick={() => dispatch(closeMegaMenu())}
                  className="inline-flex items-center gap-1.5 text-[16px] font-bold text-argos-green hover:underline"
                >
                  All {activeCategory.name}
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MegaMenu
