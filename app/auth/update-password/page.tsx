import { AuthLayout } from '@/components/auth/auth-layout'
import { UpdatePasswordForm } from '@/components/update-password-form'
import { redirect } from 'next/navigation'

/**
 * Update Password Page
 *
 * Renders the update-password form wrapped in the shared `AuthLayout` so the
 * marketing hero and thematic atmospherics stay consistent with the rest of the
 * auth flow.
 *
 * @returns Update Password Page Component
 */
export default async function Page({
  searchParams
}: {
  searchParams: Promise<{
    error?: string
    error_code?: string
    error_description?: string
  }>
}) {
  const params = await searchParams
  const error = params.error_description ?? params.error_code ?? params.error

  if (error) redirect(`/auth/error?error=${encodeURIComponent(error)}`)

  return (
    <AuthLayout>
      <UpdatePasswordForm />
    </AuthLayout>
  )
}
