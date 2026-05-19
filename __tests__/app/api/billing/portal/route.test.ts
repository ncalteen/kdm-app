import { beforeEach, describe, expect, it, vi } from 'vitest'

// Stub `server-only`. Its real module body throws when loaded outside the
// React Server Component bundle, which would block Vitest from importing the
// route under test.
vi.mock('server-only', () => ({}))

// Hoisted mocks must be declared before any imports that wire them up.
const { mockGetUser, mockCreateClient } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockCreateClient: vi.fn()
}))

const { mockAdminFrom, mockCreateAdminClient } = vi.hoisted(() => ({
  mockAdminFrom: vi.fn(),
  mockCreateAdminClient: vi.fn()
}))

const { mockSubscriptionManagementFlag } = vi.hoisted(() => ({
  mockSubscriptionManagementFlag: vi.fn()
}))

const { mockBillingPortalSessionsCreate, MockStripe } = vi.hoisted(() => {
  const portalSessionsCreate = vi.fn()
  class Stripe {
    billingPortal = { sessions: { create: portalSessionsCreate } }
  }
  return {
    mockBillingPortalSessionsCreate: portalSessionsCreate,
    MockStripe: Stripe
  }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: mockCreateAdminClient
}))

vi.mock('stripe', () => ({
  default: MockStripe
}))

vi.mock('@/lib/flags', () => ({
  subscriptionManagementFlag: mockSubscriptionManagementFlag
}))

import { NextRequest } from 'next/server'

const { POST } = await import('@/app/api/billing/portal/route')

/**
 * Build a NextRequest with an optional JSON body that the route can call
 * `.json()` on. The portal route does not actually read a body, but tests
 * still need a real `NextRequest` for header handling.
 */
function buildRequest(headers: Record<string, string> = {}) {
  return new NextRequest('https://archivist.test/api/billing/portal', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers }
  })
}

/**
 * Wire the user-scoped Supabase client mock with the supplied auth state.
 */
function setupAuth(options: {
  user: { id: string; email: string | null } | null
  authError?: { message: string } | null
}) {
  mockGetUser.mockResolvedValue({
    data: { user: options.user },
    error: options.authError ?? null
  })

  mockCreateClient.mockResolvedValue({
    auth: { getUser: mockGetUser }
  })
}

/**
 * Wire the service-role admin Supabase client to capture reads against
 * `user_subscription` and return the supplied row + error state.
 */
function setupAdminLookup(options: {
  subscription?: { stripe_customer_id: string | null } | null
  subscriptionError?: { message: string } | null
}) {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: options.subscription ?? null,
    error: options.subscriptionError ?? null
  })
  const eq = vi.fn().mockReturnValue({ maybeSingle })
  const select = vi.fn().mockReturnValue({ eq })
  mockAdminFrom.mockReturnValue({ select })
  mockCreateAdminClient.mockReturnValue({ from: mockAdminFrom })

  return { select, eq, maybeSingle }
}

