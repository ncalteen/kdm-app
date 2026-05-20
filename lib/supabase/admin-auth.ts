import 'server-only'

import { isUserSettingsAdmin } from '@/lib/supabase/admin-role'
import { createClient } from '@/lib/supabase/server'
import { User } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

/**
 * Admin Auth Result
 */
type AdminAuthResult =
  | {
      /** Verified Admin User */
      user: User
      /** Error Response */
      response?: never
    }
  | {
      /** Verified Admin User */
      user?: never
      /** Error Response */
      response: NextResponse
    }

/**
 * Require Supabase Admin User
 *
 * Authenticates the request with the cookie-backed Supabase client and verifies
 * that the caller has Archivist's application admin role on their
 * `user_settings` row.
 *
 * @returns Verified admin user or an HTTP response blocking the request
 */
export async function requireSupabaseAdminUser(): Promise<AdminAuthResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user)
    return {
      response: NextResponse.json(
        { error: 'Not Authenticated' },
        { status: 401 }
      )
    }

  const { data: settings, error: settingsError } = await supabase
    .from('user_settings')
    .select('app_role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (settingsError) {
    console.error('Admin Auth Role Fetch Error:', settingsError)

    return {
      response: NextResponse.json(
        { error: 'Unable to verify admin access' },
        { status: 500 }
      )
    }
  }

  if (!isUserSettingsAdmin(settings))
    return {
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

  return { user }
}
