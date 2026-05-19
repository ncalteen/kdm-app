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
  const { data, error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError)
    redirect(`/auth/error?error=${encodeURIComponent(exchangeError.message)}`)

  // Backstop: if the sign-up form was unable to call
  // `initialize_user_settings` (e.g., GoTrue returned a 4xx after the
  // auth.users row committed), provision settings now using the username
  // stashed in `raw_user_meta_data` by the sign-up form. The RPC is
  // SECURITY DEFINER with `on conflict (user_id) do nothing`, so this is
  // a no-op when the row already exists.
  const username = (data?.user?.user_metadata as { username?: string } | null)
    ?.username
  if (data?.user?.id && username) {
    const { error: settingsError } = await supabase.rpc(
      'initialize_user_settings',
      { p_user_id: data.user.id, p_username: username }
    )
    if (settingsError)
      console.error('Initialize User Settings Backstop Error:', settingsError)
  }

  redirect(next)
}
