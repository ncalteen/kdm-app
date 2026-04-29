import { AuthLayout } from '@/components/auth/auth-layout'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { ERROR_MESSAGE } from '@/lib/messages'
import { TriangleAlertIcon } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

/**
 * Error Content
 *
 * Resolves the optional `error` search param and renders either the underlying
 * code or a fallback message. Wrapped in `Suspense` by the page so server
 * rendering can stream while the params promise resolves.
 *
 * @param props Error Content Properties
 * @returns Error Content Component
 */
async function ErrorContent({
  searchParams
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <p className="text-sm text-muted-foreground">
      {params?.error
        ? `Code error: ${params.error}`
        : 'An unspecified error occurred.'}
    </p>
  )
}

/**
 * Error Page
 *
 * Displayed when an authentication flow (typically email confirmation) fails.
 * Uses the shared `AuthLayout` so the failure surface matches the rest of the
 * auth flow visually, and offers a single, clear path back to login.
 *
 * @param props Error Page Properties
 * @returns Error Page Component
 */
export default function Page({
  searchParams
}: {
  searchParams: Promise<{ error: string }>
}) {
  return (
    <AuthLayout hideHero>
      <Card>
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md border border-destructive/40 bg-destructive/10 text-destructive">
            <TriangleAlertIcon className="h-5 w-5" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl">{ERROR_MESSAGE()}</CardTitle>
          <CardDescription>
            The lantern flickered. Try again, or return to safer ground.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <p className="text-sm text-muted-foreground">
                Reading the omens…
              </p>
            }>
            <ErrorContent searchParams={searchParams} />
          </Suspense>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/login">Return to login</Link>
          </Button>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
