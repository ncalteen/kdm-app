'use client'

import { LanternMark } from '@/components/generic/lantern-mark'
import { ThematicShell } from '@/components/generic/thematic-shell'
import { Button } from '@/components/ui/button'
import { ReactElement } from 'react'

/**
 * Not Found Page
 *
 * Rendered by Next.js when no route matches the requested path. Uses the
 * shared `<ThematicShell>` so the surface stays visually consistent with the
 * auth flow and main bootstrap, and provides a single clear path back to the
 * application.
 *
 * @returns Not Found Page Component
 */
export default function Page(): ReactElement {
  return (
    <ThematicShell>
      <div className="lantern-fade-in flex min-h-svh w-full flex-col items-center justify-center gap-6 px-6 text-center">
        <LanternMark
          className="h-12 w-12 text-amber-400/90 motion-safe:animate-pulse"
          aria-hidden="true"
        />
        <div className="flex flex-col gap-3 max-w-md">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            404 — Lost in the dark
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            Your eyes cannot pierce the overwhelming darkness.
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            What you seek is not here. Return to the lantern&apos;s light and
            try again.
          </p>
        </div>
        <Button onClick={() => window.location.assign('/')}>
          Return to safety
        </Button>
      </div>
    </ThematicShell>
  )
}
