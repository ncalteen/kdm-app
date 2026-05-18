import 'server-only'

import { STRIPE_API_VERSION } from '@/lib/common'
import { Database } from '@/lib/database.types'
import { createAdminClient } from '@/lib/supabase/admin'
import { BillingPlanId } from '@/schemas/billing-checkout-input'
import { SupabaseClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import Stripe from 'stripe'

/**
 * Force Node Runtime
 *
 * The Stripe Node SDK is not compatible with the Edge runtime, and the
 * signature-verification helper needs Node's `crypto` module. Pinning to
 * `nodejs` also gives the handler access to `process.env.STRIPE_*` and the
 * Supabase service-role key.
 */
export const runtime = 'nodejs'

type AdminClient = SupabaseClient<Database>

/**
 * Subscription Status Value
 *
 * The set of values the `user_subscription.status` column accepts. Kept in
 * sync with the CHECK constraint in migration `20260527000001`.
 */
type SubscriptionStatusValue =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete'

/**
 * Subscription Status Map
 *
 * Translates Stripe's `Subscription.Status` enum to the values our column
 * accepts. Statuses outside this set (`incomplete_expired`, `paused`,
 * `unpaid`) are valid in Stripe but have no representation in our schema, so
 * we skip the write rather than emit an unknown value the DB would reject.
 */
const SUBSCRIPTION_STATUS_MAP: Partial<
  Record<Stripe.Subscription.Status, SubscriptionStatusValue>
> = {
  active: 'active',
  trialing: 'trialing',
  past_due: 'past_due',
  canceled: 'canceled',
  incomplete: 'incomplete'
}

/**
 * Resolve Plan From Price ID
 *
 * Inverse of the checkout route's `BillingPlanId` → price ID mapping. Reads
 * the same `STRIPE_PRICE_ID_*` env vars so a single set of price IDs
 * configures both routes. Returns null when the price doesn't match any
 * known paid plan — for example, a future tier added on the Stripe Dashboard
 * before the app is wired to support it.
 *
 * @param priceId Stripe Price ID
 * @returns Billing Plan ID Or Null
 */
function resolvePlanFromPriceId(priceId: string): BillingPlanId | null {
  if (priceId === process.env.STRIPE_PRICE_ID_LANTERN)
    return BillingPlanId.LANTERN

  if (priceId === process.env.STRIPE_PRICE_ID_LANTERN_HOARD)
    return BillingPlanId.LANTERN_HOARD

  return null
}

/**
 * Extract Subscription Current Period End
 *
 * In Stripe API version `2025-04-30.basil` and later, `current_period_end`
 * moved off the Subscription object and onto each Subscription Item (because
 * a single subscription may carry items on different billing cycles). For
 * our single-line subscriptions the first item's value is the source of
 * truth.
 *
 * Returns the value as an ISO timestamp suitable for the `timestamptz`
 * column, or null when the subscription unexpectedly has no items.
 *
 * @param subscription Stripe Subscription
 * @returns ISO Timestamp Or Null
 */
function extractCurrentPeriodEnd(
  subscription: Stripe.Subscription
): string | null {
  const item = subscription.items?.data?.[0]

  if (!item?.current_period_end) return null

  return new Date(item.current_period_end * 1000).toISOString()
}

/**
 * Extract Relation ID
 *
 * Stripe relations are typed as `string | T | null` so callers can opt into
 * expansion. The webhook treats unexpanded string IDs as the canonical form
 * but tolerates expanded objects for the same field.
 *
 * @param value Stripe Relation
 * @returns Resolved ID Or Null
 */
function extractRelationId(
  value: string | { id: string } | null | undefined
): string | null {
  if (!value) return null

  return typeof value === 'string' ? value : value.id
}

/**
 * Resolve User ID From Stripe Customer
 *
 * Subscription events do not always carry the `user_id` metadata set by the
 * checkout route — `customer.subscription.updated` events triggered from the
 * Customer Portal can omit it, and `stripe trigger` fixtures never set it
 * unless explicitly overridden. In those cases we fall back to looking the
 * row up by `stripe_customer_id`, which the checkout route always persists.
 *
 * @param admin Service-Role Supabase Client
 * @param customerId Stripe Customer ID
 * @returns Supabase User ID Or Null
 */
async function resolveUserIdFromCustomer(
  admin: AdminClient,
  customerId: string
): Promise<string | null> {
  const { data, error } = await admin
    .from('user_subscription')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()

  if (error) throw error

  return data?.user_id ?? null
}

/**
 * Handle Checkout Session Completed
 *
 * Provisions a paid subscription row when a Checkout session finalizes.
 * Resolves the caller via `metadata.user_id` (set by the checkout route's
 * `subscription_data` block, and reproducible by `stripe trigger` with
 * `--override "metadata[user_id]=…"`) with a fallback to
 * `client_reference_id` (also set by the checkout route).
 *
 * Retrieves the Subscription so we can capture the price (drives `plan_id`)
 * and per-item `current_period_end`. The upsert is keyed on `user_id`,
 * making redelivery from Stripe idempotent.
 *
 * @param session Stripe Checkout Session
 * @param stripe Stripe Client
 * @param admin Service-Role Supabase Client
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  stripe: Stripe,
  admin: AdminClient
): Promise<void> {
  const userId = session.metadata?.user_id ?? session.client_reference_id

  if (!userId) {
    console.warn(
      'Stripe Webhook Skip: checkout.session.completed missing user_id',
      session.id
    )

    return
  }

  const subscriptionId = extractRelationId(session.subscription)

  if (!subscriptionId) {
    console.warn(
      'Stripe Webhook Skip: checkout.session.completed missing subscription',
      session.id
    )

    return
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  const priceId = subscription.items.data[0]?.price?.id ?? null
  const planId = priceId ? resolvePlanFromPriceId(priceId) : null

  if (!planId) {
    console.warn(
      'Stripe Webhook Skip: checkout.session.completed unknown price',
      subscription.id,
      priceId
    )

    return
  }

  const customerId = extractRelationId(subscription.customer)

  const { error } = await admin.from('user_subscription').upsert(
    {
      user_id: userId,
      plan_id: planId,
      status: 'active',
      current_period_end: extractCurrentPeriodEnd(subscription),
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'user_id' }
  )

  if (error) throw error
}

/**
 * Handle Subscription Updated
 *
 * Reflects in-flight subscription changes back into `user_subscription`.
 * Covers three flavors of update:
 *
 *   - **Status transitions** — renewals, failed payments, reactivations
 *     after past-due. Maps Stripe's status to the column's accepted values.
 *   - **Plan switches** — the Customer Portal lets subscribers move between
 *     Lantern and Lantern Hoard, which arrives as a `subscription.updated`
 *     event with a new price. We re-derive `plan_id` from the active price
 *     on every update so the column doesn't drift after a switch.
 *   - **Period renewals** — `current_period_end` advances each billing
 *     cycle.
 *
 * Falls back to a `stripe_customer_id` lookup when the subscription's
 * `metadata.user_id` is unset (Customer Portal-initiated updates can drop
 * the metadata that the original Checkout flow set).
 *
 * @param subscription Stripe Subscription
 * @param admin Service-Role Supabase Client
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  admin: AdminClient
): Promise<void> {
  const status = SUBSCRIPTION_STATUS_MAP[subscription.status]

  if (!status) {
    console.warn(
      'Stripe Webhook Skip: customer.subscription.updated unmapped status',
      subscription.id,
      subscription.status
    )

    return
  }

  const customerId = extractRelationId(subscription.customer)
  let userId: string | null = subscription.metadata?.user_id ?? null

  if (!userId && customerId)
    userId = await resolveUserIdFromCustomer(admin, customerId)

  if (!userId) {
    console.warn(
      'Stripe Webhook Skip: customer.subscription.updated unable to resolve user',
      subscription.id
    )

    return
  }

  const priceId = subscription.items.data[0]?.price?.id ?? null
  const planId = priceId ? resolvePlanFromPriceId(priceId) : null

  if (!planId) {
    console.warn(
      'Stripe Webhook Skip: customer.subscription.updated unknown price',
      subscription.id,
      priceId
    )

    return
  }

  const { error } = await admin
    .from('user_subscription')
    .update({
      plan_id: planId,
      status,
      current_period_end: extractCurrentPeriodEnd(subscription),
      stripe_subscription_id: subscription.id,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)

  if (error) throw error
}

/**
 * Handle Subscription Deleted
 *
 * Restores the caller to the free tier. Cancellation may arrive from the
 * Customer Portal, a Dashboard action, or end-of-cycle expiry — all of
 * which surface as `customer.subscription.deleted`. We keep the historical
 * `stripe_customer_id` and `stripe_subscription_id` so audits and future
 * re-subscribes have continuity, and only flip the columns the issue
 * scoping document calls out: `plan_id` → `'free'`, `status` → `'canceled'`.
 *
 * @param subscription Stripe Subscription
 * @param admin Service-Role Supabase Client
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  admin: AdminClient
): Promise<void> {
  const customerId = extractRelationId(subscription.customer)
  let userId: string | null = subscription.metadata?.user_id ?? null

  if (!userId && customerId)
    userId = await resolveUserIdFromCustomer(admin, customerId)

  if (!userId) {
    console.warn(
      'Stripe Webhook Skip: customer.subscription.deleted unable to resolve user',
      subscription.id
    )

    return
  }

  const { error } = await admin
    .from('user_subscription')
    .update({
      plan_id: 'free',
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)

  if (error) throw error
}

/**
 * Stripe Webhook Handler
 *
 * POST handler for `/api/billing/webhook`. Stripe POSTs subscription
 * lifecycle events here; we verify the signature against
 * `STRIPE_WEBHOOK_SECRET` and translate the event into the appropriate write
 * against `user_subscription` using the service-role admin client (the
 * webhook is unauthenticated by design — only Stripe can produce a valid
 * signature).
 *
 * Handled events:
 *   - `checkout.session.completed` — upgrade to the purchased plan.
 *   - `customer.subscription.updated` — sync status, period, and plan (the
 *     Customer Portal can switch between Lantern and Lantern Hoard).
 *   - `customer.subscription.deleted` — return to the free tier.
 *
 * Behavior:
 *   - 400 when the `stripe-signature` header is absent, the
 *     `STRIPE_WEBHOOK_SECRET` env var is unset, or the signature fails to
 *     verify.
 *   - 200 on every successfully processed event. Events outside the handled
 *     set are acknowledged silently so Stripe does not retry them.
 *   - 500 on DB / Stripe-API failures during processing so Stripe's retry
 *     queue picks them up.
 *
 * @param request Next Request
 * @returns Empty JSON Response With The Appropriate Status
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !secret) {
    console.error(
      'Stripe Webhook Signature Error: missing signature header or webhook secret'
    )

    return NextResponse.json({ error: 'Invalid Signature' }, { status: 400 })
  }

  // The raw body MUST be read as text — JSON parsing would normalize the
  // payload and invalidate the signature. Next.js App Router does not buffer
  // the body for us, so `request.text()` returns the bytes Stripe signed.
  const rawBody = await request.text()

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: STRIPE_API_VERSION
  })

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret)
  } catch (error) {
    console.error('Stripe Webhook Signature Error:', error)

    return NextResponse.json({ error: 'Invalid Signature' }, { status: 400 })
  }

  try {
    const admin = createAdminClient()

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object, stripe, admin)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, admin)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, admin)
        break

      default:
        // Acknowledged but not handled. Stripe does not retry on 2xx.
        break
    }
  } catch (error) {
    console.error('Stripe Webhook Handler Error:', event.type, error)

    return NextResponse.json({ error: 'Webhook Error' }, { status: 500 })
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
