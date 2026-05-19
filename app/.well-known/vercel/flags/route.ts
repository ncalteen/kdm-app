import 'server-only'

import { subscriptionManagementFlag } from '@/lib/flags'
import { createFlagsDiscoveryEndpoint, getProviderData } from 'flags/next'

/**
 * Force Node Runtime
 *
 * `createFlagsDiscoveryEndpoint` uses Node crypto via the `FLAGS_SECRET`
 * verification path, which the Edge runtime does not support.
 */
export const runtime = 'nodejs'

/**
 * Flags Discovery Endpoint
 *
 * Exposes the project's flag declarations at
 * `/.well-known/vercel/flags` so the Vercel Toolbar can list them,
 * surface their `description`, and let the operator override the
 * `decide` result for the current session. Signed with the
 * `FLAGS_SECRET` env var — requests without the correct signature
 * return 401.
 *
 * The discovery endpoint never leaks user data — it only returns the
 * static flag declarations (`key`, `description`, `options`). The flag
 * still runs its `decide` function for every evaluation; the toolbar
 * just records overrides in a cookie that the SDK honors before
 * `decide`.
 *
 * @see {@link https://vercel.com/docs/feature-flags/flags-discovery-endpoint}
 */
export const GET = createFlagsDiscoveryEndpoint(async () =>
  getProviderData({
    subscriptionManagementFlag
  })
)
