import { cn } from '@/lib/utils'
import { ReactElement, ReactNode } from 'react'

/**
 * Thematic Shell Properties
 */
interface ThematicShellProps {
  /** Additional class names applied to the outer wrapper. */
  className?: string
  /** Content rendered inside the atmospherics. */
  children: ReactNode
}

/**
 * Thematic Shell
 *
 * Full-viewport wrapper that paints the application's signature mood onto
 * unauthenticated and "outside-the-app" surfaces (auth screens, the not-found
 * page, etc.). Two layered radial gradients form a warm lantern glow against a
 * deepening edge vignette, giving every standalone surface the same "single
 * point of light in the dark" framing without forcing each page to re-implement
 * it.
 *
 * The gradients themselves are defined in `app/globals.css` as the reusable
 * `.lantern-glow` and `.lantern-vignette` utility classes, so the same effect
 * can be applied to other surfaces (e.g. dialog backdrops) without duplicating
 * the underlying CSS.
 *
 * @param props Thematic Shell Properties
 * @returns Thematic Shell Component
 */
export function ThematicShell({
  className,
  children
}: ThematicShellProps): ReactElement {
  return (
    <div
      className={cn(
        'relative min-h-svh w-full overflow-hidden bg-background',
        className
      )}>
      <div
        aria-hidden="true"
        className="lantern-glow pointer-events-none absolute inset-0"
      />
      <div
        aria-hidden="true"
        className="lantern-vignette pointer-events-none absolute inset-0"
      />
      <div className="relative">{children}</div>
    </div>
  )
}
