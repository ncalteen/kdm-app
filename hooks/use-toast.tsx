'use client'

import { LocalStateType } from '@/contexts/local-context'
import { useCallback, useMemo } from 'react'
import { ExternalToast, toast as sonnerToast } from 'sonner'

/**
 * Toast Custom Hook
 *
 * Provides wrapped toast functions that respect the disableToasts setting
 * from the campaign configuration. Success/info messages are suppressed when
 * toasts are disabled, but error messages are always shown.
 *
 * @param local Local State
 * @returns Wrapped Toast Functions
 */
export function useToast(local: LocalStateType) {
  /**
   * Check if Toasts are Disabled
   *
   * @returns Toasts Disabled Status
   */
  const areToastsDisabled = useCallback(
    () => local.disableToasts === true,
    [local.disableToasts]
  )

  /**
   * Success Toast
   *
   * @param message Message
   * @param options Options
   */
  const success = useCallback(
    (message: string, options?: ExternalToast) => {
      if (!areToastsDisabled()) sonnerToast.success(message, options)
    },
    [areToastsDisabled]
  )

  /**
   * Error Toast
   *
   * @param message Message
   * @param options Options
   */
  const error = useCallback(
    (message: string, options?: ExternalToast) =>
      sonnerToast.error(message, options),
    []
  )

  /**
   * Info Toast
   *
   * @param message Message
   * @param options Options
   */
  const info = useCallback(
    (message: string, options?: ExternalToast) => {
      if (!areToastsDisabled()) sonnerToast.info(message, options)
    },
    [areToastsDisabled]
  )

  /**
   * Warning Toast
   *
   * @param message Message
   * @param options Options
   */
  const warning = useCallback((message: string, options?: ExternalToast) => {
    sonnerToast.warning(message, options)
  }, [])

  const toast = useMemo(
    () => ({
      success,
      error,
      info,
      warning
    }),
    [success, error, info, warning]
  )

  return { toast }
}
