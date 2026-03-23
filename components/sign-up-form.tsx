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
import { ERROR_MESSAGE } from '@/lib/messages'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ComponentPropsWithoutRef, ReactElement, useActionState } from 'react'
import { toast } from 'sonner'

/**
 * Sign Up Form
 *
 * Renders a form for users to create a new account by providing their email and
 * password. Uses `useActionState` for form submission and validates that
 * passwords match before submitting. Displays thematic error messages via toast.
 *
 * @param props Sign Up Form Properties
 * @returns Sign Up Form Component
 */
export function SignUpForm({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>): ReactElement {
  const router = useRouter()

  const [, submitAction, isPending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      const email = formData.get('email') as string
      const password = formData.get('password') as string
      const repeatPassword = formData.get('repeat-password') as string

      if (password !== repeatPassword) {
        toast.error('Passwords do not match.')
        return 'Passwords do not match'
      }

      try {
        const supabase = createClient()
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/confirm`
          }
        })

        if (signUpError) throw signUpError
        if (!data.user) throw new Error('User creation failed')

        router.push('/auth/sign-up-success')
        return null
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : ERROR_MESSAGE()

        console.error('Sign Up Error:', error)
        toast.error(message)
        return message
      }
    },
    null
  )

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
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
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={isPending}
                  autoComplete="new-password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="repeat-password">Repeat Password</Label>
                <Input
                  id="repeat-password"
                  name="repeat-password"
                  type="password"
                  required
                  disabled={isPending}
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Creating an account...' : 'Sign up'}
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
