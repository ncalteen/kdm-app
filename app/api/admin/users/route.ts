import 'server-only'

import { AdminUserListEntry } from '@/lib/admin-users'
import { ERROR_MESSAGE } from '@/lib/messages'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireSupabaseAdminUser } from '@/lib/supabase/admin-auth'
import { User } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

/** Force Node Runtime */
export const runtime = 'nodejs'

const USERS_PER_PAGE = 1000

/**
 * Read Auth Providers
 *
 * Extracts a normalized provider list from Supabase Auth app metadata.
 *
 * @param user Supabase Auth User
 * @returns Provider Names
 */
function readAuthProviders(user: User): string[] {
  const providers = user.app_metadata?.providers

  if (Array.isArray(providers))
    return providers.filter(
      (provider): provider is string => typeof provider === 'string'
    )

  const provider = user.app_metadata?.provider

  return typeof provider === 'string' ? [provider] : []
}

/**
 * Map Auth User
 *
 * Converts a Supabase Auth user into the client-safe user management shape.
 *
 * @param user Supabase Auth User
 * @param appRole Application Role
 * @returns Admin User List Entry
 */
function mapAuthUser(
  user: User,
  appRole: string | null | undefined
): AdminUserListEntry {
  return {
    id: user.id,
    email: user.email ?? null,
    phone: user.phone ?? null,
    role: user.role ?? null,
    app_role: appRole ?? null,
    providers: readAuthProviders(user),
    created_at: user.created_at ?? null,
    last_sign_in_at: user.last_sign_in_at ?? null,
    email_confirmed_at: user.email_confirmed_at ?? null,
    banned_until: user.banned_until ?? null
  }
}

/**
 * Get Admin Users
 *
 * Returns Auth users from `auth.users` via Supabase's service-role Auth Admin
 * API. The caller must be a verified Supabase Auth admin.
 *
 * @returns Admin Users JSON Response
 */
export async function GET() {
  const auth = await requireSupabaseAdminUser()
  if (auth.response) return auth.response

  const admin = createAdminClient()

  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: USERS_PER_PAGE
  })

  if (error) {
    console.error('Admin Users Fetch Error:', error)

    return NextResponse.json({ error: ERROR_MESSAGE() }, { status: 500 })
  }

  const userIds = data.users.map((user) => user.id)

  if (userIds.length === 0) return NextResponse.json({ users: [] })

  const { data: settingsRows, error: settingsError } = await admin
    .from('user_settings')
    .select('user_id, app_role')
    .in('user_id', userIds)

  if (settingsError) {
    console.error('Admin User Settings Role Fetch Error:', settingsError)

    return NextResponse.json({ error: ERROR_MESSAGE() }, { status: 500 })
  }

  const appRoles = new Map(
    (settingsRows ?? []).map((settings) => [
      settings.user_id,
      settings.app_role
    ])
  )

  return NextResponse.json({
    users: data.users.map((user) => mapAuthUser(user, appRoles.get(user.id)))
  })
}
