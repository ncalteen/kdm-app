import { describe, expect, it } from 'vitest'

import {
  canCreateUnlimitedSettlements,
  canShareVignetteEncounters
} from '@/lib/subscription-entitlements'
import type { PlanSlug, UserSubscriptionDetail } from '@/lib/types'

function subscription(
  plan_id: PlanSlug,
  status: string
): Pick<UserSubscriptionDetail, 'plan_id' | 'status'> {
  return { plan_id, status }
}

describe('canCreateUnlimitedSettlements', () => {
  it('allows active and trialing paid settlement tiers', () => {
    expect(
      canCreateUnlimitedSettlements(subscription('lantern', 'active'))
    ).toBe(true)
    expect(
      canCreateUnlimitedSettlements(subscription('lantern_hoard', 'trialing'))
    ).toBe(true)
  })

  it('blocks free, missing, and non-entitled settlement statuses', () => {
    expect(canCreateUnlimitedSettlements(subscription('free', 'active'))).toBe(
      false
    )
    expect(
      canCreateUnlimitedSettlements(subscription('lantern', 'past_due'))
    ).toBe(false)
    expect(canCreateUnlimitedSettlements(null)).toBe(false)
  })
})

describe('canShareVignetteEncounters', () => {
  it('allows active and trialing Lantern Hoard subscriptions', () => {
    expect(
      canShareVignetteEncounters(subscription('lantern_hoard', 'active'))
    ).toBe(true)
    expect(
      canShareVignetteEncounters(subscription('lantern_hoard', 'trialing'))
    ).toBe(true)
  })

  it.each([
    ['free', 'active'],
    ['lantern', 'active'],
    ['lantern_hoard', 'canceled'],
    ['lantern_hoard', 'past_due'],
    ['lantern_hoard', 'incomplete']
  ] satisfies [PlanSlug, string][])(
    'blocks %s with %s status',
    (planId, status) => {
      expect(canShareVignetteEncounters(subscription(planId, status))).toBe(
        false
      )
    }
  )

  it('blocks missing subscriptions', () => {
    expect(canShareVignetteEncounters(null)).toBe(false)
  })
})
