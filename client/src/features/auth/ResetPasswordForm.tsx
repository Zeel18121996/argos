import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import PasswordField from '@/components/Form/PasswordField'
import { useResetPasswordMutation } from '@/services/authApi'

interface Props {
  token: string
}

interface FormValues {
  password: string
  confirmPassword: string
}

const schema = yup.object({
  password: yup
    .string()
    .required('Please enter a new password')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain an uppercase letter')
    .matches(/[0-9]/, 'Password must contain a number')
    .max(128),
  confirmPassword: yup
    .string()
    .required('Please confirm your new password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
})

/**
 * Reset-password form. Receives the raw reset token (from ?token= in the URL)
 * as a prop. On success, toasts and redirects to /auth/login; on a bad/expired
 * token the backend returns 400 and the server message is surfaced inline.
 */
export function ResetPasswordForm({ token }: Props) {
  const navigate = useNavigate()
  const [resetPassword, { isLoading }] = useResetPasswordMutation()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: 'onTouched',
  })

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    try {
      await resetPassword({ token, password: values.password }).unwrap()
      toast.success('Password reset. You can now sign in.')
      navigate('/auth/login', { replace: true })
    } catch (err) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Could not reset password. Please request a new link and try again.'
      setServerError(msg)
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {serverError && (
        <div
          role="alert"
          className="rounded border border-argos-red bg-argos-red-light text-argos-red-dark text-sm px-3 py-2"
        >
          {serverError}
        </div>
      )}

      <PasswordField
        label="New password"
        autoComplete="new-password"
        registration={register('password')}
        error={errors.password}
        hint="At least 8 characters, including an uppercase letter and a number."
      />

      <PasswordField
        label="Confirm new password"
        autoComplete="new-password"
        registration={register('confirmPassword')}
        error={errors.confirmPassword}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 rounded bg-argos-green hover:bg-argos-green-dark active:bg-argos-green-dark text-white text-base font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-argos-green focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Resetting…' : 'Reset password'}
      </button>
    </form>
  )
}
