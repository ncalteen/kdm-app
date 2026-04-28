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
  // `VERCEL_ENV` is set to `production`, `preview`, or `development` on Vercel
  // deployments. On preview deployments Vercel injects the Toolbar and Live
  // Feedback widget at the edge — those scripts cannot pick up our per-request
  // nonce, so the CSP must be relaxed for them.
  const isPreview = process.env.VERCEL_ENV === 'preview'
  const supabase = deriveSupabaseOrigins()

  // Vercel Live (preview toolbar / feedback widget) origins. Only allowed on
  // preview deployments — production should never load them.
  const vercelLiveScript = isPreview ? ['https://vercel.live'] : []
  const vercelLiveConnect = isPreview
    ? ['https://vercel.live', 'wss://ws-us3.pusher.com']
    : []
  const vercelLiveFrame = isPreview ? ['https://vercel.live'] : []
  const vercelLiveImg = isPreview
    ? ['https://vercel.live', 'https://vercel.com']
    : []

  // The toolbar injects inline scripts post-render that cannot be tagged with
  // the nonce. Browsers ignore `'unsafe-inline'` when a nonce-source is
  // present, so on preview we drop the nonce and rely on `'unsafe-inline'` for
  // the toolbar's scripts. This trade-off only applies to non-production
  // preview URLs.
  const scriptSrc = isPreview
    ? [
        "'self'",
        "'unsafe-inline'",
        'https://va.vercel-scripts.com',
        ...vercelLiveScript
      ].join(' ')
    : [
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
    ...vercelLiveConnect,
    ...supabase.http,
    ...supabase.ws
  ].join(' ')

  const imgSrc = [
    "'self'",
    'data:',
    'blob:',
    'https://cdn.discordapp.com',
    ...vercelLiveImg,
    ...supabase.http
  ].join(' ')

  const frameSrc = ["'self'", ...vercelLiveFrame].join(' ')

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
    `frame-src ${frameSrc}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    // Vercel Live embeds the host page in an iframe on preview, so
    // `frame-ancestors` must allow it there.
    isPreview
      ? "frame-ancestors 'self' https://vercel.live"
      : "frame-ancestors 'none'",
    // Force any accidental `http://` subresource references to upgrade in
    // production. Skipped in development to keep `http://localhost` and LAN
    // URLs working.
    ...(isDev ? [] : ['upgrade-insecure-requests'])
  ]

  return directives.join('; ')
}
