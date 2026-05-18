import 'server-only'

import { STRIPE_API_VERSION } from '@/lib/common'
import { ERROR_MESSAGE } from '@/lib/messages'
import { resolveOrigin } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import Stripe from 'stripe'

/**
 * Force Node Runtime
 *
 * The Stripe Node SDK is not compatible with the Edge runtime. Pinning to
 * `nodejs` also gives the handler access to `process.env.STRIPE_*` server-only
 * secrets and the Supabase service-role key.
 */
export const runtime = 'nodejs'

/**
 * Create Stripe Customer Portal Session
 *
 * POST handler for `/api/billing/portal`. Authenticated subscribers receive a
 * Stripe Customer Portal URL that lets them manage their subscription — update
 * payment method, view invoices, switch plan, and cancel — without the app
 * re-implementing any of those flows.
 *
 * Behavior:
 *   - Returns 401 when the caller is not signed in.
 *   - Reads `user_subscription` via the service-role admin client to bypass
 *     RLS on the lookup. The "Allow select own" policy would work for the
 *     happy path but the admin client makes this route consistent with the
 *     checkout + webhook handlers and avoids surprises if RLS is tightened.
 *   - Returns 400 ("No Subscription") when the caller has no
 *     `stripe_customer_id` yet — i.e. has never checked out and therefore has
 *     nothing to manage in the portal.
 *   - Creates a `billingPortal.sessions` with a hardened `return_url` and
 *     returns the URL.
 *   - Returns 500 on any Stripe / Supabase failure with a generic message.
 *
 * @param request Next Request
 * @returns JSON Response Containing The Portal Session URL
 */
export async function POST(request: NextRequest) {
  // 1. Authenticate the caller. The portal is account-scoped — unauthenticated
  //    requests must never reach Stripe.
  const supabase = await createClient()

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user)
    return NextResponse.json({ error: 'Not Authenticated' }, { status: 401 })

  // 2. Look up the caller's Stripe customer ID. The admin client bypasses RLS
  //    on `user_subscription` (see migration 20260527000001), matching the
  //    issue's instruction to use a service-role admin client for the read.
  const admin = createAdminClient()

  const { data: subscription, error: subscriptionError } = await admin
    .from('user_subscription')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (subscriptionError) {
    console.error('Stripe Portal Subscription Lookup Error:', subscriptionError)

    return NextResponse.json({ error: ERROR_MESSAGE() }, { status: 500 })
  }

  // 3. A caller without a `stripe_customer_id` has never checked out and has
  //    nothing to manage. Surface 400 rather than 500 — this is a legitimate
  //    user-state error, not a server fault.
  if (!subscription?.stripe_customer_id)
    return NextResponse.json({ error: 'No Subscription' }, { status: 400 })

  // 4. Create the portal session.
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: STRIPE_API_VERSION
  })

  try {
    const origin = resolveOrigin(request)

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      // The app is a SPA — the Customer Portal is always launched from the
      // Subscription tab, and `selectedTab` is persisted in localStorage, so
      // Stripe's return URL just drops the user back at the app root and the
      // SPA restores the Subscription tab automatically. Mirrors the
      // checkout route's redirect contract.
      return_url: `${origin}/`
    })

    if (!session.url) {
      console.error('Stripe Portal Session Error: missing session.url')

      return NextResponse.json({ error: ERROR_MESSAGE() }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe Portal Session Error:', error)

    return NextResponse.json({ error: ERROR_MESSAGE() }, { status: 500 })
  }
}
