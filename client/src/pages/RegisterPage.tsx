import { Link, useSearchParams } from 'react-router-dom'
import { RegisterForm } from '@/features/auth/RegisterForm'

/**
 * Pixel-perfect replica of https://www.argos.co.uk/my-account/register.
 * Same shell as LoginPage: white page, no card, centered ~480px column.
 */
export default function RegisterPage() {
  const [params] = useSearchParams()
  const successUrl = params.get('successUrl')
  const loginHref = `/auth/login${successUrl ? `?successUrl=${encodeURIComponent(successUrl)}` : ''}`

  return (
    <div className="bg-white py-10 sm:py-14">
      <div className="mx-auto w-full max-w-[480px] px-4">
        <h1 className="text-3xl font-bold text-argos-charcoal text-center mb-2">
          Create an account
        </h1>
        <p className="text-sm text-argos-gray text-center mb-8">
          Already have an account?{' '}
          <Link
            to={loginHref}
            className="text-argos-blue font-semibold underline hover:no-underline"
          >
            Sign in
          </Link>
        </p>

        <RegisterForm />

        <p className="text-xs text-argos-gray text-center mt-6 leading-relaxed px-2">
          By creating an account you agree to our{' '}
          <a href="/help/terms" className="text-argos-blue hover:underline">
            Terms &amp; Conditions
          </a>{' '}
          and{' '}
          <a href="/help/privacy" className="text-argos-blue hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  )
}
