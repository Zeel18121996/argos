import React from 'react'
import { Check } from 'lucide-react'
import type { UseFormRegisterReturn, FieldError } from 'react-hook-form'
import { cn } from '@/utils/cn'

interface Props {
  label: React.ReactNode
  registration: UseFormRegisterReturn
  error?: FieldError
  className?: string
  id?: string
}

const Checkbox: React.FC<Props> = ({ label, registration, error, className, id }) => {
  const inputId = id ?? registration.name

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={inputId} className="flex items-start gap-2 cursor-pointer select-none">
        <span className="relative inline-flex items-center justify-center mt-0.5">
          <input
            {...registration}
            id={inputId}
            type="checkbox"
            className="peer appearance-none w-5 h-5 border-2 border-argos-gray-light rounded bg-white checked:bg-argos-blue checked:border-argos-blue hover:border-argos-gray focus-visible:ring-2 focus-visible:ring-argos-blue focus-visible:ring-offset-1 transition-colors cursor-pointer"
          />
          <Check
            size={14}
            strokeWidth={3}
            className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
          />
        </span>
        <span className="text-sm text-argos-charcoal leading-snug">{label}</span>
      </label>
      {error && <p className="text-xs text-argos-red ml-7">{error.message}</p>}
    </div>
  )
}

export default Checkbox
