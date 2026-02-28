import { createClient } from '@/lib/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

/**
 * Confirm the user's email address by verifying the OTP token hash and type.
 * If successful, redirect the user to the specified next URL or root of the
 * app. If unsuccessful, redirect the user to an error page.
 *
 * @param request NextRequest containing the token hash, type, and next URL
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash
    })
    if (!error) redirect(next)
    else redirect(`/auth/error?error=${error?.message}`)
  }

  redirect(`/auth/error?error=No token hash or type`)
}
