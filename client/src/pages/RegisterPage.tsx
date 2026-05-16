import { Link, useSearchParams } from 'react-router-dom'
import { RegisterForm } from '@/features/auth/RegisterForm'

/**
 * Mirrors https://www.argos.co.uk/my-account/register — a single-column
 * centered white card on a light grey page.
 */
export default function RegisterPage() {
  const [params] = useSearchParams()
  const successUrl = params.get('successUrl')
  const loginHref = `/auth/login${successUrl ? `?successUrl=${encodeURIComponent(successUrl)}` : ''}`

  return (
    <div className="bg-argos-gray-bg min-h-[calc(100vh-200px)] py-8 sm:py-12">
      <div className="page-container max-w-[460px]">
        <section
          aria-labelledby="register-heading"
          className="bg-white rounded border border-argos-gray-200 p-6 sm:p-8 shadow-sm"
        >
          <h1 id="register-heading" className="text-2xl font-bold text-argos-gray-800 mb-1">
            Create your account
          </h1>
          <p className="text-sm text-argos-gray mb-6">
            Already have an account?{' '}
            <Link to={loginHref} className="text-argos-blue font-semibold hover:underline">
              Sign in
            </Link>
          </p>

          <RegisterForm />
        </section>

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
