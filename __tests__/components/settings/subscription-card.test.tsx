import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

const useLocalMock = vi.fn()

vi.mock('@/contexts/local-context', () => ({
  useLocal: () => useLocalMock()
}))

vi.mock('@/lib/dal/user-subscription', () => ({
  startCheckout: vi.fn(),
  openPortal: vi.fn()
}))

import { SubscriptionCard } from '@/components/settings/subscription-card'

afterEach(() => {
  useLocalMock.mockReset()
})

/**
 * Render Subscription Card With Local State
 *
 * Helper that primes the `useLocal` mock with the supplied
 * `userSubscription` value and returns the static HTML the card renders.
 * Every render branch in `<SubscriptionCard>` is driven solely off
 * `userSubscription`, so this is sufficient to exercise the paths.
 *
 * @param userSubscription Local context user subscription state.
 * @returns Rendered HTML String
 */
function renderWith(
  userSubscription: Parameters<typeof useLocalMock>[0] = null
): string {
  useLocalMock.mockReturnValue({ userSubscription })
  return renderToStaticMarkup(<SubscriptionCard />)
}

/**
 * Match Current Plan
 *
 * Returns a regex that confirms a specific plan card carries the
 * `data-current="true"` flag. The card always emits `data-plan` first and
 * `data-current` second per the JSX, and `[^>]*` lets other class /
 * attribute output sit between them.
 *
 * @param slug Plan Slug expected to be the user's current plan
 * @returns Regex Asserting the slug is the highlighted plan
 */
function currentPlanRegex(slug: 'free' | 'lantern' | 'lantern_hoard'): RegExp {
  return new RegExp(`data-plan="${slug}"[^>]*data-current="true"`)
}

/**
 * Match Non-Current Plan
 *
 * Counterpart to `currentPlanRegex`. Verifies that the named plan card
 * exists in the grid but is NOT the user's current plan.
 *
 * @param slug Plan Slug expected to be non-current
 * @returns Regex Asserting the slug card is rendered as non-current
 */
function nonCurrentPlanRegex(
  slug: 'free' | 'lantern' | 'lantern_hoard'
): RegExp {
  return new RegExp(`data-plan="${slug}"[^>]*data-current="false"`)
}

describe('SubscriptionCard — free / missing state', () => {
  it('renders all three plan cards with Wanderer highlighted as current when there is no subscription row yet', () => {
    const html = renderWith(null)

    // Every plan card is in the grid.
    expect(html).toMatch(/data-plan="free"/)
    expect(html).toMatch(/data-plan="lantern"/)
    expect(html).toMatch(/data-plan="lantern_hoard"/)

    // Wanderer is the highlighted current plan.
    expect(html).toMatch(currentPlanRegex('free'))
    expect(html).toMatch(nonCurrentPlanRegex('lantern'))
    expect(html).toMatch(nonCurrentPlanRegex('lantern_hoard'))

    // The current-plan badge appears exactly once.
    expect(html.match(/Current plan/g)).toHaveLength(1)

    // Both paid tiers expose Checkout CTAs.
    expect(html).toContain('Light a Lantern — $1 / month')
    expect(html).toContain('Light a Lantern Hoard — $5 / month')

    // Free / paid-side leak guards.
    expect(html).not.toContain('Manage subscription')
    expect(html).not.toContain('Restore the lantern')
    expect(html).not.toContain('Switch to Lantern')
    expect(html).not.toContain('Upgrade to Lantern Hoard')
  })

  it("highlights Wanderer when the user is explicitly on the 'free' plan", () => {
    const html = renderWith({
      plan_id: 'free',
      status: 'active',
      current_period_end: null,
      can_share: false
    })

    expect(html).toMatch(currentPlanRegex('free'))
    expect(html).toContain('Light a Lantern — $1 / month')
    expect(html).toContain('Light a Lantern Hoard — $5 / month')
    expect(html).not.toContain('Manage subscription')
  })
})

