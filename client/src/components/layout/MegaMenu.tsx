import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Monitor,
  Home,
  Heart,
  Dumbbell,
  Gamepad2,
  Watch,
  Gift,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Category } from '@/types/category.types'

interface MegaMenuProps {
  categories: Category[]
  onClose: () => void
  topOffset?: number
}

// Map top-level category slug → Lucide icon
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  technology: Monitor,
  'home-and-garden': Home,
  'health-and-beauty': Heart,
  'sports-and-leisure': Dumbbell,
  'toys-and-games': Gamepad2,
  'jewellery-and-watches': Watch,
  'gifts-and-occasions': Gift,
}

export function MegaMenu({ categories, onClose, topOffset = 65 }: MegaMenuProps) {
  const [activeId, setActiveId] = useState<string | null>(categories[0]?.id ?? null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // Small delay so the click that opened the menu doesn't immediately close it
    const id = setTimeout(() => document.addEventListener('mousedown', handler), 50)
    return () => {
      clearTimeout(id)
      document.removeEventListener('mousedown', handler)
    }
  }, [onClose])

  const activeCategory = categories.find((c) => c.id === activeId)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 animate-fade-in"
        style={{ top: topOffset }}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Menu panel */}
      <div
        ref={panelRef}
        className="fixed left-0 right-0 z-40 bg-white shadow-lg animate-slide-down"
        style={{ top: topOffset }}
        role="navigation"
        aria-label="Category menu"
      >
        <div className="page-container flex max-h-[70vh]">
          {/* Left: category list */}
          <div className="w-64 shrink-0 border-r border-argos-gray-200 py-3 overflow-y-auto">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.slug] ?? Monitor
              const isActive = cat.id === activeId
              return (
                <button
                  key={cat.id}
                  onMouseEnter={() => setActiveId(cat.id)}
                  onClick={() => setActiveId(cat.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors',
                    isActive
                      ? 'bg-argos-gray-100 text-argos-gray-800 font-semibold'
                      : 'text-argos-gray-700 hover:bg-argos-gray-50',
                  )}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <Icon size={18} className="shrink-0 text-argos-gray-500" />
                  <span className="flex-1">{cat.name}</span>
                  <ChevronRight size={14} className="shrink-0 text-argos-gray-400" />
                </button>
              )
            })}
          </div>

          {/* Right: sub-category grid */}
          <div className="flex-1 py-5 px-6 overflow-y-auto">
            {activeCategory && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-md font-bold text-argos-gray-800">{activeCategory.name}</h2>
                  <Link
                    to={`/browse/${activeCategory.slug}`}
                    className="text-sm text-argos-blue hover:underline focus-ring rounded"
                    onClick={onClose}
                  >
                    View all
                  </Link>
                </div>

                {activeCategory.children.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {activeCategory.children.map((child) => (
                      <Link
                        key={child.id}
                        to={`/browse/${activeCategory.slug}/${child.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-2 p-2 rounded text-sm text-argos-gray-700 hover:bg-argos-gray-100 hover:text-argos-blue transition-colors focus-ring group"
                      >
                        <span className="w-1 h-1 rounded-full bg-argos-gray-300 group-hover:bg-argos-blue shrink-0" />
                        {child.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-argos-gray-500">
                    Browse all {activeCategory.name} products
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
