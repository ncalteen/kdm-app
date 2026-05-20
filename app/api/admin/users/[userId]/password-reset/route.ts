import 'server-only'

import { ERROR_MESSAGE } from '@/lib/messages'
import { resolveOrigin } from '@/lib/stripe'
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
 * Send Admin User Password Reset
 *
 * Sends a Supabase Auth password recovery email for the selected user. The
 * caller must be a verified Supabase Auth admin.
 *
 * @param request Next Request
 * @param context Route Context
 * @returns Empty JSON Response
 */
export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireSupabaseAdminUser()
  if (auth.response) return auth.response

  let userId: string

  try {
    userId = AdminUserRouteParamsSchema.parse(await context.params).userId
  } catch (error) {
    console.error('Admin Password Reset Params Error:', error)

    const message =
      error instanceof ZodError ? error.issues[0]?.message : 'Invalid User ID'

    return NextResponse.json({ error: message }, { status: 400 })
  }

  const admin = createAdminClient()

  const {
    data: { user },
    error: userError
  } = await admin.auth.admin.getUserById(userId)

  if (userError || !user) {
    console.error('Admin Password Reset User Lookup Error:', userError)

    return NextResponse.json({ error: 'User Not Found' }, { status: 404 })
  }

  if (!user.email)
    return NextResponse.json(
      { error: 'User does not have an email address.' },
      { status: 400 }
    )

  const { error } = await admin.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${resolveOrigin(request)}/auth/update-password`
  })

  if (error) {
    console.error('Admin Password Reset Email Error:', error)

    return NextResponse.json({ error: ERROR_MESSAGE() }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
