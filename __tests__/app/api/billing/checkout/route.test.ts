import { beforeEach, describe, expect, it, vi } from 'vitest'

// Stub `server-only`. Its real module body throws when loaded outside the
// React Server Component bundle, which would block Vitest from importing the
// route under test.
vi.mock('server-only', () => ({}))

// Hoisted mocks must be declared before any imports that wire them up.
const { mockGetUser, mockFromSelect, mockFromUpdate, mockCreateClient } =
  vi.hoisted(() => ({
    mockGetUser: vi.fn(),
    mockFromSelect: vi.fn(),
    mockFromUpdate: vi.fn(),
    mockCreateClient: vi.fn()
  }))

const { mockCreateAdminClient } = vi.hoisted(() => ({
  mockCreateAdminClient: vi.fn()
}))

const { mockCustomersCreate, mockCheckoutSessionsCreate, MockStripe } =
  vi.hoisted(() => {
    const customersCreate = vi.fn()
    const sessionsCreate = vi.fn()
    class Stripe {
      customers = { create: customersCreate }
      checkout = { sessions: { create: sessionsCreate } }
    }
    return {
      mockCustomersCreate: customersCreate,
      mockCheckoutSessionsCreate: sessionsCreate,
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

import { NextRequest } from 'next/server'

const { POST } = await import('@/app/api/billing/checkout/route')

/**
 * Build a NextRequest with a JSON body that the route can call `.json()` on.
 */
function buildRequest(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest('https://archivist.test/api/billing/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body)
  })
}

/**
 * Wire the user-scoped Supabase client mock with the supplied auth + row state.
 */
function setupAuth(options: {
  user: { id: string; email: string | null } | null
  authError?: { message: string } | null
  subscription?: { stripe_customer_id: string | null } | null
  subscriptionError?: { message: string } | null
}) {
  mockGetUser.mockResolvedValue({
    data: { user: options.user },
    error: options.authError ?? null
  })

  const maybeSingle = vi.fn().mockResolvedValue({
    data: options.subscription ?? null,
    error: options.subscriptionError ?? null
  })
  const eq = vi.fn().mockReturnValue({ maybeSingle })
  const select = vi.fn().mockReturnValue({ eq })
  mockFromSelect.mockReturnValue({ select })

  mockCreateClient.mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFromSelect
  })
}

/**
 * Wire the service-role Supabase admin client to capture writes to
 * `user_subscription`.
 */
function setupAdminWriter(error: { message: string } | null = null) {
  const eq = vi.fn().mockResolvedValue({ error })
  const update = vi.fn().mockReturnValue({ eq })
  mockFromUpdate.mockReturnValue({ update })
  mockCreateAdminClient.mockReturnValue({ from: mockFromUpdate })
  return { update, eq }
}

