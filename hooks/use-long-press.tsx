'use client'

import { useCallback, useEffect, useRef } from 'react'

/** Long press delay in milliseconds */
const LONG_PRESS_DELAY = 500

/** Movement threshold in pixels before cancelling a long press */
const MOVE_THRESHOLD = 10

/**
 * Window (in ms) after a long press fires during which subsequent click and
 * contextmenu events are suppressed. Prevents the rank-up action from
 * double-firing (once from the long-press timer and again from the browser's
 * contextmenu event or click event).
 */
const SUPPRESSION_WINDOW = 500

/**
 * Long Press Hook Return Type
 */
interface UseLongPressReturn {
  /** Whether a long press fired recently (within the suppression window) */
  isRecentLongPress: () => boolean
  /** Attach to onPointerDown */
  onPointerDown: (e: React.PointerEvent) => void
  /** Attach to onPointerUp */
  onPointerUp: () => void
  /** Attach to onPointerMove (cancels on significant drag) */
  onPointerMove: (e: React.PointerEvent) => void
  /** Attach to onPointerCancel */
  onPointerCancel: () => void
}

/**
 * Long Press Hook
 *
 * Detects a sustained pointer press (~500ms) and fires a callback, providing a
 * touch-friendly alternative to right-click / context menu interactions. Uses
 * pointer events for reliable behavior across touch and mouse inputs. Small
 * movements (< 10px) are tolerated during the hold.
 *
 * Uses a timestamp-based suppression window so that both click and contextmenu
 * events that follow a long press are independently suppressed without race
 * conditions.
 *
 * @param callback Invoked when a long press is detected
 * @returns Pointer event handlers to spread onto the target element
 */
export function useLongPress(callback?: () => void): UseLongPressReturn {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressTimestamp = useRef(0)
  const startPos = useRef<{ x: number; y: number } | null>(null)
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Clean up the timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const isRecentLongPress = useCallback(() => {
    return Date.now() - longPressTimestamp.current < SUPPRESSION_WINDOW
  }, [])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only track the primary button (left click / touch)
      if (e.button !== 0) return

      startPos.current = { x: e.clientX, y: e.clientY }
      clearTimer()
      timerRef.current = setTimeout(() => {
        longPressTimestamp.current = Date.now()
        callbackRef.current?.()
        timerRef.current = null
      }, LONG_PRESS_DELAY)
    },
    [clearTimer]
  )

  const onPointerUp = useCallback(() => {
    clearTimer()
    startPos.current = null
  }, [clearTimer])

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!startPos.current) return

      const dx = e.clientX - startPos.current.x
      const dy = e.clientY - startPos.current.y

      if (Math.sqrt(dx * dx + dy * dy) > MOVE_THRESHOLD) {
        clearTimer()
        startPos.current = null
      }
    },
    [clearTimer]
  )

  return {
    isRecentLongPress,
    onPointerDown,
    onPointerUp,
    onPointerMove,
    onPointerCancel: onPointerUp
  }
}
