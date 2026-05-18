import { NextRequest } from 'next/server'

/**
 * Resolve Origin For Redirects
 *
 * Stripe Checkout requires absolute `success_url` and `cancel_url`. To
 * eliminate the open-redirect class of bugs where an attacker spoofs `Host` or
 * `x-forwarded-host` to redirect a paying user to an attacker-controlled domain
 * after checkout (carrying `session_id`), production deployments MUST set
 * `NEXT_PUBLIC_SITE_URL` to the canonical site origin. When set, that value is
 * the sole source of truth.
 *
 * Outside production (development and test) the env var can be omitted or
 * malformed; the helper falls back to the request's parsed URL so local
 * workflows aren't gated on an env var. The fallback is intentionally limited
 * to `request.url` (parsed from `Host`); forwarded-host headers are NEVER
 * honored.
 *
 * In production the helper fails closed: a missing or malformed
 * `NEXT_PUBLIC_SITE_URL` throws rather than silently degrading to the
 * Host-derived origin. A typo in the canonical URL (e.g. `https//site.com`)
 * would otherwise reintroduce the exact open-redirect class this helper exists
 * to prevent. The thrown error is caught by the route's outer try/catch and
 * surfaces as a generic 500 — no redirect leak.
 *
 * @param request Next Request
 * @returns Origin Including Scheme
 * @throws Error When `NEXT_PUBLIC_SITE_URL` Is Missing Or Malformed In Production
 */
export function resolveOrigin(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  const isProduction = process.env.NODE_ENV === 'production'

  if (configured) {
    try {
      return new URL(configured).origin
    } catch {
      console.error(
        'Stripe Billing Origin Error: malformed NEXT_PUBLIC_SITE_URL',
        configured
      )

      // Fail closed in production. A typo in the canonical origin must not
      // silently fall through to the attacker-influenceable Host-derived
      // origin. In dev/test we tolerate the typo so local workflows aren't
      // wedged by an env-var issue.
      if (isProduction)
        throw new Error(
          'Stripe Billing Origin Error: NEXT_PUBLIC_SITE_URL is malformed; refusing to fall back to request-derived origin in production.'
        )
    }
  } else if (isProduction) {
    // Same fail-closed posture when the canonical origin is missing entirely.
    // Production must always pin its redirect origin in code.
    throw new Error(
      'Stripe Billing Origin Error: NEXT_PUBLIC_SITE_URL is not set; refusing to fall back to request-derived origin in production.'
    )
  }

  return new URL(request.url).origin
}
