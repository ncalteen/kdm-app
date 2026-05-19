import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Stub `server-only` — its real module body throws when loaded outside the
// React Server Component bundle.
vi.mock('server-only', () => ({}))

// Hoisted mocks. Both Supabase and Edge Config are I/O-heavy, so they are
// fully stubbed.
const { mockGetUser, mockCreateClient } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockCreateClient: vi.fn()
}))

const { mockEdgeConfigGet } = vi.hoisted(() => ({
  mockEdgeConfigGet: vi.fn()
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient
}))

vi.mock('@vercel/edge-config', () => ({
  get: mockEdgeConfigGet
}))

// `flags/next`'s `flag()` reads request-scoped headers/cookies on import in
// some code paths. Stub it to a passthrough so the module under test can be
// loaded outside a request. We only test the exported `identify` /
// `decide` helpers directly, never the SDK-wrapped callable.
vi.mock('flags/next', () => ({
  flag: (definition: unknown) => definition
}))

const {
  decideSubscriptionManagementFlag,
  identifySubscriptionManagementCaller,
  loadSubscriptionAllowlist,
  SUBSCRIPTION_MANAGEMENT_FLAG_KEY
} = await import('@/lib/flags')

describe('subscription-management flag key', () => {
  // The slug must match the literal string the operator types into the
  // Vercel dashboard. Locking it here so a rename of the constant cannot
  // silently desync from the dashboard.
  it('matches the canonical Vercel flag slug', () => {
    expect(SUBSCRIPTION_MANAGEMENT_FLAG_KEY).toBe('subscription-management')
  })
})

describe('loadSubscriptionAllowlist', () => {
  const originalEdgeConfig = process.env.EDGE_CONFIG
  const originalEnv = process.env.SUBSCRIPTION_ALLOWLIST

  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.EDGE_CONFIG
    delete process.env.SUBSCRIPTION_ALLOWLIST
  })

  afterEach(() => {
    process.env.EDGE_CONFIG = originalEdgeConfig
    process.env.SUBSCRIPTION_ALLOWLIST = originalEnv
  })

  it('returns the Edge Config value when present', async () => {
    process.env.EDGE_CONFIG = 'https://edge-config.test/abc'
    mockEdgeConfigGet.mockResolvedValue(['user-1', 'tester@kdm.test'])

    const allowlist = await loadSubscriptionAllowlist()

    expect(allowlist).toEqual(['user-1', 'tester@kdm.test'])
    expect(mockEdgeConfigGet).toHaveBeenCalledWith('subscriptionAllowlist')
  })

  it('falls back to env var when EDGE_CONFIG is not set', async () => {
    process.env.SUBSCRIPTION_ALLOWLIST = 'user-1, tester@kdm.test ,*'

    const allowlist = await loadSubscriptionAllowlist()

    expect(allowlist).toEqual(['user-1', 'tester@kdm.test', '*'])
    expect(mockEdgeConfigGet).not.toHaveBeenCalled()
  })

  it('falls back to env var when Edge Config throws', async () => {
    // Edge Config outages must not leak through as 500s — the load helper
    // logs and falls back to the env var, which lets local development
    // keep working when the Vercel integration is offline.
    process.env.EDGE_CONFIG = 'https://edge-config.test/abc'
    process.env.SUBSCRIPTION_ALLOWLIST = 'fallback-user'
    mockEdgeConfigGet.mockRejectedValue(new Error('Edge Config 503'))

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    const allowlist = await loadSubscriptionAllowlist()

    expect(allowlist).toEqual(['fallback-user'])
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Subscription Allowlist Edge Config Error:',
      expect.any(Error)
    )

    consoleErrorSpy.mockRestore()
  })

  it('falls back to env var when Edge Config returns a non-array', async () => {
    // Misconfigured Edge Config entries (object, string, null) must
    // collapse to the env-var fallback rather than crashing the route.
    process.env.EDGE_CONFIG = 'https://edge-config.test/abc'
    process.env.SUBSCRIPTION_ALLOWLIST = 'env-user'
    mockEdgeConfigGet.mockResolvedValue('not-an-array')

    const allowlist = await loadSubscriptionAllowlist()

    expect(allowlist).toEqual(['env-user'])
  })

  it('returns an empty list when neither source is configured', async () => {
    const allowlist = await loadSubscriptionAllowlist()

    expect(allowlist).toEqual([])
  })

  it('trims whitespace and drops empty entries from the env-var fallback', async () => {
    process.env.SUBSCRIPTION_ALLOWLIST = ' user-a , , user-b , '

    const allowlist = await loadSubscriptionAllowlist()

    expect(allowlist).toEqual(['user-a', 'user-b'])
  })
})

