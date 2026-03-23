'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ComponentPropsWithoutRef, ReactElement, useActionState } from 'react'
import { toast } from 'sonner'

/**
 * Forgot Password Form
 *
 * Renders a form that allows users to request a password reset by entering
 * their email address. Uses `useActionState` for form submission and displays
 * thematic error/success messages via toast.
 *
 * @param props Forgot Password Form Properties
 * @returns Forgot Password Form Component
 */
export function ForgotPasswordForm({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>): ReactElement {
  const [state, submitAction, isPending] = useActionState(
    async (_prev: 'success' | 'error' | null, formData: FormData) => {
      const email = formData.get('email') as string

      try {
        const supabase = createClient()
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo: `${window.location.origin}/auth/update-password`
          }
        )

        if (resetError) throw resetError

        toast.success('Password reset instructions sent to your email.')
        return 'success' as const
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : 'The darkness swallows your words. Please try again.'

        console.error('Forgot Password Error:', error)
        toast.error(message)
        return 'error' as const
      }
    },
    null
  )

  if (state === 'success') {
    return (
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>Password reset instructions sent</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If you registered using your email and password, you will receive
              a password reset email.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>
            Type in your email and we&apos;ll send you a link to reset your
            password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={submitAction}
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              submitAction(formData)
            }}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  disabled={isPending}
                  autoComplete="email"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Sending...' : 'Send reset email'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/auth/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
