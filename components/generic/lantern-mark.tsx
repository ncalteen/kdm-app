import { cn } from '@/lib/utils'
import { ComponentProps, ReactElement } from 'react'

/**
 * Lantern Mark Properties
 */
interface LanternMarkProps extends ComponentProps<'svg'> {
  /** Whether to render the inner flame glow (defaults to `true`). */
  glow?: boolean
}

/**
 * Lantern Mark
 *
 * Inline SVG brand mark for the application. The lantern motif is the central
 * thematic anchor of Kingdom Death: Monster — a single point of light against
 * the overwhelming darkness — and is reused across the site header, marketing
 * hero, and any other surface that benefits from a consistent visual
 * signature.
 *
 * The mark is monochromatic and inherits its color from `currentColor`, so
 * callers can tint it with standard Tailwind text utilities (e.g.
 * `text-amber-300`).
 *
 * @param props Lantern Mark Properties
 * @returns Lantern Mark Component
 */
export function LanternMark({
  className,
  glow = true,
  ...props
}: LanternMarkProps): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-5 w-5 shrink-0', className)}
      aria-hidden="true"
      focusable="false"
      {...props}>
      {/* Top hanging hook */}
      <path d="M12 2v2" />
      {/* Lantern cap */}
      <path d="M7 4h10" />
      {/* Body frame */}
      <path d="M8 4v3l-1 1v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V8l-1-1V4" />
      {/* Vertical strut highlights */}
      <path d="M9 8v10" opacity="0.55" />
      <path d="M15 8v10" opacity="0.55" />
      {/* Floor */}
      <path d="M9 19h6" />
      {/* Flame halo */}
      {glow && (
        <circle
          cx="12"
          cy="12.5"
          r="2.4"
          fill="currentColor"
          fillOpacity="0.18"
          stroke="none"
        />
      )}
      {/* Flame */}
      <path
        d="M12 9.6c-1 1-1.3 1.9-1.3 2.7 0 .9.6 1.5 1.3 1.5s1.3-.6 1.3-1.5c0-.8-.3-1.7-1.3-2.7z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  )
}
