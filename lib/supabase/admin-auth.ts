import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { User } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const SUPABASE_ADMIN_AUTH_ROLE = 'admin'

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
 * that the caller's Supabase Auth role is `admin`.
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

  if (user.role !== SUPABASE_ADMIN_AUTH_ROLE)
    return {
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

  return { user }
}
