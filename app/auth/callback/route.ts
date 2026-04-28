import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

/**
 * OAuth Callback Route
 *
 * Handles the redirect from Supabase Auth after a social-login flow (e.g.,
 * Discord). Exchanges the PKCE authorization code for a session and then
 * redirects to the requested `next` URL (or the home page).
 *
 * The `user_settings` row for OAuth users is provisioned by the
 * `on_auth_user_created_oauth` database trigger (see migration
 * `20260427000000_handle_new_oauth_user.sql`). No application-level
 * provisioning is required here.
 *
 * @param request NextRequest containing the authorization code and next URL
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/'
  // Only allow relative redirects to prevent open-redirect vulnerabilities.
  const next = rawNext.startsWith('/') ? rawNext : '/'

  if (!code)
    redirect(
      `/auth/error?error=${encodeURIComponent('No authorization code provided')}`
    )

  const supabase = await createClient()

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError)
    redirect(`/auth/error?error=${encodeURIComponent(exchangeError.message)}`)

  redirect(next)
}
