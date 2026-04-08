'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { useLongPress } from '@/hooks/use-long-press'
import { cn } from '@/lib/utils'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { ComponentProps } from 'react'

/**
 * Long Press Checkbox Properties
 */
interface LongPressCheckboxProps extends ComponentProps<
  typeof CheckboxPrimitive.Root
> {
  /**
   * Callback invoked on long press (mobile) or right-click (desktop).
   *
   * When provided, this component:
   * - Detects sustained pointer presses (~500ms) as a long press.
   * - Handles right-click (contextmenu) to call this callback.
   * - Suppresses the checkbox toggle that would otherwise follow a long press.
   * - Prevents double-firing when both long press and contextmenu trigger.
   *
   * The parent should NOT pass onContextMenu separately — this component
   * manages it internally when onLongPress is set.
   */
  onLongPress?: () => void
}

/**
 * Long Press Checkbox Component
 *
 * Wraps the standard Checkbox with long-press and right-click support. On
 * touch devices, a sustained press (~500ms) fires the onLongPress callback.
 * On desktop, right-click fires the same callback. Both interactions suppress
 * the normal checkbox toggle.
 *
 * Uses pointer events (not touch events) for reliable behavior across all
 * input types. Leverages Radix's composeEventHandlers pattern: calling
 * preventDefault in onClick prevents the internal toggle handler from running.
 *
 * @param props Long Press Checkbox Properties
 * @returns Long Press Checkbox Component
 */
export function LongPressCheckbox({
  onLongPress,
  onCheckedChange,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onContextMenu: _onContextMenu,
  className,
  ...props
}: LongPressCheckboxProps) {
  const {
    isRecentLongPress,
    onPointerDown,
    onPointerUp,
    onPointerMove,
    onPointerCancel
  } = useLongPress(onLongPress)

  return (
    <Checkbox
      {...props}
      className={cn(onLongPress && 'touch-manipulation', className)}
      onPointerDown={onLongPress ? onPointerDown : undefined}
      onPointerUp={onLongPress ? onPointerUp : undefined}
      onPointerMove={onLongPress ? onPointerMove : undefined}
      onPointerCancel={onLongPress ? onPointerCancel : undefined}
      onClick={
        onLongPress
          ? (e: React.MouseEvent) => {
              // After a long press, suppress the click so Radix's
              // composeEventHandlers skips the internal toggle handler.
              if (isRecentLongPress()) e.preventDefault()
            }
          : undefined
      }
      onContextMenu={
        onLongPress
          ? (e: React.MouseEvent) => {
              // Always prevent the browser context menu on these checkboxes.
              e.preventDefault()
              // If this contextmenu was triggered by a long press that already
              // called the callback, skip to avoid double-firing.
              if (!isRecentLongPress()) onLongPress()
            }
          : undefined
      }
      onCheckedChange={onCheckedChange}
    />
  )
}
