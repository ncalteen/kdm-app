/**
 * Classify Mutation Error
 *
 * Pure helpers for recognising whether a rejected mutation came from an
 * authorization boundary (RLS policy, ownership trigger, or a PostgREST
 * permission/visibility check) versus a generic failure. Used by the
 * optimistic mutation wrapper to swap the user-facing toast from the generic
 * `ERROR_MESSAGE` to the lantern-themed `NOT_AUTHORIZED_MESSAGE` when a
 * collaborator hits an owner-only control or a row hidden by RLS.
 *
 * See `local/sharing-architecture.md` §10 Phase [E1.9] and the [E1.3] trigger
 * `enforce_settlement_owner_only_columns` for the full list of rejection
 * sources this maps.
 */

/**
 * Error Codes Treated as Authorization Rejections
 *
 * `42501` is Postgres' `insufficient_privilege` SQLSTATE — RLS USING/WITH
 * CHECK failure. `0A000` is `feature_not_supported`, the SQLSTATE the [E1.3]
 * `enforce_settlement_owner_only_columns` trigger raises when a collaborator
 * tries to mutate an owner-only column. `PGRST116` is PostgREST's "no rows
 * returned" code, which is how a `.single()` / `.maybeSingle()` UPDATE or
 * DELETE surfaces when RLS filters every targeted row. `PGRST204` is
 * PostgREST's "no content" code, which is how a bulk UPDATE / DELETE surfaces
 * the same RLS-zero-rows outcome.
 */
const AUTHORIZATION_ERROR_CODES: ReadonlySet<string> = new Set([
  '42501',
  '0A000',
  'PGRST116',
  'PGRST204'
])

/**
 * Message Patterns Treated as Authorization Rejections
 *
 * Used as a fallback when the error surfaces without a recognized SQLSTATE
 * (e.g. when a stack wraps the raw PostgREST error). Matches the [E1.3]
 * trigger name, the trigger's bespoke user-facing message, and Postgres'
 * canonical RLS rejection text.
 */
const AUTHORIZATION_MESSAGE_PATTERNS: readonly RegExp[] = [
  /enforce_settlement_owner_only_columns/i,
  /only the settlement owner can change/i,
  /row-level security/i,
  /permission denied/i
]

/**
 * Is Authorization Error
 *
 * Returns `true` when the supplied error looks like an RLS / ownership
 * trigger / PostgREST permission rejection. Returns `false` for every other
 * shape (including `null` / `undefined` / non-object inputs) so the caller
 * can fall back to the generic error toast.
 *
 * @param err Caught Error
 * @returns Whether the Error Represents an Authorization Rejection
 */
export function isAuthorizationError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false

  const candidate = err as { code?: unknown; message?: unknown }

  if (
    typeof candidate.code === 'string' &&
    AUTHORIZATION_ERROR_CODES.has(candidate.code)
  )
    return true

  if (typeof candidate.message === 'string') {
    const message = candidate.message
    return AUTHORIZATION_MESSAGE_PATTERNS.some((pattern) =>
      pattern.test(message)
    )
  }

  return false
}
