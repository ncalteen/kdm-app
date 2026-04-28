import { AuthHero } from '@/components/auth/auth-hero'
import { ReactElement, ReactNode } from 'react'

/**
 * Auth Layout
 *
 * Two-column layout used by authentication pages. On desktop, the marketing
 * hero sits on the left and the auth form sits on the right. On mobile, the
 * hero stacks above the form.
 *
 * A subtle radial "lantern glow" gradient sits behind the form to evoke the
 * thematic light-in-the-dark of Kingdom Death.
 *
 * @param props Auth Layout Properties
 * @returns Auth Layout Component
 */
export function AuthLayout({
  children
}: {
  children: ReactNode
}): ReactElement {
  return (
    <div className="relative min-h-svh w-full overflow-hidden">
      {/* Lantern glow — anchors to the form column on desktop, recedes on mobile. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_50%,rgba(251,191,36,0.08),transparent_60%)]"
      />
      {/* Faint vignette to deepen the edges. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.4)_100%)]"
      />

      <div className="relative grid min-h-svh w-full grid-cols-1 lg:grid-cols-2">
        <div className="hidden lg:flex items-center justify-center p-10 xl:p-16">
          <AuthHero />
        </div>

        <div className="flex flex-col items-center justify-center gap-8 p-6 md:p-10">
          <div className="lg:hidden w-full max-w-sm">
            <AuthHero />
          </div>
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  )
}
