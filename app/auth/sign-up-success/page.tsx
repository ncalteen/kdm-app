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
import { MailCheckIcon } from 'lucide-react'
import Link from 'next/link'

/**
 * Sign-Up Success Page
 *
 * Confirms account creation and prompts the user to check their email for the
 * verification link. Wrapped in the shared `AuthLayout` so the visual language
 * matches every other auth surface.
 *
 * @returns Sign-Up Success Page Component
 */
export default function Page() {
  return (
    <AuthLayout hideHero>
      <Card>
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md border border-border/60 bg-amber-500/10 text-amber-400">
            <MailCheckIcon className="h-5 w-5" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl">A spark has been struck.</CardTitle>
          <CardDescription>
            Check your email to confirm your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent a confirmation link to the address you provided.
            Open it to light your lantern and begin chronicling your settlement.
          </p>
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