describe('identifySubscriptionManagementCaller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateClient.mockResolvedValue({ auth: { getUser: mockGetUser } })
  })

  it('returns id + lowercased email for an authenticated caller', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'Survivor@KDM.test' } },
      error: null
    })

    const entities = await identifySubscriptionManagementCaller()

    expect(entities).toEqual({
      id: 'user-1',
      email: 'survivor@kdm.test'
    })
  })

  it('returns null when the user has no email', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: null } },
      error: null
    })

    const entities = await identifySubscriptionManagementCaller()

    expect(entities).toEqual({ id: 'user-1', email: null })
  })

  it('returns null when Supabase reports an auth error', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'JWT expired' }
    })

    const entities = await identifySubscriptionManagementCaller()

    expect(entities).toBeNull()
  })

  it('returns null when there is no signed-in user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const entities = await identifySubscriptionManagementCaller()

    expect(entities).toBeNull()
  })

  it('returns null when createClient throws', async () => {
    // Supabase outages or env-misconfiguration must not surface as
    // unhandled rejections inside the flag pipeline — the helper logs and
    // collapses to "unidentifiable", which closes the flag.
    mockCreateClient.mockRejectedValueOnce(new Error('Supabase unreachable'))

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    const entities = await identifySubscriptionManagementCaller()

    expect(entities).toBeNull()
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Subscription Management Flag Identify Error:',
      expect.any(Error)
    )

    consoleErrorSpy.mockRestore()
  })
})

describe('decideSubscriptionManagementFlag', () => {
  const originalEdgeConfig = process.env.EDGE_CONFIG
  const originalEnv = process.env.SUBSCRIPTION_ALLOWLIST

  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.EDGE_CONFIG
    delete process.env.SUBSCRIPTION_ALLOWLIST
  })

  afterEach(() => {
    process.env.EDGE_CONFIG = originalEdgeConfig
    process.env.SUBSCRIPTION_ALLOWLIST = originalEnv
  })

  it('returns false when entities is null', async () => {
    process.env.SUBSCRIPTION_ALLOWLIST = '*'

    const result = await decideSubscriptionManagementFlag(null)

    expect(result).toBe(false)
  })

  it('returns false when the allowlist is empty', async () => {
    const result = await decideSubscriptionManagementFlag({
      id: 'user-1',
      email: 'a@b.test'
    })

    expect(result).toBe(false)
  })

  it('returns true when the allowlist contains the wildcard', async () => {
    process.env.SUBSCRIPTION_ALLOWLIST = '*'

    const result = await decideSubscriptionManagementFlag({
      id: 'user-1',
      email: 'a@b.test'
    })

    expect(result).toBe(true)
  })

  it('returns true when the user ID is in the allowlist', async () => {
    process.env.SUBSCRIPTION_ALLOWLIST = 'user-1,user-2'

    const result = await decideSubscriptionManagementFlag({
      id: 'user-1',
      email: 'a@b.test'
    })

    expect(result).toBe(true)
  })

  it('returns true when the lowercased email is in the allowlist', async () => {
    // The allowlist may contain mixed-case operator entries — the
    // entity's email is already lowercased by `identify`, so the match
    // is exact on the lowercased value.
    process.env.SUBSCRIPTION_ALLOWLIST = 'tester@kdm.test'

    const result = await decideSubscriptionManagementFlag({
      id: 'user-other',
      email: 'tester@kdm.test'
    })

    expect(result).toBe(true)
  })

  it('does not match when only an uppercased email is in the allowlist', async () => {
    // Documents the contract: operators must store lowercased emails in
    // the allowlist. The flag identifies users by lowercased email, so a
    // mixed-case entry never matches.
    process.env.SUBSCRIPTION_ALLOWLIST = 'Tester@KDM.test'

    const result = await decideSubscriptionManagementFlag({
      id: 'user-other',
      email: 'tester@kdm.test'
    })

    expect(result).toBe(false)
  })

  it('returns false when the user has no email and the email is allowlisted', async () => {
    // Defense check: if the caller's auth profile is missing the email
    // claim, the email rule cannot match — only the ID rule can.
    process.env.SUBSCRIPTION_ALLOWLIST = 'tester@kdm.test'

    const result = await decideSubscriptionManagementFlag({
      id: 'user-other',
      email: null
    })

    expect(result).toBe(false)
  })

  it('returns false when neither id nor email is in the allowlist', async () => {
    process.env.SUBSCRIPTION_ALLOWLIST = 'user-a,user-b@kdm.test'

    const result = await decideSubscriptionManagementFlag({
      id: 'user-c',
      email: 'user-c@kdm.test'
    })

    expect(result).toBe(false)
  })
})
