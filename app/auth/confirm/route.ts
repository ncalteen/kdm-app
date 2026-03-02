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
  const { data, error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code)
  if (exchangeError)
    redirect(`/auth/error?error=${encodeURIComponent(exchangeError.message)}`)

  // Check if the user settings entry exists already (in case the user hits the
  // confirmation link multiple times). If it does, skip creating a new one.
  const { data: existingSettings, error: fetchError } = await supabase
    .from('user_settings')
    .select('user_id')
    .eq('user_id', data.user.id)
    .single()

  // If the error is not "No rows found", redirect to the error page.
  if (fetchError && fetchError.code !== 'PGRST116')
    redirect(`/auth/error?error=${encodeURIComponent(fetchError.message)}`)

  // If settings already exist, redirect to the next page.
  if (existingSettings) redirect(next)

  // Create the settings for the new user.
  const { error: settingsError } = await supabase.from('user_settings').insert([
    {
      unlocked_killenium_butcher: false,
      unlocked_screaming_nukalope: false,
      unlocked_white_gigalion: false,
      user_id: data.user.id
    }
  ])

  if (settingsError)
    redirect(`/auth/error?error=${encodeURIComponent(settingsError.message)}`)

  redirect(next)
}
