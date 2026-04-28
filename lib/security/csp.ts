/**
 * Content Security Policy
 *
 * Builds a per-request Content Security Policy with a unique nonce. The nonce
 * is attached to inline `<script>` elements rendered by Next.js so the policy
 * can drop `'unsafe-inline'` and `'unsafe-eval'` in production while still
 * permitting the framework's bootstrap scripts.
 *
 * The CSP is constructed fresh for every request and applied via the Supabase
 * proxy in `lib/supabase/proxy.ts`.
 */

/**
 * Generate CSP Nonce
 *
 * Produces a cryptographically random base64-encoded value suitable for use as
 * a CSP nonce. Uses the Web Crypto API which is available in both Node and the
 * Vercel Edge runtime.
 *
 * @returns Base64-Encoded Nonce
 */
export function generateNonce(): string {
  const bytes = new Uint8Array(16)

  crypto.getRandomValues(bytes)

  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)

  return btoa(binary)
}

/**
 * Derive Supabase Origins
 *
 * Parses `NEXT_PUBLIC_SUPABASE_URL` to produce HTTP and WebSocket origins so
 * the CSP works for both the local Supabase stack and hosted projects.
 *
 * @returns Arrays of HTTP Origins and WebSocket Origins
 */
function deriveSupabaseOrigins(): { http: string[]; ws: string[] } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!url) return { http: [], ws: [] }

  try {
    const { protocol, host } = new URL(url)
    const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:'

    return {
      http: [`${protocol}//${host}`],
      ws: [`${wsProtocol}//${host}`]
    }
  } catch {
    // Invalid URL — fall back to `'self'` only.
    return { http: [], ws: [] }
  }
}

/**
 * Build Content Security Policy
 *
 * Constructs the CSP header value for a single request. In development the
 * policy includes `'unsafe-eval'` so Next.js HMR continues to work; in
 * production the policy is locked down to nonce-based script execution.
 *
 * @param nonce Per-Request CSP Nonce
 * @returns Serialized CSP Header Value
 */
export function buildContentSecurityPolicy(nonce: string): string {
  const isDev = process.env.NODE_ENV !== 'production'
  const supabase = deriveSupabaseOrigins()

  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    'https://va.vercel-scripts.com',
    // Next.js HMR relies on `eval` in development. Production builds do not
    // need this and must not include it.
    ...(isDev ? ["'unsafe-eval'"] : [])
  ].join(' ')

  const connectSrc = [
    "'self'",
    'https://va.vercel-scripts.com',
    ...supabase.http,
    ...supabase.ws
  ].join(' ')

  const imgSrc = [
    "'self'",
    'data:',
    'blob:',
    'https://cdn.discordapp.com',
    ...supabase.http
  ].join(' ')

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    `script-src-elem ${scriptSrc}`,
    // Tailwind, Radix, and other libraries inject inline `<style>` tags at
    // runtime. Next.js does not propagate the nonce to these elements, so
    // `'unsafe-inline'` is required for styles. The XSS surface from style
    // injection is significantly narrower than from script injection.
    "style-src 'self' 'unsafe-inline'",
    "style-src-elem 'self' 'unsafe-inline'",
    `img-src ${imgSrc}`,
    "font-src 'self' data:",
    `connect-src ${connectSrc}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "media-src 'self'",
    "frame-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    // Force any accidental `http://` subresource references to upgrade in
    // production. Skipped in development to keep `http://localhost` and LAN
    // URLs working.
    ...(isDev ? [] : ['upgrade-insecure-requests'])
  ]

  return directives.join('; ')
}
