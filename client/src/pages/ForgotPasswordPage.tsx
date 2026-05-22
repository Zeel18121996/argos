import { FamilyDivider } from '@/features/auth/FamilyDivider'
import { ForgotPasswordForm } from '@/features/auth/ForgotPasswordForm'

/**
 * Mirrors LoginPage layout: white page, single column centered ~480px wide,
 * "Part of the family" divider with Argos / Tu / habitat wordmarks, then the
 * forgotten-password form.
 */
export default function ForgotPasswordPage() {
  return (
    <div className="bg-white py-10 sm:py-14">
      <div className="mx-auto w-full max-w-[480px] px-4">
        <h1 className="text-3xl font-bold text-argos-charcoal text-center mb-8">
          Forgotten your password?
        </h1>

        <FamilyDivider />

        <div className="mt-8">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  )
}