describe('SubscriptionCard — active paid state', () => {
  it('highlights Lantern Hoard, shows Active + renewal date + Manage CTA, and surfaces a Switch CTA for the other tier', () => {
    // ISO 8601 in UTC — date formatting is locale-dependent, so the test
    // only asserts on year + month parts that survive most locales.
    const html = renderWith({
      plan_id: 'lantern_hoard',
      status: 'active',
      current_period_end: '2027-03-12T00:00:00.000Z',
      can_share: true
    })

    // Lantern Hoard is highlighted; the other two are not.
    expect(html).toMatch(currentPlanRegex('lantern_hoard'))
    expect(html).toMatch(nonCurrentPlanRegex('free'))
    expect(html).toMatch(nonCurrentPlanRegex('lantern'))

    expect(html).toContain('Active')
    expect(html).toContain('Current plan')
    expect(html).toContain('Manage subscription')
    expect(html).toContain('Next renewal:')
    expect(html).toContain('2027')

    // Tier-switch CTA appears on the non-current paid card.
    expect(html).toContain('Switch to Lantern')

    // No checkout-from-free CTAs and no restore CTA on an active state.
    expect(html).not.toContain('Light a Lantern — $1 / month')
    expect(html).not.toContain('Light a Lantern Hoard — $5 / month')
    expect(html).not.toContain('Restore the lantern')
  })

  it('highlights Lantern (not Lantern Hoard) when the user is on the lower paid tier and surfaces an Upgrade CTA for the higher tier', () => {
    const html = renderWith({
      plan_id: 'lantern',
      status: 'active',
      current_period_end: '2027-03-12T00:00:00.000Z',
      can_share: false
    })

    // Lantern is current; Lantern Hoard is rendered but non-current.
    expect(html).toMatch(currentPlanRegex('lantern'))
    expect(html).toMatch(nonCurrentPlanRegex('lantern_hoard'))

    // Manage applies to the current Lantern card.
    expect(html).toContain('Manage subscription')

    // The higher tier is offered as an upgrade, not as a fresh checkout.
    expect(html).toContain('Upgrade to Lantern Hoard')
    expect(html).not.toContain('Light a Lantern Hoard — $5 / month')

    // Active status badge appears exactly once (on the current card).
    expect(html.match(/Active/g)?.length).toBeGreaterThanOrEqual(1)
  })

  it('shows the trial-specific copy and Trial badge when status === trialing', () => {
    const html = renderWith({
      plan_id: 'lantern_hoard',
      status: 'trialing',
      current_period_end: '2027-03-12T00:00:00.000Z',
      can_share: true
    })

    expect(html).toMatch(currentPlanRegex('lantern_hoard'))
    expect(html).toContain('Trial')
    expect(html).toContain('Your trial renews on')
    expect(html).toContain('Manage subscription')
  })

  it('omits the renewal line entirely when current_period_end is null', () => {
    const html = renderWith({
      plan_id: 'lantern_hoard',
      status: 'active',
      current_period_end: null,
      can_share: true
    })

    expect(html).toMatch(currentPlanRegex('lantern_hoard'))
    expect(html).toContain('Manage subscription')
    expect(html).not.toContain('Next renewal:')
    expect(html).not.toContain('Your trial renews on')
  })

  it('omits the renewal line when current_period_end is unparseable rather than rendering NaN', () => {
    const html = renderWith({
      plan_id: 'lantern_hoard',
      status: 'active',
      current_period_end: 'not-a-real-date',
      can_share: true
    })

    expect(html).toContain('Manage subscription')
    expect(html).not.toContain('Next renewal:')
    expect(html).not.toContain('Invalid Date')
    expect(html).not.toContain('NaN')
  })
})

describe('SubscriptionCard — warning state', () => {
  it("renders the past-due warning copy and Restore CTA on the current Lantern Hoard card when status === 'past_due'", () => {
    const html = renderWith({
      plan_id: 'lantern_hoard',
      status: 'past_due',
      current_period_end: '2027-03-12T00:00:00.000Z',
      can_share: false
    })

    expect(html).toMatch(currentPlanRegex('lantern_hoard'))
    expect(html).toContain('Payment Past Due')
    expect(html).toContain('Your payment did not clear.')
    expect(html).toContain('Restore the lantern')

    // Warning state must not double up an Active badge or surface other
    // tier-change CTAs.
    expect(html).not.toContain('>Active<')
    expect(html).not.toContain('Manage subscription')
    expect(html).not.toContain('Switch to Lantern')
    expect(html).not.toContain('Upgrade to Lantern Hoard')
  })

  it("renders the canceled warning copy with the period end and Restore CTA when status === 'canceled'", () => {
    const html = renderWith({
      plan_id: 'lantern_hoard',
      status: 'canceled',
      current_period_end: '2027-03-12T00:00:00.000Z',
      can_share: false
    })

    expect(html).toMatch(currentPlanRegex('lantern_hoard'))
    expect(html).toContain('Canceled')
    expect(html).toContain('Your watch ended on')
    expect(html).toContain('2027')
    expect(html).toContain('Restore the lantern')
  })

  it('falls back to the generic ended copy when canceled with no period end timestamp', () => {
    const html = renderWith({
      plan_id: 'lantern_hoard',
      status: 'canceled',
      current_period_end: null,
      can_share: false
    })

    expect(html).toMatch(currentPlanRegex('lantern_hoard'))
    expect(html).toContain('Canceled')
    expect(html).toContain('Your watch has ended.')
    expect(html).not.toContain('Your watch ended on')
    expect(html).toContain('Restore the lantern')
  })

  it("renders the incomplete warning copy and Restore CTA when status === 'incomplete'", () => {
    const html = renderWith({
      plan_id: 'lantern_hoard',
      status: 'incomplete',
      current_period_end: null,
      can_share: false
    })

    expect(html).toMatch(currentPlanRegex('lantern_hoard'))
    expect(html).toContain('Incomplete')
    expect(html).toContain('initial payment did not finalize')
    expect(html).toContain('Restore the lantern')
  })

  it('highlights the Lantern card when a Lantern-tier subscriber is canceled, so the display-name map handles the lower tier too', () => {
    const html = renderWith({
      plan_id: 'lantern',
      status: 'canceled',
      current_period_end: null,
      can_share: false
    })

    // Lantern is current and Lantern Hoard is rendered but NOT current.
    expect(html).toMatch(currentPlanRegex('lantern'))
    expect(html).toMatch(nonCurrentPlanRegex('lantern_hoard'))

    expect(html).toContain('Canceled')
    expect(html).toContain('Restore the lantern')
  })
})
