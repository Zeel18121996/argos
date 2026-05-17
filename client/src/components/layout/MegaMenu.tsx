import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'
import type { Category } from '@/types/category.types'

interface MegaMenuProps {
  categories: Category[]
  onClose: () => void
  topOffset?: number
}

// ── Chevron right — mirrors Argos ._1yQY6 ─────────────────────────────────────
function ChevronRight() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      width="1em"
      height="1em"
      aria-hidden="true"
      className="shrink-0 text-argos-gray-400"
    >
      <path d="M14.69 12l-6.97 6.97a.75.75 0 0 0 1.06 1.06l7.5-7.5a.75.75 0 0 0 0-1.06l-7.5-7.5a.75.75 0 0 0-1.06 1.06L14.69 12z" />
    </svg>
  )
}

// ── Left category rail ─────────────────────────────────────────────────────────
// Mirrors Argos ._2wWG_ list + ._3ha-x link:
//   padding: 14px 10px 14px 16px; font-size: 16px; color: #333
//   border-bottom: 1px solid #e0e0e0 per item; no category icons
function CategoryRail({
  categories,
  activeId,
  onEnter,
}: {
  categories: Category[]
  activeId: string | null
  onEnter: (id: string) => void
}) {
  return (
    <nav
      aria-label="Shop categories"
      className="shrink-0 overflow-y-auto border-r border-argos-gray-200 bg-white"
      style={{ width: 230 }}
    >
      <ul>
        {categories.map((cat) => {
          const isActive = cat.id === activeId
          return (
            <li key={cat.id} className="border-b border-argos-gray-100 last:border-b-0">
              <button
                type="button"
                onMouseEnter={() => onEnter(cat.id)}
                onClick={() => onEnter(cat.id)}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'w-full flex items-center justify-between gap-2 text-left transition-colors',
                  'text-[16px] leading-[1.2]',
                  isActive
                    ? 'bg-argos-gray-100 font-semibold text-argos-gray-900'
                    : 'text-[#333333] hover:bg-argos-gray-50',
                )}
                style={{
                  padding: '14px 10px 14px 16px',
                  fontFamily: 'Barlow, "Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
              >
                <span>{cat.name}</span>
                <ChevronRight />
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

// ── Sub-category panel ─────────────────────────────────────────────────────────
// Mirrors Argos right panel:
//   - "Shop all [Category]" bold blue link at top
//   - Children in column-first layout (4 cols), no bullets, no section headers
//   - Each link: 16px, #333, hover blue + underline
function SubCategoryPanel({
  category,
  onClose,
}: {
  category: Category
  onClose: () => void
}) {
  const children = category.children
  const NUM_COLS = 4
  const colSize = Math.ceil(children.length / NUM_COLS)
  // Slice into column arrays so children read top-to-bottom, left-to-right
  const columns: Category[][] = Array.from({ length: NUM_COLS }, (_, i) =>
    children.slice(i * colSize, (i + 1) * colSize),
  ).filter((col) => col.length > 0)

  return (
    <div className="flex-1 overflow-y-auto py-5 px-6 bg-white">
      {/* "Shop all X" — mirrors Argos top-of-panel bold link */}
      <Link
        to={`/browse/${category.slug}`}
        onClick={onClose}
        className="inline-block font-semibold text-argos-blue hover:underline mb-5"
        style={{
          fontSize: 16,
          fontFamily: 'Barlow, "Helvetica Neue", Helvetica, Arial, sans-serif',
        }}
      >
        Shop all {category.name}
      </Link>

      {children.length > 0 ? (
        <div className="flex gap-6">
          {columns.map((col, ci) => (
            <ul key={ci} className="flex-1 min-w-0">
              {col.map((child) => (
                <li key={child.id}>
                  <Link
                    to={`/browse/${category.slug}/${child.slug}`}
                    onClick={onClose}
                    className="block text-[#333333] hover:text-argos-blue hover:underline transition-colors"
                    style={{
                      fontSize: 16,
                      padding: '5px 0',
                      fontFamily: 'Barlow, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    }}
                  >
                    {child.name}
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </div>
      ) : (
        <p className="text-[16px] text-argos-gray-500">
          Browse all {category.name} products
        </p>
      )}
    </div>
  )
}

// ── Main MegaMenu ──────────────────────────────────────────────────────────────
export function MegaMenu({ categories, onClose, topOffset = 65 }: MegaMenuProps) {
  const [activeId, setActiveId] = useState<string | null>(categories[0]?.id ?? null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on outside click (delayed to avoid immediately closing on menu open)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const id = setTimeout(() => document.addEventListener('mousedown', handler), 50)
    return () => {
      clearTimeout(id)
      document.removeEventListener('mousedown', handler)
    }
  }, [onClose])

  const activeCategory = categories.find((c) => c.id === activeId)

  return (
    <>
      {/* Semi-transparent backdrop */}
      <div
        className="fixed inset-0 z-40 animate-fade-in"
        style={{ top: topOffset, background: 'rgba(0,0,0,0.4)' }}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Dropdown panel — full width, white, shadow */}
      <div
        ref={panelRef}
        className="fixed left-0 right-0 z-40 bg-white shadow-xl animate-slide-down"
        style={{ top: topOffset, borderTop: '1px solid #cccccc' }}
        role="dialog"
        aria-modal="false"
        aria-label="Shop categories"
      >
        <div
          className="flex w-full"
          style={{ maxHeight: 'calc(100vh - 220px)', minHeight: 300 }}
        >
          {/* Left rail: top-level category list */}
          <CategoryRail
            categories={categories}
            activeId={activeId}
            onEnter={setActiveId}
          />

          {/* Right panel: sub-categories */}
          {activeCategory && (
            <SubCategoryPanel category={activeCategory} onClose={onClose} />
          )}
        </div>
      </div>
    </>
  )
}
