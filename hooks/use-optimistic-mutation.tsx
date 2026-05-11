'use client'

import { LocalStateType } from '@/contexts/local-context'
import { useToast } from '@/hooks/use-toast'
import { ERROR_MESSAGE, NOT_AUTHORIZED_MESSAGE } from '@/lib/messages'
import { isAuthorizationError } from '@/lib/security/classify-mutation-error'
import { useCallback } from 'react'

/**
 * Options Accepted by the Mutation Wrapper
 *
 * The caller applies any optimistic state update _before_ invoking `mutate`.
 * The hook then runs `persist`, invoking `onSuccess` (to replace temp IDs,
 * etc.) on resolve, or `rollback` (to undo the optimistic update) on reject.
 * It always logs with a consistent `"${context} Error:"` prefix and surfaces
 * the shared `ERROR_MESSAGE()` toast on failure. Rejections that look like
 * authorization boundaries (RLS, the [E1.3] ownership trigger, or a PostgREST
 * permission/visibility check) are instead surfaced as the lantern-themed
 * `NOT_AUTHORIZED_MESSAGE()` toast so collaborators clicking an owner-only
 * control get a meaningful message instead of the generic fallback.
 */
export interface OptimisticMutationOptions<T> {
  /**
   * Label used for the error-log prefix (`"${context} Error:"`). Keep it short
   * and human-readable, e.g. `"Nemesis Add"`, `"Principle Remove"`.
   */
  context: string

  /**
   * Persistence call. Invoked after the caller applies the optimistic update.
   */
  persist: () => Promise<T>

  /**
   * Invoked with the resolved value of `persist()`. Use for post-success
   * reconciliation (replacing temp IDs, merging returned rows, cascading
   * follow-up writes). May return a promise; errors thrown here are caught and
   * treated the same as a `persist()` rejection.
   */
  onSuccess?: (result: T) => void | Promise<void>

  /** Invoked on `persist()` rejection. Use to undo the optimistic update. */
  rollback?: (err: unknown) => void

  /** Optional success toast message. Skipped when omitted. */
  successMessage?: string

  /** Optional error toast override. Defaults to `ERROR_MESSAGE()`. */
  errorMessage?: string
}

/**
 * Optimistic Mutation Hook
 *
 * Centralizes the success/error tail shared by every optimistic write in the
 * app:
 *
 * 1. Run a persistence call.
 * 2. On success, optionally reconcile state and surface a success toast.
 * 3. On failure, optionally roll back local state, log with a consistent
 *    `"${context} Error:"` prefix, and surface the shared error toast.
 *
 * The caller still owns the optimistic update itself, because in this codebase
 * those updates mutate per-domain context state (`selectedSettlement`,
 * `selectedSurvivor`, etc.) with shapes the hook cannot know about.
 *
 * @param local Local State (for toast suppression settings)
 * @returns Mutation Wrapper Function
 */
export function useOptimisticMutation(local: LocalStateType) {
  const { toast } = useToast(local)

  return useCallback(
    async <T,>(options: OptimisticMutationOptions<T>): Promise<void> => {
      const {
        context,
        persist,
        onSuccess,
        rollback,
        successMessage,
        errorMessage
      } = options

      try {
        const result = await persist()
        if (onSuccess) await onSuccess(result)
        if (successMessage) toast.success(successMessage)
      } catch (err) {
        if (rollback) rollback(err)
        console.error(`${context} Error:`, err)
        if (errorMessage) {
          toast.error(errorMessage)
        } else if (isAuthorizationError(err)) {
          toast.error(NOT_AUTHORIZED_MESSAGE())
        } else {
          toast.error(ERROR_MESSAGE())
        }
      }
    },
    [toast]
  )
}
