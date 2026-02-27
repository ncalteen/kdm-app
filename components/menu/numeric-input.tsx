'use client'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { Minus, Plus } from 'lucide-react'
import { ReactElement, RefObject } from 'react'

/**
 * Numeric Input Properties
 */
interface NumericInputProps {
  /** Class Name */
  className?: string
  /** Disabled Mode */
  disabled?: boolean
  /** Label */
  label: string
  /** Maximum Allowed Value (undefined for no maximum) */
  max?: number
  /** Minimum Allowed Value (undefined for no minimum) */
  min?: number
  /** On Change Function */
  onChange?: (value: number) => void
  /** Ref Element */
  ref?: RefObject<HTMLInputElement | null>
  /** Step Increment/Decrement */
  step?: number
  /** Current Value */
  value: number
}

/**
 * Numeric Input Component
 *
 * A reusable input component for desktop/mobile devices. On desktop, it
 * functions as a standard numeric input field. On mobile, it provides
 * increment/decrement buttons for better touch interaction.
 *
 * @param props Numeric Input Properties
 * @returns Numeric Input Component
 */
export function NumericInput({
  className,
  disabled = false,
  label,
  max,
  min,
  onChange,
  ref,
  step = 1,
  value
}: NumericInputProps): ReactElement {
  const isMobile = useIsMobile()

  /**
   * Handle Increment
   */
  const handleIncrement = () => {
    if (!onChange) return

    const newValue = value + step

    if (max === undefined || newValue <= max) onChange(newValue)
  }

  /**
   * Handle Decrement
   */
  const handleDecrement = () => {
    if (!onChange) return

    const newValue = value - step

    if (min === undefined || newValue >= min) onChange(newValue)
  }

  return isMobile ? (
    disabled ? (
      <Input
        type="number"
        value={value}
        disabled={disabled}
        className={cn('text-center no-spinners', className)}
        ref={ref}
      />
    ) : (
      <Drawer>
        <DrawerTrigger asChild>
          <div
            onFocus={(e) => {
              // Prevent focus on the input when opening the drawer
              const target = e.target as HTMLElement
              if (target.tagName === 'INPUT') target.blur()
            }}>
            <Input
              type="number"
              value={value}
              className={cn('text-center no-spinners', className)}
              readOnly
              ref={ref}
            />
          </div>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-center">
            <DrawerTitle>{label}</DrawerTitle>
            <DrawerDescription>
              Adjust the value using the plus and minus buttons.
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-4">
            <div className="flex items-center justify-center gap-4">
              {/* Decrement Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleDecrement}
                disabled={min !== undefined && value <= min}
                className="h-12 w-12 rounded-full"
                name="decrement"
                id="decrement-button">
                <Minus className="h-6 w-6" />
              </Button>

              {/* Current Value Display */}
              <Input
                type="number"
                value={value}
                readOnly
                className="w-20 h-12 text-center text-xl font-semibold focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                name={`${label.toLowerCase().replace(/\s+/g, '-')}-value`}
                id={`${label.toLowerCase().replace(/\s+/g, '-')}-value`}
                ref={ref}
              />

              {/* Increment Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleIncrement}
                disabled={max !== undefined && value >= max}
                className="h-12 w-12 rounded-full"
                name="increment"
                id="increment-button">
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </div>

          <DrawerFooter className="flex justify-center w-full items-center">
            <DrawerClose asChild>
              <Button
                variant="outline"
                className="w-[150px]"
                name="close-drawer"
                id="close-drawer-button">
                Go Back
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  ) : (
    <Input
      type="number"
      value={value}
      onChange={(e) => {
        if (onChange) onChange(parseInt(e.target.value) ?? 0)
      }}
      max={max}
      min={min}
      className={cn('text-center no-spinners', className)}
      disabled={disabled}
      ref={ref}
    />
  )
}
