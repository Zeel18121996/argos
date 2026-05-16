import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Header } from './Header'
import { Footer } from './Footer'
import { AuthBootstrapper } from '@/features/auth/AuthBootstrapper'
import { BasketDrawer } from './BasketDrawer'
import { useAppSelector, useAppDispatch } from '@/app/store'
import { setBasketDrawerOpen } from '@/features/ui/uiSlice'

export function RootLayout() {
  const isOpen = useAppSelector((s) => s.ui.isBasketDrawerOpen)
  const dispatch = useAppDispatch()

  return (
    <div className="min-h-screen flex flex-col bg-argos-gray-50 font-sans">
      <AuthBootstrapper />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster position="top-right" richColors closeButton duration={3000} />
      <BasketDrawer isOpen={isOpen} onClose={() => dispatch(setBasketDrawerOpen(false))} />
    </div>
  )
}
