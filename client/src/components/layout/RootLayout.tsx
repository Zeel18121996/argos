import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Header } from './Header'
import { Footer } from './Footer'
import { AuthBootstrapper } from '@/features/auth/AuthBootstrapper'

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-argos-gray-50 font-sans">
      <AuthBootstrapper />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster position="top-right" richColors closeButton duration={3000} />
    </div>
  )
}
