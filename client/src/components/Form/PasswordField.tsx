import React, { useState } from 'react'
import type { UseFormRegisterReturn, FieldError } from 'react-hook-form'
import { cn } from '@/utils/cn'

interface Props {
  label: string
  registration: UseFormRegisterReturn
  error?: FieldError
  placeholder?: string
  className?: string
  required?: boolean
  autoComplete?: 'current-password' | 'new-password'
  hint?: string
}

/**
 * Matches the Argos login password field — bordered input with a text-only
 * "Show / Hide" button inside on the right (no eye icon).
 */
const PasswordField: React.FC<Props> = ({
  label,
  registration,
  error,
  placeholder,
  className,
  required,
  autoComplete = 'current-password',
  hint,
}) => {
  const [show, setShow] = useState(false)
  const fieldId = `pw-${registration.name}`

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={fieldId} className="text-sm font-bold text-argos-charcoal">
        {label}
        {required && <span className="text-argos-red ml-0.5">*</span>}
      </label>
      <div
        className={cn(
          'relative flex items-stretch w-full border rounded transition-colors',
          error
            ? 'border-argos-red bg-red-50'
            : 'border-argos-gray-light hover:border-argos-gray focus-within:border-argos-blue focus-within:ring-1 focus-within:ring-argos-blue',
        )}
      >
        <input
          {...registration}
          id={fieldId}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={!!error}
          className="flex-1 h-12 px-3 text-base text-argos-charcoal placeholder-argos-gray-mid bg-transparent outline-none rounded"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-pressed={show}
          aria-label={show ? 'Hide password' : 'Show password'}
          tabIndex={-1}
          className="m-1.5 px-3 text-sm font-semibold text-argos-charcoal border border-argos-gray-light rounded hover:border-argos-gray focus-visible:ring-2 focus-visible:ring-argos-blue"
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      {error && <p className="text-xs text-argos-red">{error.message}</p>}
      {!error && hint && <p className="text-xs text-argos-gray">{hint}</p>}
    </div>
  )
}

export default PasswordField
