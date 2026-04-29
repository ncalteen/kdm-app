import { LanternMark } from '@/components/generic/lantern-mark'
import { cn } from '@/lib/utils'
import { ReactElement } from 'react'

/**
 * Lantern Loader Variant
 *
 * - `inline`: Compact, suitable for small areas (e.g. card content).
 * - `page`: Full-area spinner with title + caption, used inside an existing
 *   layout shell (sidebar/header still visible).
 * - `splash`: Edge-to-edge loader for pre-auth bootstraps where no shell has
 *   rendered yet.
 */
export type LanternLoaderVariant = 'inline' | 'page' | 'splash'

/**
 * Lantern Loader Properties
 */
interface LanternLoaderProps {
  /** Optional caption shown beneath the title. */
  caption?: string
  /** Additional class names applied to the outer wrapper. */
  className?: string
  /** Headline text shown next to the lantern. Defaults to `Kindling the lantern…` */
  title?: string
  /** Visual size/density. Defaults to `page`. */
  variant?: LanternLoaderVariant
}

/**
 * Variant Configuration
 */
const VARIANT_STYLES: Record<
  LanternLoaderVariant,
  {
    wrapper: string
    mark: string
    title: string
    caption: string
  }
> = {
  inline: {
    wrapper: 'flex items-center justify-center gap-3 py-6',
    mark: 'h-6 w-6 text-amber-400/90',
    title: 'text-sm font-medium',
    caption: 'text-xs text-muted-foreground'
  },
  page: {
    wrapper:
      'flex flex-col items-center justify-center gap-4 py-16 px-6 text-center',
    mark: 'h-10 w-10 text-amber-400/90',
    title: 'text-lg font-semibold tracking-tight',
    caption: 'text-sm text-muted-foreground max-w-xs'
  },
  splash: {
    wrapper:
      'flex min-h-svh w-full flex-col items-center justify-center gap-4 px-6 text-center',
    mark: 'h-12 w-12 text-amber-400/90',
    title: 'text-xl md:text-2xl font-semibold tracking-tight',
    caption: 'text-sm md:text-base text-muted-foreground max-w-md'
  }
}

/**
 * Lantern Loader Component
 *
 * Standard loading affordance used across the app. A flickering lantern mark
 * paired with a thematic line of copy keeps the dark, deliberate tone of
 * Kingdom Death even while data is in flight, instead of a sterile spinner
 * or the word "Loading...".
 *
 * Use the `variant` prop to match the surrounding context: `inline` for in-card
 * placeholders, `page` for tab-level placeholders, and `splash` for pre-auth
 * full-screen bootstraps.
 *
 * @param props Lantern Loader Properties
 * @returns Lantern Loader Component
 */
export function LanternLoader({
  caption = 'Faces in the sky peer down on your settlements.',
  className,
  title = 'Kindling the lantern…',
  variant = 'page'
}: LanternLoaderProps): ReactElement {
  const styles = VARIANT_STYLES[variant]

  return (
    <div
      className={cn(styles.wrapper, className)}
      role="status"
      aria-live="polite">
      <LanternMark
        className={cn('motion-safe:animate-pulse', styles.mark)}
        aria-hidden="true"
      />
      <div className="flex flex-col items-center gap-1">
        <p className={styles.title}>{title}</p>
        {caption && <p className={styles.caption}>{caption}</p>}
      </div>
      <span className="sr-only">Loading</span>
    </div>
  )
}
