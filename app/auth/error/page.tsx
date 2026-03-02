import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Suspense } from 'react'

/**
 * Error Content
 *
 * This component is responsible for displaying the error message based on the
 * search parameters.
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
    <>
      {params?.error ? (
        <p className="text-sm text-muted-foreground">
          Code error: {params.error}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          An unspecified error occurred.
        </p>
      )}
    </>
  )
}

/**
 * Error Page
 *
 * This page is responsible for displaying the error message when the user is
 * redirected to the error page after a failed email confirmation attempt.
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
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Sorry, something went wrong.
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense>
                <ErrorContent searchParams={searchParams} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
