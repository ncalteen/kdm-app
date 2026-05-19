'use client'

import { useLocal } from '@/contexts/local-context'
import { getUserSubscription } from '@/lib/dal/user-subscription'
import { TabType } from '@/lib/enums'
import {
  STRIPE_CHECKOUT_CANCELLED_MESSAGE,
  STRIPE_CHECKOUT_SUCCESS_MESSAGE
} from '@/lib/messages'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

/**
 * Stripe Return Status
 *
 * The set of `?status=...` query parameter values the Stripe Checkout
 * redirect contract emits. Anything outside this union is ignored — the
 * hook only acts on the values it issued from the checkout / portal
 * routes.
 */
type StripeReturnStatus = 'success' | 'cancelled'

/**
 * Is Stripe Return Status
 *
 * Narrow predicate so the rest of the hook can treat the captured status
 * as the strict union without an `as` cast.
 *
 * @param value Raw status value
 * @returns Whether the value is a known Stripe return status
 */
function isStripeReturnStatus(
  value: string | null
): value is StripeReturnStatus {
  return value === 'success' || value === 'cancelled'
}

/**
 * Use Stripe Return
 *
 * Handles the `?status=...` query parameter Stripe appends to its hosted
 * Checkout success / cancel URL after the user returns to the SPA. The
 * app has no `/settings/subscription` route — Stripe always returns to
 * `/` — so this hook is the single place that translates those URL
 * params into in-app state.
 *
 * Behavior:
 *
 *   - `?status=success`: switch to the Subscription tab so the user lands
 *     on their newly-purchased plan, surface a thematic success toast,
 *     and re-fetch the cached `user_subscription` row so the highlighted
 *     card updates without a full page refresh. The Stripe webhook is
 *     delivered asynchronously, but typically lands within ~1s — the
 *     SPA has no realtime channel on `user_subscription` yet, so the
 *     refetch is what closes the loop between the hosted checkout and
 *     the in-app cache.
 *   - `?status=cancelled`: surface an info toast acknowledging the user
 *     stepped back from the merchant's tent.
 *   - Always cleans the URL via `router.replace('/')` once the params
 *     have been processed so a browser refresh does not re-trigger the
 *     toast (and so the `?session_id` param Stripe attaches to the
 *     success URL doesn't linger in the address bar).
 *
 * Guarded by a `useRef` so React StrictMode's double-invocation does
 * not fire the side-effects twice. The ref also guards against the
 * re-render that follows `router.replace('/')` flipping the
 * `searchParams` snapshot.
 */
export function useStripeReturn(): void {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setSelectedTab, setUserSubscription, subscriptionManagementEnabled } =
    useLocal()
  const handledRef = useRef(false)

  useEffect(() => {
    if (handledRef.current) return

    const status = searchParams.get('status')
    if (!isStripeReturnStatus(status)) return

    handledRef.current = true

    if (status === 'success') {
      // Defense-in-depth: a user removed from the
      // `subscription-management` allowlist mid-checkout could still
      // bounce back here with `?status=success` — skip the tab switch in
      // that case so they don't land on a Subscription tab that the
      // sidebar no longer exposes and `SettlementCard` no longer
      // renders.
      if (subscriptionManagementEnabled) setSelectedTab(TabType.SUBSCRIPTION)
      toast.success(STRIPE_CHECKOUT_SUCCESS_MESSAGE())

      // Refresh the cached subscription so the new plan highlight
      // appears immediately. The promise is intentionally fire-and-forget
      // — failures are logged but never surfaced because the auth-driven
      // fetch in `LocalContext` will repopulate the cache on the next
      // mount regardless.
      getUserSubscription()
        .then((subscription) => setUserSubscription(subscription))
        .catch((error: unknown) => {
          console.error('Stripe Return Refetch Error:', error)
        })
    } else {
      toast.info(STRIPE_CHECKOUT_CANCELLED_MESSAGE())
    }

    router.replace('/')
  }, [
    searchParams,
    router,
    setSelectedTab,
    setUserSubscription,
    subscriptionManagementEnabled
  ])
}
