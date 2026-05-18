import { getUserId } from '@/lib/dal/user'
import { createClient } from '@/lib/supabase/client'
import { UserSubscriptionDetail } from '@/lib/types'
import { BillingPlanId } from '@/schemas/billing-checkout-input'

/**
 * Get User Subscription
 *
 * Fetches the authenticated user's row from `user_subscription` and resolves
 * the share-entitlement flag via the `user_can_share()` RPC. Returning
 * `can_share` from the server keeps the paid-feature gating decision in
 * Postgres — the same predicate the RLS policy on
 * `settlement_shared_user.INSERT` consults — so the UI and the database can
 * never disagree about who may share.
 *
 * The two reads are issued in parallel: the `user_subscription` row carries
 * plan/status/period metadata for display, and the RPC carries the boolean
 * entitlement. A `null` return indicates the caller has no subscription row
 * yet (e.g. a brand-new user racing the sign-up trigger that seeds the
 * default `free` row).
 *
 * @returns User Subscription Detail, or null when no subscription row exists
 * for the authenticated user.
 * @throws If the caller is not authenticated, or either underlying query
 * fails.
 */
export async function getUserSubscription(): Promise<UserSubscriptionDetail | null> {
  const userId = await getUserId()
  const supabase = createClient()

  const [subscriptionResult, canShareResult] = await Promise.all([
    supabase
      .from('user_subscription')
      .select('plan_id, status, current_period_end, cancel_at_period_end')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase.rpc('user_can_share')
  ])

  if (subscriptionResult.error)
    throw new Error(
      `Error Fetching User Subscription: ${subscriptionResult.error.message}`
    )

  if (!subscriptionResult.data) return null

  if (canShareResult.error)
    throw new Error(
      `Error Checking Share Entitlement: ${canShareResult.error.message}`
    )

  return {
    plan_id: subscriptionResult.data.plan_id,
    status: subscriptionResult.data.status,
    current_period_end: subscriptionResult.data.current_period_end,
    // The column is `not null default false`, but older rows surfaced via
    // the Stripe webhook before this column existed can briefly look like
    // `null` if reads race a missed migration; coerce defensively so the
    // boolean type contract holds for callers.
    cancel_at_period_end: subscriptionResult.data.cancel_at_period_end === true,
    can_share: canShareResult.data === true
  }
}

/**
 * Start Stripe Checkout
 *
 * POSTs to `/api/billing/checkout` to create a Stripe-hosted Checkout
 * session for the specified paid plan and returns the hosted URL the caller
 * should redirect the browser to. The app deliberately does not implement
 * its own billing surface — plan selection happens on Stripe Checkout.
 *
 * Multiple paid tiers (`lantern`, `lantern_hoard`) are validated server-side
 * by `BillingCheckoutInputSchema`; the DAL just forwards the user's
 * selection so call sites do not have to hand-roll the fetch.
 *
 * @param planId Target paid subscription plan (`free` is not a valid
 * Checkout target — downgrades flow through the Customer Portal).
 * @returns Stripe Checkout session URL.
 * @throws If the request fails or the response body is malformed.
 */
export async function startCheckout(planId: BillingPlanId): Promise<string> {
  const response = await fetch('/api/billing/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId })
  })

  if (!response.ok) {
    const message = await extractErrorMessage(response)

    throw new Error(`Error Starting Checkout: ${message}`)
  }

  const body = (await response.json()) as { url?: string }

  if (!body.url) throw new Error('Error Starting Checkout: missing session URL')

  return body.url
}

/**
 * Open Stripe Customer Portal
 *
 * POSTs to `/api/billing/portal` to create a Stripe-hosted Customer Portal
 * session for the authenticated user and returns the hosted URL the caller
 * should redirect the browser to. All subscription self-service (payment
 * method, invoices, plan switch, cancel) happens on Stripe's hosted UI; the
 * app intentionally does not implement its own billing surface.
 *
 * @returns Stripe Customer Portal session URL.
 * @throws If the request fails or the response body is malformed.
 */
export async function openPortal(): Promise<string> {
  const response = await fetch('/api/billing/portal', { method: 'POST' })

  if (!response.ok) {
    const message = await extractErrorMessage(response)

    throw new Error(`Error Opening Portal: ${message}`)
  }

  const body = (await response.json()) as { url?: string }

  if (!body.url) throw new Error('Error Opening Portal: missing session URL')

  return body.url
}

/**
 * Extract Error Message
 *
 * Pulls a human-readable message out of an error JSON body returned by the
 * billing routes. Falls back to the HTTP status text when the body cannot
 * be parsed (e.g. an upstream proxy returned text/html).
 *
 * @param response Non-OK Fetch Response.
 * @returns Error Message.
 */
async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string }

    if (body.error) return body.error
  } catch {
    // Body was not valid JSON — fall through to statusText.
  }

  return response.statusText || `Request failed (${response.status})`
}
