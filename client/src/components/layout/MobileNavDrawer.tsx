import { useState } from 'react'
import { Link } from 'react-router-dom'
import { X, ChevronDown, ChevronRight, User } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuth } from '@/hooks/useAuth'
import type { Category } from '@/types/category.types'

interface MobileNavDrawerProps {
  categories: Category[]
  isOpen: boolean
  onClose: () => void
}

export function MobileNavDrawer({ categories, isOpen, onClose }: MobileNavDrawerProps) {
  const { isAuthenticated, user } = useAuth()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50 md:hidden"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className="fixed inset-y-0 left-0 w-[85vw] max-w-[320px] bg-white z-60 flex flex-col shadow-lg md:hidden overflow-y-auto animate-slide-in-left"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-argos-gray-200 shrink-0">
          <span className="text-argos-red font-bold text-xl">argos</span>
          <button
            onClick={onClose}
            className="p-2 text-argos-gray-700 focus-ring rounded"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Auth row */}
        <div className="px-4 py-3 border-b border-argos-gray-200 bg-argos-gray-50">
          <Link
            to={isAuthenticated ? '/account' : '/auth/login'}
            onClick={onClose}
            className="flex items-center gap-3 text-sm font-semibold text-argos-gray-700"
          >
            <User size={18} />
            {isAuthenticated ? `Hi, ${user?.firstName}` : 'Sign in or register'}
          </Link>
        </div>

        {/* Categories */}
        <nav className="flex-1" aria-label="Category navigation">
          <p className="px-4 pt-3 pb-1 text-2xs font-semibold text-argos-gray-500 uppercase tracking-wider">
            Shop by category
          </p>
          {categories.map((cat) => (
            <div key={cat.id} className="border-b border-argos-gray-100">
              {/* Category row */}
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-argos-gray-700 hover:bg-argos-gray-50 transition-colors"
                onClick={() => setExpandedId((prev) => (prev === cat.id ? null : cat.id))}
                aria-expanded={expandedId === cat.id}
              >
                {cat.name}
                <ChevronDown
                  size={16}
                  className={cn(
                    'text-argos-gray-400 transition-transform duration-200',
                    expandedId === cat.id && 'rotate-180',
                  )}
                />
              </button>

              {/* Sub-categories */}
              {expandedId === cat.id && cat.children.length > 0 && (
                <div className="bg-argos-gray-50 pb-1">
                  <Link
                    to={`/browse/${cat.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-2 px-6 py-2 text-sm text-argos-blue font-semibold hover:underline"
                  >
                    View all {cat.name}
                  </Link>
                  {cat.children.map((child) => (
                    <Link
                      key={child.id}
                      to={`/browse/${cat.slug}/${child.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-2 px-6 py-2 text-sm text-argos-gray-700 hover:text-argos-blue transition-colors"
                    >
                      <ChevronRight size={12} className="text-argos-gray-400" />
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom links */}
        <div className="shrink-0 border-t border-argos-gray-200 bg-argos-gray-50">
          {[
            { label: 'Track Order', href: '/order/tracking' },
            { label: 'Returns', href: '/order/tracking?type=returns' },
            { label: 'Find a Store', href: '/stores' },
            { label: 'Help', href: '/help' },
          ].map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className="flex items-center px-4 py-3 text-sm text-argos-gray-700 hover:bg-argos-gray-100 border-b border-argos-gray-100 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
