import { buildContentSecurityPolicy, generateNonce } from '@/lib/security/csp'
import { applySecurityHeaders } from '@/lib/security/headers'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Update Session
 *
 * Refreshes the user's Supabase auth session for an incoming request and
 * returns a `NextResponse` with any updated auth cookies attached. Also
 * generates a per-request CSP nonce, exposes it to React Server Components via
 * the `x-nonce` request header, and applies the resulting Content Security
 * Policy to the response.
 *
 * @param request Incoming Next.js Request
 * @returns Next.js Response carrying refreshed session cookies and CSP
 */
export async function updateSession(request: NextRequest) {
  const nonce = generateNonce()
  const csp = buildContentSecurityPolicy(nonce)

  // Forward the nonce (and the CSP itself) on the request so server components
  // can read them via `next/headers` if needed. Next.js applies the nonce
  // automatically to its bootstrap `<script>` tags when `x-nonce` is present on
  // the request.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('content-security-policy', csp)

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders }
  })

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders }
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        }
      }
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  if (
    request.nextUrl.pathname !== '/' &&
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/api') &&
    !request.nextUrl.pathname.startsWith('/.well-known')
  ) {
    // No user — redirect HTML navigations to the login page. API routes
    // and the `.well-known` namespace are intentionally excluded:
    //
    //   - `/api/billing/webhook` authenticates via the Stripe-Signature
    //     header, never via a Supabase session cookie. Stripe does NOT
    //     follow 3xx responses; a redirect would cause every webhook
    //     delivery to be recorded as a non-2xx failure and retried with
    //     exponential backoff until it gave up. The webhook would
    //     effectively never run.
    //   - `/api/billing/checkout` and `/api/billing/portal` issue their
    //     own `401 { error: 'Not Authenticated' }` JSON responses, which
    //     is what their fetch-based callers expect. Returning a 307 to
    //     an HTML login page would corrupt the client contract.
    //   - `/.well-known/vercel/flags` is the Vercel Toolbar flag-
    //     discovery endpoint, signed via `FLAGS_SECRET` instead of the
    //     Supabase session. Redirecting it would break toolbar overrides
    //     for unauthenticated reviewers (e.g. previewing a deployment
    //     before signing in).
    //
    // Any future `/api/*` route should follow the same pattern: enforce
    // its own auth and return JSON status codes rather than relying on
    // the middleware redirect.
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    const redirectResponse = NextResponse.redirect(url)
    // Responses built directly in middleware bypass `next.config.ts`'s
    // `headers()` config, so the static security headers must be applied
    // manually here in addition to the per-request CSP.
    applySecurityHeaders(redirectResponse.headers)
    redirectResponse.headers.set('Content-Security-Policy', csp)
    return redirectResponse
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  supabaseResponse.headers.set('Content-Security-Policy', csp)
  return supabaseResponse
}
