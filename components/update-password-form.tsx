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
import { useRouter } from 'next/navigation'
import { ComponentPropsWithoutRef, ReactElement, useActionState } from 'react'
import { toast } from 'sonner'

/**
 * Update Password Form
 *
 * Renders a form for users to set a new password after requesting a password
 * reset. Uses `useActionState` for form submission and displays thematic
 * error messages via toast.
 *
 * @param props React component props
 * @returns Update password form component
 */
export function UpdatePasswordForm({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>): ReactElement {
  const router = useRouter()

  const [, submitAction, isPending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      const password = formData.get('password') as string

      try {
        const supabase = createClient()
        const { error: updateError } = await supabase.auth.updateUser({
          password
        })

        if (updateError) throw updateError

        toast.success('Your password has been updated.')
        router.push('/')
        return null
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : 'The darkness swallows your words. Please try again.'

        console.error('Update Password Error:', error)
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
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>
            Please enter your new password below.
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
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="New password"
                  required
                  disabled={isPending}
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save new password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
