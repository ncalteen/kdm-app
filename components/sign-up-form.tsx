'use client'

import { DiscordButton } from '@/components/auth/discord-button'
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
import { ERROR_MESSAGE } from '@/lib/messages'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { TriangleAlertIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ComponentPropsWithoutRef, FormEvent, useState } from 'react'

/**
 * Sign Up Form
 *
 * Renders a form for users to create a new account by providing their email and
 * password.
 *
 * @param props Sign Up Form Properties
 * @returns Sign Up Form Component
 */
export function SignUpForm({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  /**
   * Handle Sign Up Form Submission
   *
   * Validates the form inputs, creates a new user account with Supabase Auth,
   * and initializes the user's settings in the database. If successful, redirects
   * the user to the sign-up success page. If any errors occur, displays an error
   * message to the user.
   *
   * @param e Form Event
   */
  const handleSignUp = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    // Verify that the password and repeat password fields match.
    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Verify the username matches the allowed pattern (alphanumeric and
    // underscores, 3-20 characters).
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setError(
        'Username must be 3-20 characters and can only contain letters, numbers, and underscores'
      )
      setIsLoading(false)
      return
    }

    try {
      // Verify the username is not already taken via RPC (works for
      // unauthenticated users, unlike a direct table query blocked by RLS).
      const { data: isAvailable, error: usernameError } = await supabase.rpc(
        'check_username_available',
        { desired_username: username }
      )

      if (usernameError) throw usernameError

      if (!isAvailable) {
        setError('Username is already in use')
        setIsLoading(false)
        return
      }

      // Sign up the user with Supabase Auth. The username is stashed in
      // `raw_user_meta_data` so the email-confirmation route can provision
      // settings as a backstop if this client-side flow doesn't surface a
      // usable `data.user` (e.g., supabase-js parsing quirks for
      // confirmation-required signups, or a 4xx from GoTrue after the auth
      // row commits).
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: { username }
        }
      })
      if (signUpError) throw signUpError

      // Best-effort: provision settings inline so the row exists before the
      // user confirms their email. If `data.user` is absent (some
      // supabase-js versions return `null` for confirmation-required
      // signups — see https://github.com/supabase/auth-js v2.106 regression
      // in `_sessionResponse`), the SECURITY DEFINER backstop in
      // `/auth/confirm` reads `raw_user_meta_data` and calls the same RPC
      // after the PKCE exchange.
      if (data?.user?.id) {
        const { error: settingsError } = await supabase.rpc(
          'initialize_user_settings',
          { p_user_id: data.user.id, p_username: username }
        )

        if (settingsError) {
          console.error('Initialize User Settings Error:', settingsError)
          router.push(
            `/auth/error?error=${encodeURIComponent(settingsError.message)}`
          )
          return
        }
      }

      router.push('/auth/sign-up-success')
    } catch (error: unknown) {
      console.error('Sign Up Error:', error)
      setError(error instanceof Error ? error.message : ERROR_MESSAGE())
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Begin your chronicle.</CardTitle>
          <CardDescription>
            Create an account to found your first settlement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <DiscordButton onError={setError} label="Sign up with Discord" />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or sign up with email
                </span>
              </div>
            </div>
          </div>
          <form onSubmit={handleSignUp} className="mt-6">
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="user"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">Repeat Password</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <TriangleAlertIcon className="h-4 w-4" aria-hidden="true" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Forging your name...' : 'Sign up'}
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
