import 'server-only'

import { AdminAdoptionMetrics } from '@/lib/admin-adoption'
import { ERROR_MESSAGE } from '@/lib/messages'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireSupabaseAdminUser } from '@/lib/supabase/admin-auth'
import { NextResponse } from 'next/server'

/** Force Node Runtime */
export const runtime = 'nodejs'

/**
 * Get Admin Adoption Metrics
 *
 * Returns aggregate adoption metrics from the service-role-only Postgres RPC.
 * The caller must be a verified Archivist app admin.
 *
 * @returns Admin Adoption Metrics JSON Response
 */
export async function GET() {
  const auth = await requireSupabaseAdminUser()
  if (auth.response) return auth.response

  const admin = createAdminClient()

  const { data, error } = await admin.rpc('get_admin_adoption_metrics')

  if (error) {
    console.error('Admin Adoption Metrics Fetch Error:', error)

    return NextResponse.json({ error: ERROR_MESSAGE() }, { status: 500 })
  }

  if (!data) {
    console.error('Admin Adoption Metrics Empty Response')

    return NextResponse.json({ error: ERROR_MESSAGE() }, { status: 500 })
  }

  const response = NextResponse.json({
    metrics: data as unknown as AdminAdoptionMetrics
  })
  response.headers.set('Cache-Control', 'no-store')

  return response
}
