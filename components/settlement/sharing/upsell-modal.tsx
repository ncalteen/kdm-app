'use client'

import { LanternMark } from '@/components/generic/lantern-mark'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { startCheckout } from '@/lib/dal/user-subscription'
import { ERROR_MESSAGE, STRIPE_REDIRECT_MESSAGE } from '@/lib/messages'
import { BillingPlanId } from '@/schemas/billing-checkout-input'
import { Loader2, UsersIcon } from 'lucide-react'
import { ReactElement, useState } from 'react'
import { toast } from 'sonner'
import { ZodError } from 'zod'

/**
 * Upsell Modal Properties
 */
interface UpsellModalProps {
  /** Dialog Open State */
  open: boolean
  /** Dialog Open/Close Callback */
  onOpenChange: (open: boolean) => void
}

/**
 * Upsell Bullet Properties
 */
interface UpsellBulletProps {
  /** Bullet Heading */
  heading: string
  /** Bullet Body Copy */
  body: string
}

/**
 * Upsell Bullet Component
 *
 * Tiny presentational helper that pairs a glowing lantern mark with a
 * heading / body line. Kept inline (not exported) because the styling is
 * tightly coupled to the modal's layout and is not reused elsewhere.
 *
 * @param props Upsell Bullet Properties
 * @returns Upsell Bullet Component
 */
function UpsellBullet({ heading, body }: UpsellBulletProps): ReactElement {
  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/30"
        aria-hidden="true">
        <LanternMark className="h-3.5 w-3.5" />
      </span>
      <div className="space-y-0.5">
        <div className="text-sm font-medium leading-tight">{heading}</div>
        <div className="text-xs text-muted-foreground leading-snug">{body}</div>
      </div>
    </li>
  )
}

/**
 * Upsell Modal Component
 *
 * Paywall affordance shown to free-tier settlement owners who attempt to
 * invite a collaborator. The free-tier UI in
 * {@link import('./collaborators-panel').CollaboratorsPanel} swaps the
 * invite form for an "Invite Survivors" trigger button; clicking that
 * trigger opens this modal.
 *
 * Per the spec in issue #166:
 *
 *   - Title:        "Light another lantern"
 *   - Body:         Explains the $5 / month Lantern Hoard tier and the
 *                   "owner-only" gate (collaborators do not need their own
 *                   subscription).
 *   - Primary CTA:  "Subscribe" → routes to Stripe Checkout via
 *                   `startCheckout(BillingPlanId.LANTERN_HOARD)`.
 *   - Secondary:    "Maybe later" → closes the modal without redirecting.
 *
 * Both buttons are disabled while the Checkout URL is in flight so the user
 * cannot double-submit. On failure we surface either the ZodError message
 * (validation failure from the DAL) or the generic darkness-swallows copy.
 *
 * @param props Upsell Modal Properties
 * @returns Upsell Modal Component
 */
export function UpsellModal({
  open,
  onOpenChange
}: UpsellModalProps): ReactElement {
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false)

  /**
   * Handle Subscribe
   *
   * Centralises the toast + Checkout-URL + redirect dance. The button is
   * disabled for the duration so the user cannot double-tap; on failure we
   * restore the button and surface either the Zod error message (when the
   * DAL re-throws a validation failure) or the generic darkness-swallows
   * copy.
   */
  const handleSubscribe = async (): Promise<void> => {
    setIsRedirecting(true)
    toast.info(STRIPE_REDIRECT_MESSAGE())

    try {
      const url = await startCheckout(BillingPlanId.LANTERN_HOARD)

      // Full-page navigation: Stripe's hosted Checkout cannot be embedded.
      window.location.assign(url)
    } catch (error) {
      console.error('Upsell Modal Checkout Error:', error)

      const message =
        error instanceof ZodError ? error.message : ERROR_MESSAGE()

      toast.error(message)
      setIsRedirecting(false)
    }
  }

  /**
   * Handle Maybe Later
   *
   * Closes the modal without redirecting. Disabled while a Checkout URL is
   * in flight so the user cannot dismiss the dialog mid-navigation (the
   * full-page redirect would otherwise race the unmount).
   */
  const handleMaybeLater = (): void => {
    if (isRedirecting) return

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={isRedirecting ? undefined : onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        {/* Hero: a glowing lantern set against a radial amber wash. The
            inner glow is a pair of stacked blurred halos so the mark
            reads as the source of light, not the rim of it. */}
        <div className="relative flex justify-center pt-2 pb-1">
          <div
            className="absolute inset-x-0 top-1/2 h-32 -translate-y-1/2 bg-[radial-gradient(closest-side,var(--color-amber-500),transparent_70%)] opacity-25"
            aria-hidden="true"
          />
          <div className="relative flex h-16 w-16 items-center justify-center">
            <span
              className="absolute inset-0 rounded-full bg-amber-500/30 blur-xl"
              aria-hidden="true"
            />
            <span
              className="absolute inset-1 rounded-full bg-amber-400/20 blur-md"
              aria-hidden="true"
            />
            <LanternMark className="relative h-12 w-12 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.55)]" />
          </div>
        </div>

        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-center text-xl">
            Light another lantern
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            Sharing this settlement requires lighting a new lantern.
          </DialogDescription>
        </DialogHeader>

        <p className="text-center text-sm text-muted-foreground">
          Subscribe for{' '}
          <span className="font-medium text-foreground">$5 a month</span> to
          share the watch with up to your full hunting party.
        </p>

        <ul className="space-y-3 rounded-md border border-border/60 bg-muted/40 p-4">
          <UpsellBullet
            heading="Share the watch"
            body="Invite fellow survivors to view and edit this settlement."
          />
          <UpsellBullet
            heading="Only the keeper subscribes"
            body="Collaborators don't need their own subscription."
          />
          <UpsellBullet
            heading="Unlimited settlements"
            body="Found as many settlements as your stories demand."
          />
        </ul>

        <p className="text-center text-xs text-muted-foreground italic">
          On cancel, existing collaborators retain access through the billing
          cycle.
        </p>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <Button
            type="button"
            variant="ghost"
            disabled={isRedirecting}
            onClick={handleMaybeLater}>
            Maybe later
          </Button>
          <Button
            type="button"
            disabled={isRedirecting}
            onClick={handleSubscribe}>
            {isRedirecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UsersIcon className="h-4 w-4" />
            )}
            Subscribe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
