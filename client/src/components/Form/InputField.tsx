import React from 'react'
import type { UseFormRegisterReturn, FieldError } from 'react-hook-form'
import { cn } from '@/utils/cn'

interface Props {
  label: string
  registration: UseFormRegisterReturn
  error?: FieldError
  type?: string
  placeholder?: string
  className?: string
  required?: boolean
}

const InputField: React.FC<Props> = ({
  label,
  registration,
  error,
  type = 'text',
  placeholder,
  className,
  required,
}) => (
  <div className={cn('flex flex-col gap-1', className)}>
    <label className="text-sm font-bold text-argos-charcoal">
      {label}
      {required && <span className="text-argos-red ml-0.5">*</span>}
    </label>
    <input
      {...registration}
      type={type}
      placeholder={placeholder}
      className={cn(
        'w-full border rounded px-3 py-2.5 text-sm text-argos-charcoal placeholder-argos-gray-mid focus:outline-none focus:ring-2 focus:ring-argos-blue transition-shadow',
        error ? 'border-argos-red bg-red-50' : 'border-argos-gray-light hover:border-argos-gray',
      )}
    />
    {error && <p className="text-xs text-argos-red mt-0.5">{error.message}</p>}
  </div>
)

export default InputField
