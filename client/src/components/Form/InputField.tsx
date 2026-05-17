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
  autoComplete?: string
  hint?: string
}

/**
 * Matches the Argos login form field: bold label above, ~48px tall input,
 * generous padding, gray border, blue focus ring. No red asterisk on Argos —
 * required state is implicit.
 */
const InputField: React.FC<Props> = ({
  label,
  registration,
  error,
  type = 'text',
  placeholder,
  className,
  autoComplete,
  hint,
}) => {
  const fieldId = `in-${registration.name}`
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={fieldId} className="text-sm font-bold text-argos-charcoal">
        {label}
      </label>
      <input
        {...registration}
        id={fieldId}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        className={cn(
          'w-full h-12 border rounded px-3 text-base text-argos-charcoal placeholder-argos-gray-mid bg-white transition-colors',
          'focus:outline-none focus:border-argos-blue focus:ring-1 focus:ring-argos-blue',
          error ? 'border-argos-red bg-red-50' : 'border-argos-gray-light hover:border-argos-gray',
        )}
      />
      {error && <p className="text-xs text-argos-red">{error.message}</p>}
      {!error && hint && <p className="text-xs text-argos-gray">{hint}</p>}
    </div>
  )
}

export default InputField
