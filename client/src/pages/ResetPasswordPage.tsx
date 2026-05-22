import { Link, useSearchParams } from 'react-router-dom'
import { FamilyDivider } from '@/features/auth/FamilyDivider'
import { ResetPasswordForm } from '@/features/auth/ResetPasswordForm'

/**
 * Reset-password landing page. Reads ?token= from the URL and gates rendering
 * on its presence — if the user lands here without a token, we surface an
 * "Invalid link" view with a CTA back to the forgot-password flow instead of
 * showing the password form.
 */
export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token')

  return (
    <div className="bg-white py-10 sm:py-14">
      <div className="mx-auto w-full max-w-[480px] px-4">
        <h1 className="text-3xl font-bold text-argos-charcoal text-center mb-8">
          Reset your password
        </h1>

        <FamilyDivider />

        <div className="mt-8">
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <div className="flex flex-col gap-4">
              <div
                role="alert"
                className="rounded border border-argos-red bg-argos-red-light text-argos-red-dark text-sm px-4 py-3"
              >
                <p className="font-bold mb-1">Invalid link</p>
                <p>
                  This password reset link is invalid or has expired. Request a new link to
                  continue.
                </p>
              </div>
              <Link
                to="/auth/forgot-password"
                className="inline-flex items-center justify-center w-full h-12 rounded border-2 border-argos-green text-argos-green text-base font-bold bg-white hover:bg-argos-green-light focus:outline-none focus-visible:ring-2 focus-visible:ring-argos-green focus-visible:ring-offset-2 transition-colors"
              >
                Request a new link
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
