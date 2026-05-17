import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import InputField from '@/components/Form/InputField'
import PasswordField from '@/components/Form/PasswordField'
import Checkbox from '@/components/Form/Checkbox'
import { useRegisterMutation } from '@/services/authApi'
import { setAuth, setAuthError } from '@/features/auth/authSlice'
import { useAppDispatch } from '@/app/store'

const schema = yup
  .object({
    firstName: yup.string().required('Please enter your first name').max(80).trim(),
    lastName: yup.string().required('Please enter your last name').max(80).trim(),
    email: yup
      .string()
      .required('Please enter your email')
      .email('Please enter a valid email')
      .max(320),
    password: yup
      .string()
      .required('Please enter a password')
      .min(8, 'Must be at least 8 characters')
      .max(128)
      .matches(/[A-Za-z]/, 'Must contain at least one letter')
      .matches(/[0-9]/, 'Must contain at least one number'),
    marketingOptIn: yup.boolean().default(false),
    termsAccepted: yup
      .boolean()
      .oneOf([true], 'You must accept the Terms and Privacy Policy')
      .required(),
  })
  .required()

type FormValues = yup.InferType<typeof schema>

export function RegisterForm() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [registerUser, { isLoading }] = useRegisterMutation()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: 'onTouched',
    defaultValues: { marketingOptIn: false, termsAccepted: false },
  })

  const password = watch('password') ?? ''
  const strength = passwordStrength(password)

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    try {
      const result = await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        marketingOptIn: values.marketingOptIn,
      }).unwrap()
      dispatch(setAuth({ user: result.user, accessToken: result.accessToken }))
      toast.success(`Welcome to Argos, ${result.user.firstName}`)

      const successUrl = params.get('successUrl')
      navigate(successUrl ?? '/', { replace: true })
    } catch (err) {
      const data = (err as { data?: { message?: string; errors?: unknown } })?.data
      const msg =
        typeof data?.message === 'string'
          ? data.message
          : 'Could not create your account. Please try again.'
      setServerError(msg)
      dispatch(setAuthError(msg))
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InputField
          label="First name"
          autoComplete="given-name"
          registration={register('firstName')}
          error={errors.firstName}
        />
        <InputField
          label="Last name"
          autoComplete="family-name"
          registration={register('lastName')}
          error={errors.lastName}
        />
      </div>

      <InputField
        label="Email address"
        type="email"
        autoComplete="email"
        registration={register('email')}
        error={errors.email}
      />

      <div className="space-y-2">
        <PasswordField
          label="Password"
          autoComplete="new-password"
          registration={register('password')}
          error={errors.password}
          hint="At least 8 characters, including a letter and a number."
        />
        {password.length > 0 && (
          <PasswordStrengthBar score={strength.score} label={strength.label} />
        )}
      </div>

      <Checkbox
        label={
          <>
            Yes, send me Argos offers, news and information by email. You can unsubscribe at any
            time.
          </>
        }
        registration={register('marketingOptIn')}
        error={errors.marketingOptIn}
      />

      <Checkbox
        label={
          <>
            I have read and agree to the{' '}
            <a
              href="/help/terms"
              className="text-argos-blue underline"
              target="_blank"
              rel="noreferrer"
            >
              Terms &amp; Conditions
            </a>{' '}
            and{' '}
            <a
              href="/help/privacy"
              className="text-argos-blue underline"
              target="_blank"
              rel="noreferrer"
            >
              Privacy Policy
            </a>
            .
          </>
        }
        registration={register('termsAccepted')}
        error={errors.termsAccepted}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 rounded bg-argos-green hover:bg-argos-green-dark active:bg-argos-green-dark text-white text-base font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-argos-green focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  )
}

// ── Password strength helper ─────────────────────────────────────────────────
function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'] as const
  return { score: score as 0 | 1 | 2 | 3 | 4, label: labels[score] }
}

function PasswordStrengthBar({ score, label }: { score: 0 | 1 | 2 | 3 | 4; label: string }) {
  const colors = [
    'bg-argos-red',
    'bg-argos-red',
    'bg-argos-amber',
    'bg-argos-blue',
    'bg-argos-green',
  ] as const
  return (
    <div className="flex items-center gap-2" aria-live="polite">
      <div className="flex-1 grid grid-cols-4 gap-1">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`h-1.5 rounded ${score >= i ? colors[score] : 'bg-argos-gray-light'}`}
          />
        ))}
      </div>
      <span className="text-xs text-argos-gray-600 w-14 text-right">{label}</span>
    </div>
  )
}
