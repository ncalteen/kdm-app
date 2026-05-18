import 'server-only'

import { ERROR_MESSAGE } from '@/lib/messages'
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
 * Resolve Origin For Redirects
 *
 * Stripe Checkout requires absolute `success_url` and `cancel_url`. Derives
 * the canonical site origin from the incoming request so deployments behind
 * different domains (preview environments, custom domains, localhost) all
 * produce correct redirects without requiring an extra env var.
 *
 * @param request Next Request
 * @returns Origin Including Scheme
 */
function resolveOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto')

  if (forwardedHost) return `${forwardedProto ?? 'https'}://${forwardedHost}`

  return new URL(request.url).origin
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
 *   - Returns 401 when the caller is not signed in.
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
  // 1. Parse + validate body.
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

  // 2. Authenticate the caller.
  const supabase = await createClient()

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user)
    return NextResponse.json({ error: 'Not Authenticated' }, { status: 401 })

  // 3. Look up the caller's subscription row. The default `free` row is
  //    provisioned by sign-up triggers (see migration 20260527000001), so a
  //    missing row indicates a corrupted account that the user should
  //    re-establish before being charged.
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

  // 4. Create + persist a Stripe Customer if this is the user's first paid
  //    session. The service-role client bypasses the owner-only INSERT/UPDATE
  //    policy on `user_subscription`.
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  let customerId = subscription?.stripe_customer_id ?? null

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
      success_url: `${origin}/settings/subscription?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/settings/subscription?status=cancelled`
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
