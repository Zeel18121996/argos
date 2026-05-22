import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link } from 'react-router-dom'
import InputField from '@/components/Form/InputField'
import { useForgotPasswordMutation } from '@/services/authApi'

interface FormValues {
  email: string
}

const schema = yup.object({
  email: yup
    .string()
    .required('Please enter your email')
    .email('Please enter a valid email')
    .max(320),
})

/**
 * Argos forgotten-password form. Mirrors the LoginForm layout: bold label
 * above the input, generic server-error banner, full-width green submit.
 * On success the form is replaced by an inline "check your email" message
 * (backend returns 200 silently regardless of whether the user exists).
 */
export function ForgotPasswordForm() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()
  const [serverError, setServerError] = useState<string | null>(null)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

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
      await forgotPassword({ email: values.email }).unwrap()
      setSubmittedEmail(values.email)
    } catch {
      setServerError('Something went wrong. Please try again in a moment.')
    }
  })

  if (submittedEmail) {
    return (
      <div className="flex flex-col gap-4">
        <div
          role="status"
          className="rounded border border-argos-green bg-argos-green-light text-argos-charcoal text-sm px-4 py-3"
        >
          <p className="font-bold mb-1">Check your email</p>
          <p>
            If an account exists for <span className="font-semibold">{submittedEmail}</span>,
            we've sent a link to reset your password. The link expires in 1 hour.
          </p>
        </div>
        <Link
          to="/auth/login"
          className="inline-flex items-center justify-center w-full h-12 rounded border-2 border-argos-green text-argos-green text-base font-bold bg-white hover:bg-argos-green-light focus:outline-none focus-visible:ring-2 focus-visible:ring-argos-green focus-visible:ring-offset-2 transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

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

      <p className="text-sm text-argos-charcoal">
        Enter the email address associated with your account and we'll send you a link to reset
        your password.
      </p>

      <InputField
        label="Email address"
        type="email"
        autoComplete="email"
        registration={register('email')}
        error={errors.email}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 rounded bg-argos-green hover:bg-argos-green-dark active:bg-argos-green-dark text-white text-base font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-argos-green focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Sending…' : 'Send reset link'}
      </button>

      <Link
        to="/auth/login"
        className="inline-block text-sm font-semibold text-argos-blue underline hover:no-underline text-center"
      >
        Back to sign in
      </Link>
    </form>
  )
}
