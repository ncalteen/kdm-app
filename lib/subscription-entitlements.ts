import { PlanSlug, UserSubscriptionDetail } from '@/lib/types'

const UNLIMITED_OWNED_SETTLEMENT_PLAN_IDS: ReadonlySet<PlanSlug> = new Set([
  'lantern',
  'lantern_hoard'
])

const VIGNETTE_SHARING_PLAN_IDS: ReadonlySet<PlanSlug> = new Set([
  'lantern_hoard'
])

const ENTITLED_SUBSCRIPTION_STATUSES: ReadonlySet<
  UserSubscriptionDetail['status']
> = new Set(['active', 'trialing'])

/**
 * Can Create Unlimited Settlements
 *
 * Returns true when the current subscription is on a paid settlement tier and
 * still in an entitling Stripe status. Missing, free, canceled, past-due, and
 * incomplete rows all fall back to the free-tier owned-settlement cap.
 *
 * @param subscription User Subscription Detail
 * @returns Whether The User Can Create Unlimited Owned Settlements
 */
export function canCreateUnlimitedSettlements(
  subscription: Pick<UserSubscriptionDetail, 'plan_id' | 'status'> | null
): boolean {
  return (
    !!subscription &&
    ENTITLED_SUBSCRIPTION_STATUSES.has(subscription.status) &&
    UNLIMITED_OWNED_SETTLEMENT_PLAN_IDS.has(subscription.plan_id)
  )
}

/**
 * Can Share Vignette Encounters
 *
 * Returns true when the current subscription is on the Lantern Hoard tier and
 * still in an entitling Stripe status. This mirrors the
 * `can_share_vignette_encounters(target_user_id uuid)` Postgres helper consulted by
 * RLS on `vignette_encounter_shared_user.INSERT`.
 *
 * @param subscription User Subscription Detail
 * @returns Whether The User Can Create Vignette Encounter Shares
 */
export function canShareVignetteEncounters(
  subscription: Pick<UserSubscriptionDetail, 'plan_id' | 'status'> | null
): boolean {
  return (
    !!subscription &&
    ENTITLED_SUBSCRIPTION_STATUSES.has(subscription.status) &&
    VIGNETTE_SHARING_PLAN_IDS.has(subscription.plan_id)
  )
}
