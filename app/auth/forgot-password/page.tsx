import { ForgotPasswordForm } from '@/components/forgot-password-form'

/**
 * Forgot Password Page
 *
 * This page renders the forgot password form, allowing users to request a
 * password reset.
 *
 * @returns Forgot Password Page Component
 */
export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
