'use client'

import { Dispatch, SetStateAction, useEffect, useState } from 'react'

/**
 * Catalog Fetch Options
 */
export interface UseCatalogFetchOptions<T> {
  /** Initial value, also reused as the error fallback. */
  initial: T
  /** Optional console.error label prepended on failures. */
  errorContext?: string
  /**
   * Called once when the settlement id transitions to a different value. Use to
   * reset transient UI state (open popovers, dialog flags, etc.).
   */
  onReset?: () => void
  /**
   * Called when the fetcher rejects, after `console.error` and after the data
   * has been reset to `initial`. Typically used to surface a toast.
   */
  onError?: (err: unknown) => void
}

/**
 * Catalog Fetch Result
 */
export interface UseCatalogFetchResult<T> {
  /** Most recent fetched data, or `initial` before the first success. */
  data: T
  /** True once a fetch has completed (success or failure) for the current id. */
  isLoaded: boolean
  /**
   * Direct setter for the cached data, exposed so consumers can splice newly
   * created custom rows into the catalog without re-fetching.
   */
  setData: Dispatch<SetStateAction<T>>
}

/**
 * One-Shot-Per-Settlement Catalog Loader
 *
 * Encapsulates the repeated `hasFetched` + `prevSettlementId` + reset-on-change
 * idiom used by every catalog-loading settlement card. When `settlementId`
 * changes, `isLoaded` flips back to `false`, `onReset` fires, and the next
 * render schedules a fresh fetch via the supplied `fetcher`.
 *
 * @param settlementId Current settlement id (null disables fetching)
 * @param fetcher Async function returning the catalog payload
 * @param options Initial value, error reporting hooks, and reset callback
 * @returns Latest fetched payload and a load flag
 */
export function useCatalogFetch<T>(
  settlementId: string | null | undefined,
  fetcher: () => Promise<T>,
  options: UseCatalogFetchOptions<T>
): UseCatalogFetchResult<T> {
  const { initial, errorContext, onReset, onError } = options

  const [data, setData] = useState<T>(initial)
  const [hasFetched, setHasFetched] = useState<boolean>(false)
  const [prevSettlementId, setPrevSettlementId] = useState<string | null>(
    settlementId ?? null
  )

  const currentId = settlementId ?? null
  if (currentId !== prevSettlementId) {
    setPrevSettlementId(currentId)
    setHasFetched(false)
    onReset?.()
  }

  useEffect(() => {
    if (!settlementId || hasFetched) return

    let cancelled = false

    fetcher()
      .then((result) => {
        if (cancelled) return
        setData(result)
        setHasFetched(true)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setData(initial)
        setHasFetched(true)
        if (errorContext) console.error(`${errorContext}:`, err)
        onError?.(err)
      })

    return () => {
      cancelled = true
    }
  }, [settlementId, hasFetched, errorContext, fetcher, initial, onError])

  return { data, isLoaded: hasFetched, setData }
}