describe('POST /api/billing/portal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.STRIPE_SECRET_KEY = 'sk_test_123'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321'
    process.env.SUPABASE_SECRET_KEY = 'service-role-key'
    delete process.env.NEXT_PUBLIC_SITE_URL
    // Default the feature flag to ON so existing tests exercise the
    // post-gate behavior unchanged. Tests in the dedicated flag-gate
    // describe override this explicitly.
    mockSubscriptionManagementFlag.mockResolvedValue(true)
  })

  it('returns 401 when the caller is not authenticated', async () => {
    setupAuth({ user: null })

    const response = await POST(buildRequest())
    const json = await response.json()

    expect(response.status).toBe(401)
    expect(json.error).toBe('Not Authenticated')
    expect(mockCreateAdminClient).not.toHaveBeenCalled()
    expect(mockBillingPortalSessionsCreate).not.toHaveBeenCalled()
  })

  it('returns 401 when supabase reports an auth error', async () => {
    setupAuth({ user: null, authError: { message: 'JWT expired' } })

    const response = await POST(buildRequest())

    expect(response.status).toBe(401)
    expect(mockCreateAdminClient).not.toHaveBeenCalled()
  })

  it('returns 400 "No Subscription" when the user has no user_subscription row', async () => {
    // A missing row means the caller has never had a subscription provisioned
    // (and therefore no Stripe customer). The portal has nothing to manage,
    // so 400 is the correct user-state response.
    setupAuth({ user: { id: 'user-1', email: 'a@b.test' } })
    setupAdminLookup({ subscription: null })

    const response = await POST(buildRequest())
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toBe('No Subscription')
    expect(mockBillingPortalSessionsCreate).not.toHaveBeenCalled()
  })

  it('returns 400 "No Subscription" when stripe_customer_id is null', async () => {
    // The default `free` row exists for every signed-up user but has no
    // Stripe customer until first checkout. Returning 400 here surfaces the
    // upsell path instead of trapping the user with a 500.
    setupAuth({ user: { id: 'user-1', email: 'a@b.test' } })
    setupAdminLookup({ subscription: { stripe_customer_id: null } })

    const response = await POST(buildRequest())
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toBe('No Subscription')
    expect(mockBillingPortalSessionsCreate).not.toHaveBeenCalled()
  })

  it('returns 500 when the subscription lookup fails', async () => {
    setupAuth({ user: { id: 'user-1', email: 'a@b.test' } })
    setupAdminLookup({ subscriptionError: { message: 'rls denied' } })

    const response = await POST(buildRequest())
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.error).toMatch(/darkness/i)
    expect(mockBillingPortalSessionsCreate).not.toHaveBeenCalled()
  })

  it('creates a portal session and returns the URL for an existing subscriber', async () => {
    setupAuth({ user: { id: 'user-1', email: 'survivor@kdm.test' } })
    const { select, eq } = setupAdminLookup({
      subscription: { stripe_customer_id: 'cus_existing' }
    })
    mockBillingPortalSessionsCreate.mockResolvedValue({
      url: 'https://billing.stripe.test/p/session/bps_test_123'
    })

    const response = await POST(buildRequest())
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.url).toBe('https://billing.stripe.test/p/session/bps_test_123')

    // Confirm we read via the service-role admin client and scoped by user.
    expect(mockCreateAdminClient).toHaveBeenCalledTimes(1)
    expect(mockAdminFrom).toHaveBeenCalledWith('user_subscription')
    expect(select).toHaveBeenCalledWith('stripe_customer_id')
    expect(eq).toHaveBeenCalledWith('user_id', 'user-1')

    expect(mockBillingPortalSessionsCreate).toHaveBeenCalledTimes(1)
    const args = mockBillingPortalSessionsCreate.mock.calls[0][0]
    expect(args.customer).toBe('cus_existing')
    expect(args.return_url).toBe('https://archivist.test/')
  })

  it('returns 500 when Stripe rejects the portal session creation request', async () => {
    setupAuth({ user: { id: 'user-1', email: 'a@b.test' } })
    setupAdminLookup({
      subscription: { stripe_customer_id: 'cus_existing' }
    })
    mockBillingPortalSessionsCreate.mockRejectedValue(new Error('Stripe down'))

    const response = await POST(buildRequest())
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.error).toMatch(/darkness/i)
  })

  it('returns 500 when Stripe returns a session without a URL', async () => {
    setupAuth({ user: { id: 'user-1', email: 'a@b.test' } })
    setupAdminLookup({
      subscription: { stripe_customer_id: 'cus_existing' }
    })
    mockBillingPortalSessionsCreate.mockResolvedValue({ url: null })

    const response = await POST(buildRequest())

    expect(response.status).toBe(500)
  })

  it('uses NEXT_PUBLIC_SITE_URL as the canonical return origin when set', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://archivist.example.com'

    setupAuth({ user: { id: 'user-1', email: 'a@b.test' } })
    setupAdminLookup({
      subscription: { stripe_customer_id: 'cus_existing' }
    })
    mockBillingPortalSessionsCreate.mockResolvedValue({
      url: 'https://billing.stripe.test/p/session'
    })

    await POST(buildRequest())

    const args = mockBillingPortalSessionsCreate.mock.calls[0][0]
    expect(args.return_url).toBe('https://archivist.example.com/')
  })

  it('ignores spoofed x-forwarded-host header and falls back to request URL', async () => {
    // Open-redirect class of bugs: a spoofed forwarded-host header must NOT
    // influence the portal return URL. Only NEXT_PUBLIC_SITE_URL or the
    // request URL parsed from the Host header are allowed.
    setupAuth({ user: { id: 'user-1', email: 'a@b.test' } })
    setupAdminLookup({
      subscription: { stripe_customer_id: 'cus_existing' }
    })
    mockBillingPortalSessionsCreate.mockResolvedValue({
      url: 'https://billing.stripe.test/p/session'
    })

    await POST(
      buildRequest({
        'x-forwarded-host': 'evil.example.com',
        'x-forwarded-proto': 'https'
      })
    )

    const args = mockBillingPortalSessionsCreate.mock.calls[0][0]
    expect(args.return_url).toMatch(/^https:\/\/archivist\.test\//)
    expect(args.return_url).not.toContain('evil.example.com')
  })

  it('falls back to the request URL when NEXT_PUBLIC_SITE_URL is malformed', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'not-a-url'

    setupAuth({ user: { id: 'user-1', email: 'a@b.test' } })
    setupAdminLookup({
      subscription: { stripe_customer_id: 'cus_existing' }
    })
    mockBillingPortalSessionsCreate.mockResolvedValue({
      url: 'https://billing.stripe.test/p/session'
    })

    await POST(buildRequest())

    const args = mockBillingPortalSessionsCreate.mock.calls[0][0]
    expect(args.return_url).toMatch(/^https:\/\/archivist\.test\//)
  })

  it('fails closed with a 500 in production when NEXT_PUBLIC_SITE_URL is malformed', async () => {
    // PR #242 review comment r3262472051: production must not silently
    // degrade to the Host-derived request URL when the canonical origin is
    // malformed. Verify the helper's throw is caught by the route's outer
    // try/catch and surfaces as a generic 500 — Stripe must NOT be called.
    const originalNodeEnv = process.env.NODE_ENV
    ;(process.env as Record<string, string | undefined>).NODE_ENV = 'production'
    process.env.NEXT_PUBLIC_SITE_URL = 'https//archivist.monster'

    try {
      setupAuth({ user: { id: 'user-1', email: 'a@b.test' } })
      setupAdminLookup({
        subscription: { stripe_customer_id: 'cus_existing' }
      })

      const response = await POST(buildRequest())
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json.error).toMatch(/darkness/i)
      expect(mockBillingPortalSessionsCreate).not.toHaveBeenCalled()
    } finally {
      ;(process.env as Record<string, string | undefined>).NODE_ENV =
        originalNodeEnv
    }
  })
})

