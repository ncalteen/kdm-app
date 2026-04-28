import type { NextConfig } from 'next'

/**
 * Static security headers applied to every response.
 *
 * The Content-Security-Policy is intentionally NOT set here — it is built
 * per-request in `lib/supabase/proxy.ts` so that a unique nonce can be embedded
 * in `script-src` and made available to React Server Components via the
 * `x-nonce` request header.
 */
const securityHeaders = [
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
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' }
]

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    // Local Dev
    '127.0.0.1',
    'localhost',
    // Local Network (Multiplayer Testing)
    '192.168.86.21'
  ],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders
      }
    ]
  }
}

export default nextConfig
