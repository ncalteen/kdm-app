import { SignUpForm } from '@/components/sign-up-form'

/**
 * Sign Up Page
 *
 * Renders the sign-up form for new users to create an account.
 *
 * @returns Sign Up Page Component
 */
export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  )
}
