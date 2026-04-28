import { AuthLayout } from '@/components/auth/auth-layout'
import { LoginForm } from '@/components/login-form'

/**
 * Login Page
 *
 * This component renders the login page of the application. It uses the
 * `LoginForm` component to display the login form to the user, wrapped in
 * the shared `AuthLayout` which provides the marketing hero and thematic
 * background.
 *
 * @returns Login Page Component
 */
export default function Page() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
