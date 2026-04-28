import { AuthLayout } from '@/components/auth/auth-layout'
import { SignUpForm } from '@/components/sign-up-form'

/**
 * Sign Up Page
 *
 * Renders the sign-up form for new users to create an account, wrapped in
 * the shared `AuthLayout` which provides the marketing hero and thematic
 * background.
 *
 * @returns Sign Up Page Component
 */
export default function Page() {
  return (
    <AuthLayout>
      <SignUpForm />
    </AuthLayout>
  )
}
