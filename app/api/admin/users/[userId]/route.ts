import 'server-only'

import { ERROR_MESSAGE } from '@/lib/messages'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireSupabaseAdminUser } from '@/lib/supabase/admin-auth'
import { AdminUserRouteParamsSchema } from '@/schemas/admin-user-route-params'
import { NextResponse, type NextRequest } from 'next/server'
import { ZodError } from 'zod'

/** Force Node Runtime */
export const runtime = 'nodejs'

/** Route Context */
interface RouteContext {
  /** Route Params */
  params: Promise<{ userId: string }>
}

/**
 * Delete Admin User
 *
 * Deletes an Auth user via Supabase's service-role Auth Admin API. The caller
 * must be a verified Supabase Auth admin.
 *
 * @param _request Next Request
 * @param context Route Context
 * @returns Empty JSON Response
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await requireSupabaseAdminUser()
  if (auth.response) return auth.response

  let userId: string

  try {
    userId = AdminUserRouteParamsSchema.parse(await context.params).userId
  } catch (error) {
    console.error('Admin User Delete Params Error:', error)

    const message =
      error instanceof ZodError ? error.issues[0]?.message : 'Invalid User ID'

    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (userId === auth.user.id)
    return NextResponse.json(
      { error: 'An admin cannot delete their own account.' },
      { status: 400 }
    )

  const admin = createAdminClient()

  const { error } = await admin.auth.admin.deleteUser(userId)

  if (error) {
    console.error('Admin User Delete Error:', error)

    return NextResponse.json({ error: ERROR_MESSAGE() }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
