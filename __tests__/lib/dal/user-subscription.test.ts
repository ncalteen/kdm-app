import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the Supabase client module so `getUserId` (imported transitively from
// `@/lib/dal/user`) resolves against this fake client.
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
    signOut: vi.fn()
  },
  from: vi.fn(),
  rpc: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

// Import after mocking so the module picks up the mock.
const { getUserSubscription, startCheckout, openPortal } =
  await import('@/lib/dal/user-subscription')
const { BillingPlanId } = await import('@/schemas/billing-checkout-input')

beforeEach(() => {
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

/**
 * Wire The Supabase Mock For `getUserSubscription`
 *
 * Stubs `auth.getUser`, the `from('user_subscription')` chain, and the
 * `user_can_share` RPC so each test can dial in the exact behavior under
 * inspection.
 */
function configureSubscriptionMock(opts: {
  user?: { id: string } | null
  authError?: { message: string } | null
  subscriptionRow?: {
    plan_id: string
    status: string
    current_period_end: string | null
    cancel_at_period_end?: boolean | null
  } | null
  subscriptionError?: { message: string } | null
  canShare?: boolean
  rpcError?: { message: string } | null
}) {
  const {
    user = { id: 'user-1' },
    authError = null,
    subscriptionRow = null,
    subscriptionError = null,
    canShare = false,
    rpcError = null
  } = opts

  mockSupabase.auth.getUser.mockResolvedValue({
    data: { user },
    error: authError
  })

  const mockMaybeSingle = vi.fn().mockResolvedValue({
    data: subscriptionRow,
    error: subscriptionError
  })
  const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
  mockSupabase.from.mockReturnValue({ select: mockSelect })

  mockSupabase.rpc.mockResolvedValue({ data: canShare, error: rpcError })

  return { mockMaybeSingle, mockEq, mockSelect }
}

describe('getUserSubscription', () => {
  it('returns null when the user has no user_subscription row yet', async () => {
    configureSubscriptionMock({ subscriptionRow: null })

    const result = await getUserSubscription()

    expect(result).toBeNull()
    expect(mockSupabase.from).toHaveBeenCalledWith('user_subscription')
  })

  it('returns the free-plan row with can_share = false', async () => {
    const { mockSelect, mockEq, mockMaybeSingle } = configureSubscriptionMock({
      subscriptionRow: {
        plan_id: 'free',
        status: 'active',
        current_period_end: null,
        cancel_at_period_end: false
      },
      canShare: false
    })

    const result = await getUserSubscription()

    expect(mockSelect).toHaveBeenCalledWith(
      'plan_id, status, current_period_end, cancel_at_period_end'
    )
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(mockMaybeSingle).toHaveBeenCalledOnce()
    expect(mockSupabase.rpc).toHaveBeenCalledWith('user_can_share')
    expect(result).toEqual({
      plan_id: 'free',
      status: 'active',
      current_period_end: null,
      cancel_at_period_end: false,
      can_share: false
    })
  })

  it('returns can_share = true for an active lantern_hoard subscription', async () => {
    configureSubscriptionMock({
      subscriptionRow: {
        plan_id: 'lantern_hoard',
        status: 'active',
        current_period_end: '2027-01-01T00:00:00Z',
        cancel_at_period_end: false
      },
      canShare: true
    })

    const result = await getUserSubscription()

    expect(result).toEqual({
      plan_id: 'lantern_hoard',
      status: 'active',
      current_period_end: '2027-01-01T00:00:00Z',
      cancel_at_period_end: false,
      can_share: true
    })
  })

  it('returns cancel_at_period_end = true when the subscriber has cancelled via the Portal', async () => {
    // Stripe holds the row at `active` until the period actually ends but
    // sets `cancel_at_period_end: true` in the meantime. The DAL must
    // forward the flag so the SubscriptionCard can swap the renewal copy
    // for a "watch ends on …" treatment.
    configureSubscriptionMock({
      subscriptionRow: {
        plan_id: 'lantern',
        status: 'active',
        current_period_end: '2027-01-01T00:00:00Z',
        cancel_at_period_end: true
      },
      canShare: true
    })

    const result = await getUserSubscription()

    expect(result).toEqual({
      plan_id: 'lantern',
      status: 'active',
      current_period_end: '2027-01-01T00:00:00Z',
      cancel_at_period_end: true,
      can_share: true
    })
  })

  it('defaults cancel_at_period_end to false when the column is missing on legacy rows', async () => {
    // Defense in depth: rows seeded before the pending-cancellation
    // migration may surface a `null` payload value if the read races a
    // missed migration. The DAL must coerce so the boolean type contract
    // holds for callers.
    configureSubscriptionMock({
      subscriptionRow: {
        plan_id: 'lantern',
        status: 'active',
        current_period_end: '2027-01-01T00:00:00Z',
        cancel_at_period_end: null
      },
      canShare: true
    })

    const result = await getUserSubscription()

    expect(result?.cancel_at_period_end).toBe(false)
  })

  it('returns can_share = false for a canceled lantern subscription', async () => {
    // `user_can_share` is what decides — `status = canceled` makes the RPC
    // resolve false even though the row still exists. This mirrors the
    // §9.3 "existing shares persist; no new shares" behavior.
    configureSubscriptionMock({
      subscriptionRow: {
        plan_id: 'lantern',
        status: 'canceled',
        current_period_end: '2027-01-01T00:00:00Z',
        cancel_at_period_end: false
      },
      canShare: false
    })

    const result = await getUserSubscription()

    expect(result).toEqual({
      plan_id: 'lantern',
      status: 'canceled',
      current_period_end: '2027-01-01T00:00:00Z',
      cancel_at_period_end: false,
      can_share: false
    })
  })

  it('throws Not Authenticated when no user is present', async () => {
    configureSubscriptionMock({ user: null })

    await expect(getUserSubscription()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
    expect(mockSupabase.rpc).not.toHaveBeenCalled()
  })

  it('throws when the subscription query fails', async () => {
    configureSubscriptionMock({
      subscriptionError: { message: 'connection refused' }
    })

    await expect(getUserSubscription()).rejects.toThrow(
      'Error Fetching User Subscription: connection refused'
    )
  })

  it('throws when the user_can_share RPC fails', async () => {
    configureSubscriptionMock({
      subscriptionRow: {
        plan_id: 'lantern',
        status: 'active',
        current_period_end: '2027-01-01T00:00:00Z',
        cancel_at_period_end: false
      },
      rpcError: { message: 'rpc unavailable' }
    })

    await expect(getUserSubscription()).rejects.toThrow(
      'Error Checking Share Entitlement: rpc unavailable'
    )
  })

  it('treats a non-boolean RPC payload as not entitled', async () => {
    // Defense in depth: even if the RPC returns null/undefined, the gate
    // must default to closed.
    configureSubscriptionMock({
      subscriptionRow: {
        plan_id: 'lantern_hoard',
        status: 'active',
        current_period_end: '2027-01-01T00:00:00Z',
        cancel_at_period_end: false
      },
      canShare: null as unknown as boolean
    })

    const result = await getUserSubscription()

    expect(result?.can_share).toBe(false)
  })

  it('still issues the user_can_share RPC in parallel and ignores its result when the row is missing', async () => {
    // Both reads run in parallel (Promise.all), so the RPC is already in
    // flight by the time we discover the row is missing. We assert it was
    // wired up so a future refactor to sequential reads gets caught — but
    // the helper short-circuits to null without consuming the result.
    configureSubscriptionMock({ subscriptionRow: null })

    const result = await getUserSubscription()

    expect(result).toBeNull()
    expect(mockSupabase.rpc).toHaveBeenCalledWith('user_can_share')
  })
})

describe('startCheckout', () => {
  it('POSTs the planId to /api/billing/checkout and returns the URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ url: 'https://checkout.stripe.com/c/pay/cs_test' })
    })
    vi.stubGlobal('fetch', fetchMock)

    const url = await startCheckout(BillingPlanId.LANTERN_HOARD)

    expect(fetchMock).toHaveBeenCalledWith('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: 'lantern_hoard' })
    })
    expect(url).toBe('https://checkout.stripe.com/c/pay/cs_test')
  })

  it('forwards the lantern plan id alongside lantern_hoard', async () => {
    // Regression guard: the route accepts both paid tiers; the DAL must
    // forward the caller's selection verbatim.
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ url: 'https://checkout.stripe.com/c/pay/cs_test' })
    })
    vi.stubGlobal('fetch', fetchMock)

    await startCheckout(BillingPlanId.LANTERN)

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/billing/checkout',
      expect.objectContaining({
        body: JSON.stringify({ planId: 'lantern' })
      })
    )
  })

  it('throws with the route error message on non-OK responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Unauthorized',
      json: async () => ({ error: 'Not Authenticated' })
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(startCheckout(BillingPlanId.LANTERN)).rejects.toThrow(
      'Error Starting Checkout: Not Authenticated'
    )
  })

  it('falls back to statusText when the error body is not JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Bad Gateway',
      status: 502,
      json: async () => {
        throw new Error('not json')
      }
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(startCheckout(BillingPlanId.LANTERN)).rejects.toThrow(
      'Error Starting Checkout: Bad Gateway'
    )
  })

  it('throws when the response body is missing the URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({})
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(startCheckout(BillingPlanId.LANTERN)).rejects.toThrow(
      'Error Starting Checkout: missing session URL'
    )
  })
})

describe('openPortal', () => {
  it('POSTs to /api/billing/portal and returns the URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ url: 'https://billing.stripe.com/p/session/bps_x' })
    })
    vi.stubGlobal('fetch', fetchMock)

    const url = await openPortal()

    expect(fetchMock).toHaveBeenCalledWith('/api/billing/portal', {
      method: 'POST'
    })
    expect(url).toBe('https://billing.stripe.com/p/session/bps_x')
  })

  it('throws with the route error message on non-OK responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Bad Request',
      json: async () => ({ error: 'No Subscription' })
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(openPortal()).rejects.toThrow(
      'Error Opening Portal: No Subscription'
    )
  })

  it('falls back to a generic message when the error body and statusText are empty', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      statusText: '',
      status: 500,
      json: async () => {
        throw new Error('not json')
      }
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(openPortal()).rejects.toThrow(
      'Error Opening Portal: Request failed (500)'
    )
  })

  it('throws when the response body is missing the URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({})
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(openPortal()).rejects.toThrow(
      'Error Opening Portal: missing session URL'
    )
  })
})
