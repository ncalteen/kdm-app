'use client'

import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { ComponentProps } from 'react'

/**
 * Alert root variants.
 *
 * The root uses a flex layout (rather than absolute positioning) so the icon
 * and content stay vertically aligned regardless of whether the alert
 * contains only an `AlertDescription`, only an `AlertTitle`, or both. Icon
 * sizing is normalized to `size-4` and nudged down by a hair (`mt-0.5`) so it
 * optically aligns with the text baseline of a single-line description.
 *
 * Destructive variant tints both the border and the icon via `text-current`,
 * so callers don't have to remember to color the icon themselves.
 */
const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm flex items-start gap-3 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:mt-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

/**
 * Alert
 *
 * Container for inline status messages. Children are laid out in a single
 * row (icon + content), with the content column collapsing into a vertical
 * stack of `AlertTitle` / `AlertDescription` when both are present.
 *
 * @param props Alert Properties
 * @returns Alert Component
 */
function Alert({
  className,
  variant,
  ...props
}: ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

/**
 * Alert Title
 *
 * Headline text for the alert. Sits above the description when both are
 * present.
 *
 * @param props Alert Title Properties
 * @returns Alert Title Component
 */
function AlertTitle({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        'min-w-0 flex-1 font-medium leading-none tracking-tight',
        className
      )}
      {...props}
    />
  )
}

/**
 * Alert Description
 *
 * Supplementary copy for the alert. Used on its own (single-line errors) or
 * paired with an `AlertTitle`.
 *
 * @param props Alert Description Properties
 * @returns Alert Description Component
 */
function AlertDescription({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'min-w-0 flex-1 text-sm leading-snug [&_p]:leading-relaxed',
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertDescription, AlertTitle }
