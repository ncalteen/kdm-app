'server-only'

import { Database } from '@/lib/database.types'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Create Supabase Service-Role Client
 *
 * Server-only helper that returns a Supabase client authenticated with the
 * project's secret key. The resulting client bypasses Row Level Security and
 * MUST NOT be imported into any code path that runs in the browser.
 *
 * The default Supabase server client (`@/lib/supabase/server`) uses the
 * publishable key plus the caller's JWT and is the right choice for any
 * request that should be subject to RLS. This helper exists for the narrow
 * set of operations RLS reserves for `service_role` — e.g. the Stripe
 * checkout / webhook handlers writing to `user_subscription`, which is
 * read-only for the owner and write-only for service-role or admin (see
 * migration `20260527000001_user_subscription.sql`).
 *
 * @returns Supabase Service-Role Client
 */
export function createAdminClient(): SupabaseClient<Database> {
  // Throw if imported in a browser environment.
  if (typeof window !== 'undefined')
    throw new Error(
      'createAdminClient must not be called in a browser environment.'
    )

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  )
}
