import { securityHeaders } from '@/lib/security/headers'
import type { NextConfig } from 'next'

/**
 * The Content-Security-Policy is intentionally NOT set here — it is built
 * per-request in `lib/supabase/proxy.ts` so that a unique nonce can be embedded
 * in `script-src` and made available to React Server Components via the
 * `x-nonce` request header. All other static security headers live in
 * `lib/security/headers.ts` so they can be reused by middleware/proxy code
 * paths that build responses outside of this `headers()` config.
 */

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
