import { AuthLayout } from '@/components/auth/auth-layout'
import { UpdatePasswordForm } from '@/components/update-password-form'

/**
 * Update Password Page
 *
 * Renders the update-password form wrapped in the shared `AuthLayout` so the
 * marketing hero and thematic atmospherics stay consistent with the rest of the
 * auth flow.
 *
 * @returns Update Password Page Component
 */
export default function Page() {
  return (
    <AuthLayout>
      <UpdatePasswordForm />
    </AuthLayout>
  )
}
