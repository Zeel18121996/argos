import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Header } from './Header'
import { Footer } from './Footer'
import { BasketDrawer } from './BasketDrawer'
import { useAppSelector, useAppDispatch } from '@/app/store'
import { setBasketDrawerOpen } from '@/features/ui/uiSlice'

export function RootLayout() {
  const isOpen = useAppSelector((s) => s.ui.isBasketDrawerOpen)
  const dispatch = useAppDispatch()

  return (
    <div className="min-h-screen flex flex-col bg-argos-gray-50 font-sans">
      {/* Skip-to-content link — visible only when keyboard-focused.
          Saves keyboard users ~17 tab stops past the header. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-argos-charcoal focus:border focus:border-argos-blue focus:px-3 focus:py-1.5 focus:rounded-sm focus:shadow-md"
      >
        Skip to main content
      </a>

      <Header />
      <main id="main-content" className="flex-1 border-t border-argos-gray-200">
        <Outlet />
      </main>
      <Footer />
      <Toaster position="top-right" richColors closeButton duration={3000} />
      <BasketDrawer isOpen={isOpen} onClose={() => dispatch(setBasketDrawerOpen(false))} />
    </div>
  )
}