describe('POST /api/billing/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.STRIPE_SECRET_KEY = 'sk_test_123'
    process.env.STRIPE_PRICE_ID_LANTERN = 'price_lantern'
    process.env.STRIPE_PRICE_ID_LANTERN_HOARD = 'price_lantern_hoard'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321'
    process.env.SUPABASE_SECRET_KEY = 'service-role-key'
    delete process.env.NEXT_PUBLIC_SITE_URL
  })

  it('returns 401 when the caller is not authenticated', async () => {
    setupAuth({ user: null })

    const response = await POST(buildRequest({ planId: 'lantern' }))
    const json = await response.json()

    expect(response.status).toBe(401)
    expect(json.error).toBe('Not Authenticated')
    expect(mockCustomersCreate).not.toHaveBeenCalled()
    expect(mockCheckoutSessionsCreate).not.toHaveBeenCalled()
  })

  it('returns 401 when supabase reports an auth error', async () => {
    setupAuth({ user: null, authError: { message: 'JWT expired' } })

    const response = await POST(buildRequest({ planId: 'lantern' }))

    expect(response.status).toBe(401)
  })

  it('returns 400 when the body fails Zod validation', async () => {
    setupAuth({ user: { id: 'user-1', email: 'a@b.test' } })

    const response = await POST(buildRequest({ planId: 'free' }))
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toMatch(/lantern/i)
    // Auth runs first — confirm we authenticated before surfacing the
    // validation error so unauthenticated callers can't probe the schema.
    expect(mockGetUser).toHaveBeenCalledTimes(1)
  })

  it('returns 401 (not 400) when an unauthenticated caller posts a malformed body', async () => {
    // 401 must take precedence over 400; otherwise an attacker could probe
    // the request schema via lantern-themed Zod messages without ever
    // signing in.
    setupAuth({ user: null })

    const response = await POST(buildRequest({ planId: 'free' }))
    const json = await response.json()

    expect(response.status).toBe(401)
    expect(json.error).toBe('Not Authenticated')
  })

  it('returns 400 when the body is not valid JSON', async () => {
    setupAuth({ user: { id: 'user-1', email: 'a@b.test' } })

    const request = new NextRequest(
      'https://archivist.test/api/billing/checkout',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: 'not-json'
      }
    )

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('creates a Stripe customer + checkout session for a first-time Lantern subscriber', async () => {
    setupAuth({
      user: { id: 'user-1', email: 'survivor@kdm.test' },
      subscription: { stripe_customer_id: null }
    })
    const { update, eq } = setupAdminWriter()

    mockCustomersCreate.mockResolvedValue({ id: 'cus_new' })
    mockCheckoutSessionsCreate.mockResolvedValue({
      url: 'https://checkout.stripe.test/session/cs_test_123'
    })

    const response = await POST(buildRequest({ planId: 'lantern' }))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.url).toBe('https://checkout.stripe.test/session/cs_test_123')

    expect(mockCustomersCreate).toHaveBeenCalledWith({
      email: 'survivor@kdm.test',
      metadata: { user_id: 'user-1' }
    })

    expect(update).toHaveBeenCalledWith({ stripe_customer_id: 'cus_new' })
    expect(eq).toHaveBeenCalledWith('user_id', 'user-1')

    expect(mockCheckoutSessionsCreate).toHaveBeenCalledTimes(1)
    const args = mockCheckoutSessionsCreate.mock.calls[0][0]
    expect(args.mode).toBe('subscription')
    expect(args.customer).toBe('cus_new')
    expect(args.client_reference_id).toBe('user-1')
    expect(args.line_items).toEqual([{ price: 'price_lantern', quantity: 1 }])
    expect(args.subscription_data).toEqual({
      metadata: { user_id: 'user-1' }
    })
    expect(args.success_url).toContain('/settings/subscription?status=success')
    expect(args.cancel_url).toContain('/settings/subscription?status=cancelled')
  })

  it('reuses an existing Stripe customer for the Lantern Hoard plan', async () => {
    setupAuth({
      user: { id: 'user-2', email: 'returning@kdm.test' },
      subscription: { stripe_customer_id: 'cus_existing' }
    })
    setupAdminWriter()

    mockCheckoutSessionsCreate.mockResolvedValue({
      url: 'https://checkout.stripe.test/session/cs_test_456'
    })

    const response = await POST(buildRequest({ planId: 'lantern_hoard' }))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.url).toBe('https://checkout.stripe.test/session/cs_test_456')

    expect(mockCustomersCreate).not.toHaveBeenCalled()

    const args = mockCheckoutSessionsCreate.mock.calls[0][0]
    expect(args.customer).toBe('cus_existing')
    expect(args.line_items).toEqual([
      { price: 'price_lantern_hoard', quantity: 1 }
    ])
  })

  it('returns 500 when the subscription lookup fails', async () => {
    setupAuth({
      user: { id: 'user-1', email: 'a@b.test' },
      subscriptionError: { message: 'rls denied' }
    })

    const response = await POST(buildRequest({ planId: 'lantern' }))

    expect(response.status).toBe(500)
    expect(mockCheckoutSessionsCreate).not.toHaveBeenCalled()
  })

  it('returns 500 when no user_subscription row exists for the user', async () => {
    // The default `free` row is auto-provisioned at sign-up; absence here
    // signals a corrupted account. The route must refuse to proceed,
    // otherwise the admin UPDATE below would silently match zero rows and
    // strand a Stripe customer that the webhook cannot correlate back.
    setupAuth({
      user: { id: 'user-1', email: 'a@b.test' },
      subscription: null
    })

    const response = await POST(buildRequest({ planId: 'lantern' }))

    expect(response.status).toBe(500)
    expect(mockCustomersCreate).not.toHaveBeenCalled()
    expect(mockCheckoutSessionsCreate).not.toHaveBeenCalled()
  })

  it('returns 500 when persisting the new Stripe customer fails', async () => {
    setupAuth({
      user: { id: 'user-1', email: 'a@b.test' },
      subscription: { stripe_customer_id: null }
    })
    setupAdminWriter({ message: 'rls write blocked' })
    mockCustomersCreate.mockResolvedValue({ id: 'cus_new' })

    const response = await POST(buildRequest({ planId: 'lantern' }))

    expect(response.status).toBe(500)
    expect(mockCheckoutSessionsCreate).not.toHaveBeenCalled()
  })

  it('returns 500 when Stripe rejects the session creation request', async () => {
    setupAuth({
      user: { id: 'user-1', email: 'a@b.test' },
      subscription: { stripe_customer_id: 'cus_existing' }
    })
    setupAdminWriter()
    mockCheckoutSessionsCreate.mockRejectedValue(new Error('Stripe down'))

    const response = await POST(buildRequest({ planId: 'lantern' }))
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.error).toMatch(/darkness/i)
  })

  it('returns 500 when Stripe returns a session without a URL', async () => {
    setupAuth({
      user: { id: 'user-1', email: 'a@b.test' },
      subscription: { stripe_customer_id: 'cus_existing' }
    })
    setupAdminWriter()
    mockCheckoutSessionsCreate.mockResolvedValue({ url: null })

    const response = await POST(buildRequest({ planId: 'lantern' }))

    expect(response.status).toBe(500)
  })

  it('returns 500 when the Lantern price ID env var is missing', async () => {
    delete process.env.STRIPE_PRICE_ID_LANTERN
    setupAuth({
      user: { id: 'user-1', email: 'a@b.test' },
      subscription: { stripe_customer_id: 'cus_existing' }
    })
    setupAdminWriter()

    const response = await POST(buildRequest({ planId: 'lantern' }))

    expect(response.status).toBe(500)
    expect(mockCheckoutSessionsCreate).not.toHaveBeenCalled()
  })

  it('uses NEXT_PUBLIC_SITE_URL as the canonical redirect origin when set', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://archivist.example.com'

    setupAuth({
      user: { id: 'user-1', email: 'a@b.test' },
      subscription: { stripe_customer_id: 'cus_existing' }
    })
    setupAdminWriter()
    mockCheckoutSessionsCreate.mockResolvedValue({
      url: 'https://stripe.test/session'
    })

    await POST(buildRequest({ planId: 'lantern' }))

    const args = mockCheckoutSessionsCreate.mock.calls[0][0]
    expect(args.success_url).toMatch(/^https:\/\/archivist\.example\.com\//)
    expect(args.cancel_url).toMatch(/^https:\/\/archivist\.example\.com\//)
  })

  it('ignores spoofed x-forwarded-host header and falls back to request URL', async () => {
    // Stripe Checkout success_url is attacker-influenceable if the route
    // trusts forwarded-host headers on direct ingress. The hardened
    // resolveOrigin must NOT honor them — only NEXT_PUBLIC_SITE_URL or the
    // request URL parsed from the Host header are allowed.
    setupAuth({
      user: { id: 'user-1', email: 'a@b.test' },
      subscription: { stripe_customer_id: 'cus_existing' }
    })
    setupAdminWriter()
    mockCheckoutSessionsCreate.mockResolvedValue({
      url: 'https://stripe.test/session'
    })

    await POST(
      buildRequest(
        { planId: 'lantern' },
        {
          'x-forwarded-host': 'evil.example.com',
          'x-forwarded-proto': 'https'
        }
      )
    )

    const args = mockCheckoutSessionsCreate.mock.calls[0][0]
    expect(args.success_url).toMatch(/^https:\/\/archivist\.test\//)
    expect(args.cancel_url).toMatch(/^https:\/\/archivist\.test\//)
    expect(args.success_url).not.toContain('evil.example.com')
    expect(args.cancel_url).not.toContain('evil.example.com')
  })

  it('falls back to the request URL when NEXT_PUBLIC_SITE_URL is malformed', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'not-a-url'

    setupAuth({
      user: { id: 'user-1', email: 'a@b.test' },
      subscription: { stripe_customer_id: 'cus_existing' }
    })
    setupAdminWriter()
    mockCheckoutSessionsCreate.mockResolvedValue({
      url: 'https://stripe.test/session'
    })

    await POST(buildRequest({ planId: 'lantern' }))

    const args = mockCheckoutSessionsCreate.mock.calls[0][0]
    expect(args.success_url).toMatch(/^https:\/\/archivist\.test\//)
  })
})
