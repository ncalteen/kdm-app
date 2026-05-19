import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// `@supabase/ssr`'s `createServerClient` is the only collaborator the proxy
// reads auth state from. Stubbing it lets us drive `auth.getClaims()` for
// each scenario without spinning up a real Supabase environment.
const { mockCreateServerClient, mockGetClaims } = vi.hoisted(() => ({
  mockCreateServerClient: vi.fn(),
  mockGetClaims: vi.fn()
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: mockCreateServerClient
}))

import { NextRequest } from 'next/server'

const { updateSession } = await import('@/lib/supabase/proxy')

/**
 * Build A Request
 *
 * The proxy only reads `request.headers`, `request.cookies`, and
 * `request.nextUrl.pathname`. A bare `NextRequest` with the target URL is
 * enough for every scenario in this file.
 *
 * @param pathname Path to attach to the test origin
 * @returns Next Request
 */
function buildRequest(pathname: string): NextRequest {
  return new NextRequest(`https://archivist.test${pathname}`)
}

/**
 * Prime The Supabase Client Mock
 *
 * Wires the hoisted `getClaims` mock onto the fake Supabase client returned
 * by `createServerClient`. Defaults to "no user" (the proxy's redirect
 * condition); pass `userId` to simulate an authenticated session.
 *
 * @param userId Optional Authenticated User ID
 */
function primeSupabase(userId?: string): void {
  mockGetClaims.mockResolvedValue({
    data: userId ? { claims: { sub: userId } } : { claims: null }
  })
  mockCreateServerClient.mockReturnValue({
    auth: { getClaims: mockGetClaims }
  })
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://supabase.test'
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key'
})

afterEach(() => {
  mockCreateServerClient.mockReset()
  mockGetClaims.mockReset()
})

describe('updateSession — HTML navigations', () => {
  it('redirects unauthenticated callers to /auth/login for HTML routes', async () => {
    primeSupabase()

    const response = await updateSession(buildRequest('/settings'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'https://archivist.test/auth/login'
    )
  })

  it('does not redirect the root path when unauthenticated', async () => {
    primeSupabase()

    const response = await updateSession(buildRequest('/'))

    // 200 OK from `NextResponse.next()` — no redirect.
    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
  })

  it('does not redirect /auth/* paths when unauthenticated', async () => {
    primeSupabase()

    const response = await updateSession(buildRequest('/auth/login'))

    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
  })

  it('does not redirect /login* paths when unauthenticated', async () => {
    primeSupabase()

    const response = await updateSession(buildRequest('/login'))

    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
  })

  it('does not redirect authenticated callers on protected routes', async () => {
    primeSupabase('user-1')

    const response = await updateSession(buildRequest('/settings'))

    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
  })
})

describe('updateSession — API routes are exempt from the redirect', () => {
  // Regression: Stripe webhooks are server-to-server requests authenticated
  // via the `stripe-signature` header rather than a Supabase session cookie.
  // The middleware MUST NOT redirect them to /auth/login — Stripe does not
  // follow 3xx responses, so a redirect would cause every delivery to be
  // recorded as a failure and retried until Stripe gave up. The webhook
  // would effectively never run.
  it('does not redirect the Stripe webhook endpoint when unauthenticated', async () => {
    primeSupabase()

    const response = await updateSession(buildRequest('/api/billing/webhook'))

    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
  })

  it('does not redirect /api/billing/checkout when unauthenticated', async () => {
    // The route returns its own `401 { error: 'Not Authenticated' }` JSON —
    // a 307 to /auth/login would corrupt the client contract.
    primeSupabase()

    const response = await updateSession(buildRequest('/api/billing/checkout'))

    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
  })

  it('does not redirect /api/billing/portal when unauthenticated', async () => {
    primeSupabase()

    const response = await updateSession(buildRequest('/api/billing/portal'))

    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
  })

  it('does not redirect any other /api/* path when unauthenticated', async () => {
    // Forward-looking guard: future `/api/*` routes are expected to follow
    // the same self-authenticating pattern. Verifying a generic path keeps
    // the exemption test honest if the prefix is ever tightened back to a
    // specific list.
    primeSupabase()

    const response = await updateSession(buildRequest('/api/some-future-route'))

    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
  })

  it('does not redirect the Vercel Flags discovery endpoint when unauthenticated', async () => {
    // The `/.well-known/vercel/flags` endpoint is signed via the
    // `FLAGS_SECRET` env var rather than a Supabase session cookie. The
    // Vercel Toolbar must be able to reach it from preview deployments and
    // unauthenticated reviewer browsers; a redirect would break override
    // discovery for the feature flag system.
    primeSupabase()

    const response = await updateSession(
      buildRequest('/.well-known/vercel/flags')
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
  })
})
