import React from 'react'
import { cn } from '@/utils/cn'

interface Props {
  label: string
  variant?: 'sale' | 'new' | 'clearance' | 'outOfStock' | 'info'
  className?: string
}

const Badge: React.FC<Props> = ({ label, variant = 'info', className }) => {
  const variants = {
    sale: 'bg-argos-green text-white',
    new: 'bg-argos-blue text-white',
    clearance: 'bg-argos-orange text-white',
    outOfStock: 'bg-argos-gray-mid text-white',
    info: 'bg-argos-blue-promo text-white',
  }

  return (
    <span
      className={cn(
        'inline-block text-[14px] leading-[20px] font-medium px-2 py-0.5 rounded-sm capitalize',
        variants[variant],
        className,
      )}
    >
      {label}
    </span>
  )
}

export default Badge
