import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

/**
 * Confirm Email Address
 *
 * Handles the redirect from Supabase Auth after email verification. Supabase
 * uses the PKCE flow, so the redirect includes an authorization `code` that
 * must be exchanged for a session.
 *
 * @param request NextRequest containing the authorization code and next URL
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (!code) redirect('/auth/error?error=No authorization code provided')

  const supabase = await createClient()

  // Exchange the PKCE authorization code for a session.
  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError)
    redirect(`/auth/error?error=${encodeURIComponent(exchangeError.message)}`)

  redirect(next)
}
