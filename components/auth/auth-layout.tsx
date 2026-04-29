import { AuthHero } from '@/components/auth/auth-hero'
import { ThematicShell } from '@/components/generic/thematic-shell'
import { ReactElement, ReactNode } from 'react'

/**
 * Auth Layout Properties
 */
interface AuthLayoutProps {
  /** Auth form (or terminal-flow card) rendered in the right column. */
  children: ReactNode
  /**
   * When `true`, renders the form centered in a single column without the
   * marketing hero. Useful for transient confirmation/error states where
   * the hero would feel redundant. Defaults to `false`.
   */
  hideHero?: boolean
}

/**
 * Auth Layout
 *
 * Shared layout used by every authentication-adjacent page (login, sign-up,
 * forgot-password, update-password, sign-up-success, error). On desktop, the
 * marketing hero sits on the left and the form/card sits on the right; on
 * mobile, the hero stacks above the form. All variants share the same
 * `<ThematicShell>` atmospherics so the visual language stays consistent.
 *
 * Pass `hideHero` for transient terminal-flow surfaces (confirmation /
 * error) where the marketing pitch would feel out of place.
 *
 * @param props Auth Layout Properties
 * @returns Auth Layout Component
 */
export function AuthLayout({
  children,
  hideHero = false
}: AuthLayoutProps): ReactElement {
  if (hideHero) {
    return (
      <ThematicShell>
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </ThematicShell>
    )
  }

  return (
    <ThematicShell>
      <div className="grid min-h-svh w-full grid-cols-1 lg:grid-cols-2">
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
    </ThematicShell>
  )
}
