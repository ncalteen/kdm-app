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
 * For local development the env var can be omitted and the route falls back to
 * the request's parsed URL. The fallback is intentionally limited to
 * `request.url` (parsed from `Host`); forwarded-host headers are NOT honored.
 *
 * @param request Next Request
 * @returns Origin Including Scheme
 */
export function resolveOrigin(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL

  if (configured) {
    try {
      return new URL(configured).origin
    } catch {
      // Malformed env var — fall through to request-derived origin so a typo
      // doesn't produce an unbreakable 500.
      console.error(
        'Stripe Billing Origin Error: malformed NEXT_PUBLIC_SITE_URL',
        configured
      )
    }
  }

  return new URL(request.url).origin
}
