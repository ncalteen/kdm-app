import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { get as getEdgeConfig } from '@vercel/edge-config'
import { flag } from 'flags/next'

/**
 * Subscription Management Flag Key
 *
 * Single source of truth for the flag's identifier. Mirrors the slug the
 * user creates inside the Vercel dashboard so toolbar overrides and
 * Edge Config keys stay in sync if either side is renamed.
 */
export const SUBSCRIPTION_MANAGEMENT_FLAG_KEY = 'subscription-management'

/**
 * Edge Config Allowlist Key
 *
 * Edge Config object key under which the early-access allowlist is
 * stored. The expected shape is `string[]` — each entry is either a
 * Supabase user ID, a lowercased email address, or the literal string
 * `*` (which opens the flag to every authenticated user).
 *
 * The key lives in the `subscription-management` Edge Config integration
 * that the Vercel dashboard provisions when the flag is created.
 */
const EDGE_CONFIG_ALLOWLIST_KEY = 'subscriptionAllowlist'

/**
 * Subscription Management Flag Entities
 *
 * Identity context the `decide` function evaluates against. Mirrors the
 * minimal slice of the Supabase user the allowlist needs to gate on, and
 * intentionally omits other auth claims so the flag has no incentive to
 * grow beyond its stated purpose.
 *
 * Exported so unit tests can reuse the type without restating it.
 */
export interface SubscriptionManagementEntities {
  /** Supabase Auth User ID */
  id: string
  /** Lowercased Email Address (when present on the auth profile) */
  email: string | null
}

/**
 * Load Subscription Allowlist
 *
 * Edge Config is the canonical source for the allowlist — the Vercel
 * dashboard writes there when a tester is added to the
 * `subscription-management` flag. Falls back to the
 * `SUBSCRIPTION_ALLOWLIST` environment variable (comma-separated) for
 * local development where the Edge Config integration is not wired up;
 * the fallback is intentionally last so production never silently picks
 * up a stale env-var value if Edge Config goes missing.
 *
 * The function tolerates Edge Config failures (network blips, missing
 * key, malformed JSON) by logging and returning an empty list — the
 * flag's `defaultValue: false` then closes the gate, which is the safe
 * direction for a paid-feature toggle.
 *
 * Exported for unit tests.
 *
 * @returns Allowlist Of User IDs / Emails / Wildcards
 */
export async function loadSubscriptionAllowlist(): Promise<string[]> {
  if (process.env.EDGE_CONFIG) {
    try {
      const fromEdgeConfig = await getEdgeConfig<string[]>(
        EDGE_CONFIG_ALLOWLIST_KEY
      )

      if (Array.isArray(fromEdgeConfig)) return fromEdgeConfig
    } catch (error) {
      console.error('Subscription Allowlist Edge Config Error:', error)
    }
  }

  const fromEnv = process.env.SUBSCRIPTION_ALLOWLIST

  if (!fromEnv) return []

  return fromEnv
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
}

/**
 * Identify Subscription Management Caller
 *
 * Reads the Supabase session and returns the minimal entity slice the
 * flag's `decide` callback gates against. Returns `null` when the user
 * is not signed in or Supabase throws — the `decide` callback then
 * collapses to `false`, which keeps the flag closed for unauthenticated
 * traffic.
 *
 * Exported for unit tests so the auth-failure paths can be exercised
 * without going through the Vercel Flags SDK.
 *
 * @returns Entity Identity Or Null When Unidentifiable
 */
export async function identifySubscriptionManagementCaller(): Promise<SubscriptionManagementEntities | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user) return null

    return {
      id: data.user.id,
      email: data.user.email?.toLowerCase() ?? null
    }
  } catch (error) {
    console.error('Subscription Management Flag Identify Error:', error)
    return null
  }
}

/**
 * Decide Subscription Management Flag
 *
 * Evaluates the allowlist for the supplied entity. Order:
 *
 *   1. No entity (unauthenticated, or `identify` threw) → `false`.
 *   2. Empty allowlist → `false`.
 *   3. `*` wildcard → `true`.
 *   4. User ID match → `true`.
 *   5. Lowercased email match → `true`.
 *   6. Otherwise → `false`.
 *
 * Exported for unit tests so each rule can be exercised in isolation
 * without resolving the full SDK pipeline.
 *
 * @param entities Identity returned by {@link identifySubscriptionManagementCaller}
 * @returns Whether The Caller Is Allowed
 */
export async function decideSubscriptionManagementFlag(
  entities: SubscriptionManagementEntities | null
): Promise<boolean> {
  if (!entities) return false

  const allowlist = await loadSubscriptionAllowlist()

  if (allowlist.length === 0) return false
  if (allowlist.includes('*')) return true
  if (allowlist.includes(entities.id)) return true

  if (entities.email !== null && allowlist.includes(entities.email)) return true

  return false
}

/**
 * Subscription Management Flag
 *
 * Gates every billing surface — the Subscription tab, the Sharing tab
 * (which is the actual paid feature), the `/api/billing/checkout` and
 * `/api/billing/portal` route handlers, and the `useStripeReturn`
 * tab-switch fallback — behind an early-access allowlist sourced from
 * Edge Config.
 *
 * Notes:
 *
 *   - The Stripe webhook (`/api/billing/webhook`) is intentionally NOT
 *     gated. Stripe must always be able to reach it so existing
 *     subscriptions continue to track plan / status / period transitions
 *     even if a tester is later removed from the allowlist.
 *   - `defaultValue: false` is the safe direction. Edge Config outages,
 *     missing Supabase sessions, and `decide` throwing all collapse to
 *     "feature off" rather than leaking access to billing surfaces.
 *   - Vercel Toolbar overrides take precedence over `decide` automatically
 *     — devs and QA can force the flag on/off without an allowlist entry.
 *
 * @see {@link https://vercel.com/docs/feature-flags} for the SDK contract.
 */
export const subscriptionManagementFlag = flag<
  boolean,
  SubscriptionManagementEntities | null
>({
  key: SUBSCRIPTION_MANAGEMENT_FLAG_KEY,
  defaultValue: false,
  description:
    'Gates the Subscription tab, the Sharing tab, and the Stripe Checkout / Customer Portal route handlers behind an early-access allowlist.',
  options: [
    { label: 'Off', value: false },
    { label: 'On', value: true }
  ],
  identify: identifySubscriptionManagementCaller,
  decide: ({ entities }) => decideSubscriptionManagementFlag(entities ?? null)
})
