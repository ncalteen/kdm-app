'use client'

import { useTheme } from 'next-themes'
import { CSSProperties } from 'react'
import { Toaster as Sonner, ToasterProps } from 'sonner'

/**
 * Toaster
 *
 * Application-wide notification surface. Tuned for the Kingdom Death mood:
 *
 * - `duration` of 4.5s gives the user time to read the thematic copy without
 *   feeling rushed, but is short enough that stacked notifications don't pile
 *   up during rapid-fire interactions (e.g. toggling combat hit-locations).
 * - `expand` makes hovered toasts fan out so the most recent message is always
 *   legible even when several arrive in quick succession.
 * - `closeButton` lets the user dismiss any toast manually, which is especially
 *   useful for error toasts that the user wants to revisit.
 * - `richColors` paints success/error/info backgrounds in semantic hues that
 *   read well against both the warm and dark backgrounds the app uses.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      position="top-right"
      className="toaster group"
      duration={4500}
      expand
      visibleToasts={4}
      closeButton
      richColors
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)'
        } as CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