describe('POST /api/billing/portal — subscription-management flag gate', () => {
  // Mirror the contract in `/api/billing/checkout` — the flag is a hard
  // outer gate that runs before auth + Supabase + Stripe, so off-allowlist
  // callers see a 404 indistinguishable from a missing route.
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.STRIPE_SECRET_KEY = 'sk_test_123'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321'
    process.env.SUPABASE_SECRET_KEY = 'service-role-key'
  })

  it('returns 404 when the flag is off, even for authenticated callers', async () => {
    mockSubscriptionManagementFlag.mockResolvedValue(false)
    setupAuth({ user: { id: 'user-1', email: 'survivor@kdm.test' } })

    const response = await POST(buildRequest())
    const json = await response.json()

    expect(response.status).toBe(404)
    expect(json.error).toBe('Not Found')
    expect(mockGetUser).not.toHaveBeenCalled()
    expect(mockCreateAdminClient).not.toHaveBeenCalled()
    expect(mockBillingPortalSessionsCreate).not.toHaveBeenCalled()
  })

  it('returns 404 when the flag is off, even for unauthenticated callers', async () => {
    mockSubscriptionManagementFlag.mockResolvedValue(false)
    setupAuth({ user: null })

    const response = await POST(buildRequest())
    const json = await response.json()

    expect(response.status).toBe(404)
    expect(json.error).toBe('Not Found')
  })
})
