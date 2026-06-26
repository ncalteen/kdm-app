import { Database } from '@/lib/database.types'
import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Module-Level Supabase Browser Client Singleton
 *
 * `createBrowserClient` boots realtime channels and internal auth state per
 * instance, so creating one per DAL call wastes memory and produces
 * inconsistent auth listeners across the app. We memoize a single client for
 * the lifetime of the browser tab.
 *
 * Note: `createBrowserClient` itself is already designed to be called at
 * module scope safely in app code — this wrapper just centralizes the
 * instance.
 */
let client: SupabaseClient<Database> | null = null

/**
 * Get the Shared Supabase Browser Client
 *
 * @returns Shared Supabase Client
 */
export function createClient(): SupabaseClient<Database> {
  if (client) return client

  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  return client
}
