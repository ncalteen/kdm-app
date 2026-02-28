import { UpdatePasswordForm } from '@/components/update-password-form'

/**
 * Update Password Page
 *
 * Renders the UpdatePasswordForm component, allowing users to update their
 * password.
 *
 * @returns Update Password Page Component
 */
export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <UpdatePasswordForm />
      </div>
    </div>
  )
}
