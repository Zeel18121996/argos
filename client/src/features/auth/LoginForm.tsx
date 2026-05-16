import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import InputField from '@/components/Form/InputField'
import PasswordField from '@/components/Form/PasswordField'
import Button from '@/components/Common/Button/Button'
import { useLoginMutation } from '@/services/authApi'
import { useMergeBasketMutation } from '@/services/basketApi'
import { setAuth, setAuthError } from '@/features/auth/authSlice'
import { useAppDispatch } from '@/app/store'

interface FormValues {
  email: string
  password: string
}

const schema = yup.object({
  email: yup
    .string()
    .required('Please enter your email')
    .email('Please enter a valid email')
    .max(320),
  password: yup.string().required('Please enter your password').max(128),
})

export function LoginForm() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [login, { isLoading }] = useLoginMutation()
  const [mergeBasket] = useMergeBasketMutation()
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
      const result = await login(values).unwrap()
      dispatch(setAuth({ user: result.user, accessToken: result.accessToken }))
      toast.success(`Welcome back, ${result.user.firstName}`)

      // Merge guest basket into user basket
      try {
        await mergeBasket({}).unwrap()
      } catch {
        // ignore merge errors
      }

      // Role-based redirect: staff/admin → /admin, customers honour successUrl, default /
      const successUrl = params.get('successUrl')
      if (result.user.role === 'staff' || result.user.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate(successUrl ?? '/', { replace: true })
      }
    } catch (err) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Sign in failed. Check your details and try again.'
      setServerError(msg)
      dispatch(setAuthError(msg))
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {serverError && (
        <div
          role="alert"
          className="rounded border border-argos-red bg-argos-red-light text-argos-red-dark text-sm px-3 py-2"
        >
          {serverError}
        </div>
      )}

      <InputField
        label="Email address"
        type="email"
        placeholder="you@example.com"
        registration={register('email')}
        error={errors.email}
        required
      />

      <PasswordField
        label="Password"
        autoComplete="current-password"
        registration={register('password')}
        error={errors.password}
        required
      />

      <div className="flex justify-end">
        <Link
          to="/auth/forgot-password"
          className="text-sm font-semibold text-argos-blue hover:underline focus-ring rounded"
        >
          Forgotten your password?
        </Link>
      </div>

      <Button type="submit" variant="primary" size="full" loading={isLoading}>
        Sign in
      </Button>
    </form>
  )
}
