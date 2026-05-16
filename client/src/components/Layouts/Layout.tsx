import React, { useEffect } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import Header from './Header/Header'
import Footer from './Footer/Footer'
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux'
import { hideToast } from '@/store/slices/uiSlice'
import { cn } from '@/utils/cn'

interface Props {
  children: React.ReactNode
}

const Toast: React.FC = () => {
  const dispatch = useAppDispatch()
  const { toastMessage, toastType } = useAppSelector((s) => s.ui)

  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => dispatch(hideToast()), 3000)
      return () => clearTimeout(t)
    }
  }, [toastMessage, dispatch])

  if (!toastMessage) return null

  const icons = {
    success: <CheckCircle size={18} className="text-argos-green" />,
    error: <XCircle size={18} className="text-argos-red" />,
    info: <Info size={18} className="text-argos-blue" />,
  }

  const borders = {
    success: 'border-l-4 border-argos-green',
    error: 'border-l-4 border-argos-red',
    info: 'border-l-4 border-argos-blue',
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-slide-in-right">
      <div
        className={cn(
          'bg-white shadow-xl rounded px-4 py-3 flex items-center gap-3 max-w-sm',
          borders[toastType],
        )}
      >
        {icons[toastType]}
        <p className="text-sm text-argos-charcoal flex-1">{toastMessage}</p>
        <button
          onClick={() => dispatch(hideToast())}
          className="text-argos-gray-mid hover:text-argos-charcoal"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}

const Layout: React.FC<Props> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-white">
    <Header />
    <main className="flex-1" id="main-content">
      {children}
    </main>
    <Footer />
    <Toast />
  </div>
)

export default Layout
