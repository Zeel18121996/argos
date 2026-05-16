import { Link, useSearchParams } from 'react-router-dom'
import { LoginForm } from '@/features/auth/LoginForm'

/**
 * Mirrors https://www.argos.co.uk/login — a single-column centered white card
 * on a light grey page. Sign-in form on top; a "Create an account" CTA below.
 */
export default function LoginPage() {
  const [params] = useSearchParams()
  const successUrl = params.get('successUrl')
  const registerHref = `/auth/register${successUrl ? `?successUrl=${encodeURIComponent(successUrl)}` : ''}`

  return (
    <div className="bg-argos-gray-bg min-h-[calc(100vh-200px)] py-8 sm:py-12">
      <div className="page-container max-w-[460px]">
        {/* ── Sign-in card ─────────────────────────────────────────────── */}
        <section
          aria-labelledby="signin-heading"
          className="bg-white rounded border border-argos-gray-200 p-6 sm:p-8 shadow-sm"
        >
          <h1 id="signin-heading" className="text-2xl font-bold text-argos-gray-800 mb-1">
            Sign in
          </h1>
          <p className="text-sm text-argos-gray mb-6">
            Sign in or{' '}
            <Link to={registerHref} className="text-argos-blue font-semibold hover:underline">
              create an account
            </Link>
          </p>

          <LoginForm />
        </section>

        {/* ── Register prompt — below the card ────────────────────────── */}
        <section
          aria-labelledby="register-heading"
          className="bg-white rounded border border-argos-gray-200 p-6 sm:p-8 shadow-sm mt-4"
        >
          <h2 id="register-heading" className="text-lg font-bold text-argos-gray-800 mb-2">
            New to Argos?
          </h2>
          <p className="text-sm text-argos-gray mb-4">
            Create an account in under a minute &mdash; faster checkout, easy returns, and
            member-only offers.
          </p>
          <Link
            to={registerHref}
            className="inline-flex items-center justify-center w-full h-11 rounded font-bold text-sm border-2 border-argos-green text-argos-green bg-white hover:bg-argos-green-light focus-ring transition-colors"
          >
            Create an account
          </Link>
        </section>

        {/* ── Legal microcopy ──────────────────────────────────────────── */}
        <p className="text-xs text-argos-gray text-center mt-6 leading-relaxed px-2">
          By continuing, you agree to our{' '}
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
