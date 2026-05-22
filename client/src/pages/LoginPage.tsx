import { Link, useSearchParams } from 'react-router-dom'
import { LoginForm } from '@/features/auth/LoginForm'
import { FamilyDivider } from '@/features/auth/FamilyDivider'

/**
 * Pixel-perfect replica of https://www.argos.co.uk/login.
 * Layout: white page, no card, single column centered ~480px wide.
 *   • Centered "Sign in" heading
 *   • "Part of the family" thin divider + Argos / Tu / habitat brand logos
 *   • Email + Password + Forgotten password link + green "Sign in securely" button
 *   • Generous gap, then centered "New customers" heading
 *   • Green outline "Create an account" full-width button
 */
export default function LoginPage() {
  const [params] = useSearchParams()
  const successUrl = params.get('successUrl')
  const registerHref = `/auth/register${successUrl ? `?successUrl=${encodeURIComponent(successUrl)}` : ''}`

  return (
    <div className="bg-white py-10 sm:py-14">
      <div className="mx-auto w-full max-w-[480px] px-4">
        {/* ── Heading ─────────────────────────────────────────────────── */}
        <h1 className="text-3xl font-bold text-argos-charcoal text-center mb-8">Sign in</h1>

        {/* ── "Part of the family" divider + brand logos ──────────────── */}
        <FamilyDivider />

        {/* ── Sign-in form ────────────────────────────────────────────── */}
        <div className="mt-8">
          <LoginForm />
        </div>

        {/* ── New customers section ───────────────────────────────────── */}
        <div className="mt-14">
          <h2 className="text-2xl font-bold text-argos-charcoal text-center mb-6">New customers</h2>
          <Link
            to={registerHref}
            className="inline-flex items-center justify-center w-full h-12 rounded border-2 border-argos-green text-argos-green text-base font-bold bg-white hover:bg-argos-green-light focus:outline-none focus-visible:ring-2 focus-visible:ring-argos-green focus-visible:ring-offset-2 transition-colors"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  )
}
