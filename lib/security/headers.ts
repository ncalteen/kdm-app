/**
 * Static Security Headers
 *
 * Single source of truth for non-CSP security headers. Imported by
 * `next.config.ts` (which applies them to every response via the `headers()`
 * config) and by the Supabase proxy (which applies them manually to redirects
 * built with `NextResponse.redirect`, since those bypass `next.config.ts`).
 *
 * The Content-Security-Policy is built per-request in `lib/security/csp.ts`
 * and is therefore intentionally not included here.
 */

/**
 * Security Header
 *
 * A single HTTP response header entry, in the shape expected by Next.js's
 * `headers()` configuration.
 */
export interface SecurityHeader {
  /** HTTP Header Name */
  key: string
  /** HTTP Header Value */
  value: string
}

export const securityHeaders: SecurityHeader[] = [
  // `frame-ancestors 'none'` in the CSP is the modern equivalent, but
  // `X-Frame-Options: DENY` is kept for older clients.
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'same-origin' },
  {
    // Default-deny every permission this app does not use. Add to the
    // `self`/allowlist side as new features require them.
    key: 'Permissions-Policy',
    value: [
      'accelerometer=()',
      'autoplay=()',
      'bluetooth=()',
      'browsing-topics=()',
      'camera=()',
      'display-capture=()',
      'encrypted-media=()',
      'fullscreen=(self)',
      'geolocation=()',
      'gyroscope=()',
      'hid=()',
      'idle-detection=()',
      'interest-cohort=()',
      'magnetometer=()',
      'microphone=()',
      'midi=()',
      'payment=()',
      'picture-in-picture=()',
      'publickey-credentials-get=()',
      'screen-wake-lock=()',
      'serial=()',
      'sync-xhr=()',
      'usb=()',
      'xr-spatial-tracking=()'
    ].join(', ')
  },
  // Cross-Origin isolation — same-origin is safe for an app that does not need
  // to embed cross-origin resources requiring credentials. COEP is
  // intentionally omitted as it would break third-party images/iframes that
  // don't send Cross-Origin-Resource-Policy.
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' }
]

/**
 * Apply Static Security Headers
 *
 * Sets every entry from {@link securityHeaders} on the provided `Headers`
 * instance. Used by middleware/proxy code paths that build responses
 * (e.g. `NextResponse.redirect`) which bypass `next.config.ts`'s static
 * `headers()` configuration.
 *
 * @param headers Mutable `Headers` instance to write into
 */
export function applySecurityHeaders(headers: Headers): void {
  for (const { key, value } of securityHeaders) {
    headers.set(key, value)
  }
}
