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
import { TriangleAlertIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ComponentPropsWithoutRef, FormEvent, useState } from 'react'

/**
 * Update Password Form
 *
 * @param props React component props
 * @returns Update password form component
 */
export function UpdatePasswordForm({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  /**
   * Handle update password form submission
   *
   * @param e React form event
   */
  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault()

    const supabase = createClient()

    setIsLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password
      })

      if (updateError) throw updateError

      router.push('/')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="p-0 pb-4 h-full">
        <CardHeader className="px-4 pt-3 pb-0">
          <CardTitle className="text-lg">Reset your password</CardTitle>
          <CardDescription className="text-sm">
            Choose a new password to keep your settlements safe.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleUpdatePassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="New password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  A new ward against the dark.
                </p>
              </div>
              {error && (
                <Alert variant="destructive">
                  <TriangleAlertIcon className="h-4 w-4" aria-hidden="true" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save new password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
