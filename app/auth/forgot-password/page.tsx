import { AuthLayout } from '@/components/auth/auth-layout'
import { ForgotPasswordForm } from '@/components/forgot-password-form'

/**
 * Forgot Password Page
 *
 * Renders the forgot-password form wrapped in the shared `AuthLayout` so the
 * marketing hero and thematic atmospherics stay consistent with the rest of
 * the auth flow.
 *
 * @returns Forgot Password Page Component
 */
export default function Page() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
