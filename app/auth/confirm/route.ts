import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

/**
 * Confirm Email Address
 *
 * Handles the redirect from Supabase Auth after email verification. Supabase
 * uses the PKCE flow, so the redirect includes an authorization `code` that
 * must be exchanged for a session. After exchanging the code, a user_settings
 * record is created for the newly confirmed user.
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
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) redirect(`/auth/error?error=${error.message}`)

  // Create the user settings entry
  const { error: settingsError } = await supabase.from('user_settings').insert({
    unlocked_killenium_butcher: false,
    unlocked_screaming_nukalope: false,
    unlocked_white_gigalion: false,
    user_id: data.user.id
  })
  if (settingsError) redirect(`/auth/error?error=${settingsError.message}`)

  redirect(next)
}
