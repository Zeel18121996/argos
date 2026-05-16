import React from 'react'
import { cn } from '@/utils/cn'

interface Props {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'full'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  className?: string
}

const Button: React.FC<Props> = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  onClick,
  className,
}) => {
  const base =
    'inline-flex items-center justify-center font-bold rounded cursor-pointer transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none'

  const variants = {
    primary: 'bg-argos-green text-white hover:bg-argos-green-dark focus-visible:ring-argos-green',
    secondary: 'bg-argos-blue text-white hover:bg-argos-blue-dark focus-visible:ring-argos-blue',
    outline:
      'border-2 border-argos-green text-argos-green bg-white hover:bg-argos-green-light focus-visible:ring-argos-green',
    ghost: 'bg-transparent text-argos-dark hover:bg-argos-gray-bg focus-visible:ring-argos-gray',
    danger: 'bg-argos-red text-white hover:bg-argos-red-dark focus-visible:ring-argos-red',
  }

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-7 py-3',
    full: 'text-sm px-5 py-3 w-full',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Loading…
        </span>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
