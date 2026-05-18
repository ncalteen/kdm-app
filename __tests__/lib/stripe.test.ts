import { resolveOrigin } from '@/lib/stripe'
import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Build a `NextRequest` so we can exercise `resolveOrigin` directly.
 */
function buildRequest(url = 'https://archivist.test/api/billing/checkout') {
  return new NextRequest(url, { method: 'POST' })
}

describe('resolveOrigin', () => {
  // Snapshot + restore environment between tests. `NODE_ENV` is read-only in
  // TS, so we cast through a temporary record to mutate it.
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const originalNodeEnv = process.env.NODE_ENV

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL
    ;(process.env as Record<string, string | undefined>).NODE_ENV = 'test'
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl
    ;(process.env as Record<string, string | undefined>).NODE_ENV =
      originalNodeEnv
    vi.restoreAllMocks()
  })

  it('returns the configured origin when NEXT_PUBLIC_SITE_URL is well-formed', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://archivist.example.com'

    expect(resolveOrigin(buildRequest())).toBe('https://archivist.example.com')
  })

  it('strips paths/queries from a configured URL, returning only the origin', () => {
    process.env.NEXT_PUBLIC_SITE_URL =
      'https://archivist.example.com/some/path?with=query'

    expect(resolveOrigin(buildRequest())).toBe('https://archivist.example.com')
  })

  it('falls back to the request URL in non-production when NEXT_PUBLIC_SITE_URL is unset', () => {
    expect(resolveOrigin(buildRequest('https://archivist.test/x'))).toBe(
      'https://archivist.test'
    )
  })

  it('falls back to the request URL in non-production when NEXT_PUBLIC_SITE_URL is malformed', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'not-a-url'

    expect(resolveOrigin(buildRequest('https://archivist.test/x'))).toBe(
      'https://archivist.test'
    )
  })

  it('fails closed (throws) in production when NEXT_PUBLIC_SITE_URL is unset', () => {
    // Reviewer feedback (PR #242 review comment r3262472051): production must
    // not silently degrade to the Host-derived request URL. A missing
    // canonical origin in production is a deploy-time misconfiguration, not a
    // user-facing failure mode — surface it loudly instead of leaking an
    // attacker-influenceable redirect.
    ;(process.env as Record<string, string | undefined>).NODE_ENV = 'production'

    expect(() => resolveOrigin(buildRequest())).toThrowError(
      /NEXT_PUBLIC_SITE_URL is not set/
    )
  })

  it('fails closed (throws) in production when NEXT_PUBLIC_SITE_URL is malformed', () => {
    // A typo like `https//archivist.monster` (missing colon) must not fall
    // through to the Host header — that would reintroduce the open-redirect
    // class this helper is documented to prevent.
    ;(process.env as Record<string, string | undefined>).NODE_ENV = 'production'
    process.env.NEXT_PUBLIC_SITE_URL = 'https//archivist.monster'

    expect(() => resolveOrigin(buildRequest())).toThrowError(
      /NEXT_PUBLIC_SITE_URL is malformed/
    )
  })

  it('honors a well-formed NEXT_PUBLIC_SITE_URL in production', () => {
    ;(process.env as Record<string, string | undefined>).NODE_ENV = 'production'
    process.env.NEXT_PUBLIC_SITE_URL = 'https://archivist.monster'

    expect(resolveOrigin(buildRequest())).toBe('https://archivist.monster')
  })
})
