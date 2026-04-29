'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { MailCheckIcon, TriangleAlertIcon } from 'lucide-react'
import Link from 'next/link'
import { ComponentPropsWithoutRef, FormEvent, useState } from 'react'

/**
 * Forgot Password Form
 *
 * This component renders a form that allows users to request a password reset
 * by entering their email address.
 *
 * @param props Forgot Password Form Properties
 * @returns Forgot Password Form Component
 */
export function ForgotPasswordForm({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Handle Forgot Password Form Submission
   *
   * This function is called when the user submits the forgot password form. It
   * sends a password reset request to Supabase with the provided email address.
   *
   * @param e Form Event
   */
  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault()

    const supabase = createClient()

    setIsLoading(true)
    setError(null)

    try {
      // The url which will be included in the email. This URL needs to be
      // configured in your redirect URLs in the Supabase dashboard at
      // https://supabase.com/dashboard/project/_/auth/url-configuration
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/update-password`
        }
      )

      if (resetError) throw resetError

      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      {success ? (
        <Card>
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md border border-border/60 bg-amber-500/10 text-amber-400">
              <MailCheckIcon className="h-5 w-5" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              A wanderer is searching for your settlement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If you registered with email and password, instructions to reset
              it are on their way to your inbox.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Reset your password</CardTitle>
            <CardDescription>
              Enter your email and we&apos;ll send a link to relight your way.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <TriangleAlertIcon className="h-4 w-4" aria-hidden="true" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send reset email'}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="underline underline-offset-4">
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
