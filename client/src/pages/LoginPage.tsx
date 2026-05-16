import { Link, useSearchParams } from 'react-router-dom'
import { LoginForm } from '@/features/auth/LoginForm'

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

/* ───────────────────────────────────────────────────────────────────────────
 * "Part of the family" — thin horizontal line with the text centered on top,
 * followed by Argos / Tu / habitat brand wordmarks.
 * --------------------------------------------------------------------------- */
function FamilyDivider() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full flex items-center" aria-hidden="true">
        <span className="flex-1 h-px bg-argos-gray-light" />
        <span className="px-3 text-xs text-argos-gray font-normal whitespace-nowrap">
          Part of the family
        </span>
        <span className="flex-1 h-px bg-argos-gray-light" />
      </div>
      <div
        className="flex items-center justify-center gap-8"
        aria-label="Part of the Sainsbury's family: Argos, Tu, habitat"
      >
        <BrandArgos />
        <BrandTu />
        <BrandHabitat />
      </div>
    </div>
  )
}

function BrandArgos() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center justify-center bg-argos-red text-white font-bold rounded-sm"
      style={{ width: 56, height: 28, fontSize: 13, letterSpacing: '-0.02em' }}
    >
      Argos
    </span>
  )
}

function BrandTu() {
  return (
    <span
      aria-hidden="true"
      className="font-bold text-argos-charcoal italic"
      style={{ fontSize: 26, lineHeight: 1, fontFamily: 'Georgia, serif' }}
    >
      Tu
    </span>
  )
}

function BrandHabitat() {
  return (
    <span
      aria-hidden="true"
      className="text-argos-charcoal"
      style={{ fontSize: 18, lineHeight: 1, fontFamily: 'Georgia, serif' }}
    >
      habitat<sup style={{ fontSize: 9, marginLeft: 1 }}>®</sup>
    </span>
  )
}
