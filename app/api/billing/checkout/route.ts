import 'server-only'

import { STRIPE_API_VERSION } from '@/lib/common'
import { subscriptionManagementFlag } from '@/lib/flags'
import { ERROR_MESSAGE } from '@/lib/messages'
import { resolveOrigin } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import {
  BillingCheckoutInputSchema,
  BillingPlanId
} from '@/schemas/billing-checkout-input'
import { NextResponse, type NextRequest } from 'next/server'
import Stripe from 'stripe'
import { ZodError } from 'zod'

/**
 * Force Node Runtime
 *
 * The Stripe Node SDK is not compatible with the Edge runtime. Pinning to
 * `nodejs` also gives the handler access to `process.env.STRIPE_*` server-only
 * secrets and the Supabase service-role key.
 */
export const runtime = 'nodejs'

/**
 * Resolve Price ID For Plan
 *
 * Maps a validated `BillingPlanId` to the corresponding `STRIPE_PRICE_ID_*`
 * environment variable. Throws if the env var is missing so misconfigured
 * deployments surface a clear error instead of asking Stripe to create a
 * session against an empty price ID.
 *
 * @param planId Billing Plan ID
 * @returns Stripe Price ID
 */
function resolvePriceId(planId: BillingPlanId): string {
  const priceId =
    planId === BillingPlanId.LANTERN
      ? process.env.STRIPE_PRICE_ID_LANTERN
      : process.env.STRIPE_PRICE_ID_LANTERN_HOARD

  if (!priceId)
    throw new Error(
      `Missing price ID env var for plan "${planId}". See docs/stripe-setup.md.`
    )

  return priceId
}

/**
 * Create Stripe Checkout Session
 *
 * POST handler for `/api/billing/checkout`. Authenticated callers receive a
 * Stripe Checkout URL that, on successful payment, upgrades them to a supported
 * plan.
 *
 * Request body: `{ planId: 'lantern' | 'lantern_hoard' }`.
 *
 * Behavior:
 *   - Returns 401 when the caller is not signed in (checked before any body
 *     parsing so the request schema is not leaked to unauthenticated callers).
 *   - Returns 400 when the body fails Zod validation.
 *   - Looks up the caller's `user_subscription` row; if it lacks a
 *     `stripe_customer_id`, creates a Stripe Customer keyed by the Supabase
 *     user ID and persists the new ID via the service-role client (RLS
 *     reserves writes on `user_subscription` for service-role or admin).
 *   - Creates a subscription-mode Checkout session for the selected price.
 *   - Returns 500 on any Stripe / Supabase failure with a generic message.
 *
 * @param request Next Request
 * @returns JSON Response Containing The Checkout Session URL
 */
export async function POST(request: NextRequest) {
  // 0. Gate the entire surface behind the `subscription-management` feature
  //    flag. The early-access allowlist lives in Vercel Edge Config. Off-
  //    allowlist callers receive a 404 — not a 401 or 403 — so the route's
  //    existence is not advertised to unprivileged users while the rollout
  //    is in progress. Defense-in-depth: the Subscription tab in the UI is
  //    gated by the same flag, but a determined caller could hit this
  //    endpoint directly. The webhook (`/api/billing/webhook`) is NOT gated
  //    so Stripe can keep syncing existing subscriptions even if a tester
  //    is later removed from the allowlist.
  if (!(await subscriptionManagementFlag()))
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })

  // 1. Authenticate the caller first — unauthenticated requests must not be
  //    able to probe the request schema via 400 responses.
  const supabase = await createClient()

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user)
    return NextResponse.json({ error: 'Not Authenticated' }, { status: 401 })

  // 2. Parse + validate body.
  let planId: BillingPlanId

  try {
    const json = await request.json()

    planId = BillingCheckoutInputSchema.parse(json).planId
  } catch (error) {
    console.error('Stripe Checkout Input Error:', error)

    const message =
      error instanceof ZodError ? error.issues[0]?.message : ERROR_MESSAGE()

    return NextResponse.json(
      { error: message ?? 'Invalid Request Body' },
      { status: 400 }
    )
  }

  // 3. Look up the caller's subscription row. The default `free` row is
  //    provisioned by sign-up triggers (see migration 20260527000001), so a
  //    missing row indicates a corrupted account that must be repaired before
  //    the user can be charged. We refuse to proceed in that case — otherwise
  //    the admin `UPDATE` below would silently match zero rows, creating an
  //    orphaned Stripe customer the webhook cannot correlate.
  const { data: subscription, error: subscriptionError } = await supabase
    .from('user_subscription')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (subscriptionError) {
    console.error(
      'Stripe Checkout Subscription Lookup Error:',
      subscriptionError
    )

    return NextResponse.json({ error: ERROR_MESSAGE() }, { status: 500 })
  }

  if (!subscription) {
    console.error(
      'Stripe Checkout Subscription Missing Error: no user_subscription row for user',
      user.id
    )

    return NextResponse.json({ error: ERROR_MESSAGE() }, { status: 500 })
  }

  // 4. Create + persist a Stripe Customer if this is the user's first paid
  //    session. The service-role client bypasses the owner-only INSERT/UPDATE
  //    policy on `user_subscription`.
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: STRIPE_API_VERSION
  })

  let customerId = subscription.stripe_customer_id

  try {
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { user_id: user.id }
      })

      customerId = customer.id

      const admin = createAdminClient()

      const { error: updateError } = await admin
        .from('user_subscription')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Stripe Checkout Customer Persist Error:', updateError)

        return NextResponse.json({ error: ERROR_MESSAGE() }, { status: 500 })
      }
    }

    // 5. Create the Checkout session.
    const origin = resolveOrigin(request)

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: resolvePriceId(planId), quantity: 1 }],
      subscription_data: {
        metadata: { user_id: user.id }
      },
      allow_promotion_codes: false,
      // The app is a SPA: the user only launches Checkout from the
      // Subscription tab, and `selectedTab` is persisted in localStorage, so
      // Stripe's return URL just lands them back at the app root and the
      // SPA restores the Subscription tab automatically. The `status` and
      // `session_id` query params are kept for audit / future telemetry use.
      success_url: `${origin}/?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?status=cancelled`
    })

    if (!session.url) {
      console.error('Stripe Checkout Session Error: missing session.url')

      return NextResponse.json({ error: ERROR_MESSAGE() }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe Checkout Session Error:', error)

    return NextResponse.json({ error: ERROR_MESSAGE() }, { status: 500 })
  }
}
