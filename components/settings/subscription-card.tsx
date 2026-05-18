'use client'

import { LanternMark } from '@/components/generic/lantern-mark'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { useLocal } from '@/contexts/local-context'
import { PLAN_ORDER } from '@/lib/common'
import { openPortal, startCheckout } from '@/lib/dal/user-subscription'
import { ERROR_MESSAGE, STRIPE_REDIRECT_MESSAGE } from '@/lib/messages'
import { PlanSlug, UserSubscriptionDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { BillingPlanId } from '@/schemas/billing-checkout-input'
import { Loader2 } from 'lucide-react'
import { ReactElement, useState } from 'react'
import { toast } from 'sonner'
import { ZodError } from 'zod'

/**
 * Plan Metadata
 *
 * Display block for a single plan card. Hard-coded here because the DAL
 * only returns `plan_id` and we do not want a second round-trip just to
 * render labels. Plan IDs are stable per the `subscription_plan` migration
 * contract; the display strings are free to diverge from the DB if the
 * brand copy changes.
 */
interface PlanMetadata {
  /** Display Name */
  name: string
  /** Price Label (doubles as the badge for non-current plans) */
  price: string
  /** Card Subtitle */
  tagline: string
  /** Card Body Copy */
  description: string
}

const PLAN_METADATA: Record<PlanSlug, PlanMetadata> = {
  free: {
    name: 'Wanderer',
    price: 'Free',
    tagline: 'You walk the plain of stone faces alone.',
    description:
      'You may create up to five settlements. You may not share your settlement(s) with other survivors.'
  },
  lantern: {
    name: 'Lantern',
    price: '$1 / month',
    tagline: 'Light more lanterns, push back the darkness.',
    description:
      'You may create an unlimited number of settlements. You may not share your settlement(s) with other survivors.'
  },
  lantern_hoard: {
    name: 'Lantern Hoard',
    price: '$5 / month',
    tagline: 'Survivors gather. Their stories intertwine.',
    description:
      'You may create an unlimited number of settlements. You may share settlement(s) with other survivors. Collaborators do not need their own subscription to view or edit a settlement you share with them.'
  }
}

/**
 * Status Display Names
 *
 * Maps the `user_subscription.status` CHECK values to short, themed labels
 * shown in the status pill. `incomplete` is treated as a warning state
 * because it indicates the initial payment did not finalize and the
 * subscription is not yet entitled.
 */
const STATUS_DISPLAY_NAMES: Record<string, string> = {
  active: 'Active',
  trialing: 'Trial',
  past_due: 'Payment Past Due',
  canceled: 'Canceled',
  incomplete: 'Incomplete'
}

/**
 * Active Statuses
 *
 * Subscription statuses that grant the user paid-tier entitlements. Matches
 * the predicate used by the `user_can_share()` Postgres function so the UI
 * and database agree on what "active" means.
 */
const ACTIVE_STATUSES: ReadonlyArray<UserSubscriptionDetail['status']> = [
  'active',
  'trialing'
]

/**
 * Warning Statuses
 *
 * Subscription statuses that require remedial action (re-subscribe, update
 * card, or finish the initial payment).
 */
const WARNING_STATUSES: ReadonlyArray<UserSubscriptionDetail['status']> = [
  'past_due',
  'canceled',
  'incomplete'
]

/**
 * Format Period End
 *
 * Renders a `timestamptz` ISO string from `user_subscription.current_period_end`
 * as a human-friendly date in the user's locale. Returns `null` when the
 * timestamp is missing or unparseable so callers can omit the line entirely
 * rather than render a fallback string.
 *
 * @param value Period End Timestamp
 * @returns Formatted Date String, or null when unavailable.
 */
function formatPeriodEnd(value: string | null): string | null {
  if (!value) return null

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return null

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Resolve Current Plan
 *
 * Coerces the cached subscription's plan slug into the strict `PlanSlug`
 * union. Missing rows, unrecognised slugs, and the seeded `free` row all
 * collapse to `'free'` so the rendering path doesn't need to special-case
 * them. The `null` row case happens briefly between sign-up and the trigger
 * seeding the default `free` row.
 *
 * @param subscription Cached User Subscription
 * @returns Current Plan Slug
 */
function resolveCurrentPlan(
  subscription: UserSubscriptionDetail | null
): PlanSlug {
  if (subscription === null) return 'free'

  if (
    subscription.plan_id === 'lantern' ||
    subscription.plan_id === 'lantern_hoard'
  )
    return subscription.plan_id

  return 'free'
}

/**
 * Plan CTA
 *
 * Combined label + Stripe-side action for a single plan card. `label` is
 * `null` when no CTA should render (e.g., the Wanderer card never has an
 * upgrade button because cancellation flows through the Portal from the
 * user's current paid card).
 */
interface PlanCta {
  /** Button label, or null when the card should render no CTA. */
  label: string | null
  /** Stripe-hosted surface to open when the button is clicked. */
  action: 'checkout' | 'portal'
  /** Target plan for `action === 'checkout'`. */
  planId?: BillingPlanId
}

/**
 * Resolve Plan CTA
 *
 * Decision matrix for which CTA each plan card surfaces given the user's
 * current plan + status. Centralised here so the JSX stays declarative.
 *
 * @param plan Target Plan
 * @param currentPlan User Current Plan
 * @param status User Current Subscription Status
 * @returns Plan CTA
 */
function resolvePlanCta(
  plan: PlanSlug,
  currentPlan: PlanSlug,
  status: UserSubscriptionDetail['status'] | null
): PlanCta {
  const isCurrent = plan === currentPlan
  const isWarning = status !== null && WARNING_STATUSES.includes(status)
  const isActive = status !== null && ACTIVE_STATUSES.includes(status)

  if (isCurrent) {
    // Free has no manage / restore surface — the user must take a positive
    // action to leave it via one of the paid offers.
    if (currentPlan === 'free') return { label: null, action: 'portal' }

    if (isWarning)
      // Canceled subscriptions need a fresh Checkout against the same tier
      // they had. Past-due / incomplete go through the Portal so the user
      // can retry payment or update their card.
      return status === 'canceled'
        ? {
            label: 'Restore the lantern',
            action: 'checkout',
            planId: currentPlan as BillingPlanId
          }
        : { label: 'Restore the lantern', action: 'portal' }

    if (isActive) return { label: 'Manage subscription', action: 'portal' }

    return { label: null, action: 'portal' }
  }

  // Non-current
  if (plan === 'free')
    // Free isn't a Checkout target. Downgrades / cancellation happen via
    // the Portal, which the current paid card already surfaces.
    return { label: null, action: 'portal' }

  if (currentPlan === 'free')
    // Fresh upgrade from the free tier → Checkout.
    return {
      label:
        plan === 'lantern'
          ? 'Light a Lantern — $1 / month'
          : 'Light a Lantern Hoard — $5 / month',
      action: 'checkout',
      planId: plan as BillingPlanId
    }

  if (isActive)
    // Tier switch on an active paid subscription → Portal (Stripe handles
    // proration and the actual plan change).
    return {
      label:
        plan === 'lantern' ? 'Switch to Lantern' : 'Upgrade to Lantern Hoard',
      action: 'portal'
    }

  // Warning state on a paid plan — only the current card's Restore CTA is
  // surfaced; other tiers stay quiet until the user is back in good standing.
  return { label: null, action: 'portal' }
}

/**
 * Resolve Status Note
 *
 * The themed copy shown directly under a plan's description when it is the
 * user's current plan and the subscription is in a notable state. Returns
 * `null` when no extra line is appropriate (e.g., current free user, or a
 * non-current plan).
 *
 * @param plan Plan Slug Being Rendered
 * @param currentPlan User Current Plan
 * @param status User Current Subscription Status
 * @param periodEnd Formatted Period End (or null)
 * @returns Status Note, or null when none should render.
 */
function resolveStatusNote(
  plan: PlanSlug,
  currentPlan: PlanSlug,
  status: UserSubscriptionDetail['status'] | null,
  periodEnd: string | null
): string | null {
  if (plan !== currentPlan || currentPlan === 'free' || status === null)
    return null

  if (status === 'trialing' && periodEnd)
    return `Your trial renews on ${periodEnd}.`

  if (status === 'active' && periodEnd) return `Next renewal: ${periodEnd}.`

  if (status === 'past_due')
    return 'Your payment did not clear. Tend to it before the darkness closes in.'

  if (status === 'incomplete')
    return 'The initial payment did not finalize. Finish it to claim your settlement.'

  if (status === 'canceled')
    return periodEnd
      ? `Your watch ended on ${periodEnd}. Rekindle the lantern to push past the boundary again.`
      : 'Your watch has ended. Rekindle the lantern to push past the boundary again.'

  return null
}

/**
 * Subscription Card Component
 *
 * Surfaces the user's current paid-tier state and routes every purchase /
 * self-service action through Stripe-hosted UIs. The app deliberately does
 * not implement its own billing surface — Stripe Checkout creates new
 * subscriptions; the Stripe Customer Portal handles updates, plan changes,
 * payment-method edits, invoices, and cancellation.
 *
 * Layout is uniform across all states: a three-column grid of plan cards
 * (Wanderer / Lantern / Lantern Hoard). The user's current plan is
 * highlighted with a coloured ring, a status badge, and a "Current plan"
 * pill so it is unambiguous which tier they hold. CTAs adapt to context:
 *
 * - Free users see Checkout buttons on each paid tier.
 * - Active paid users see a "Manage subscription" button on their current
 *   tier (→ Portal) and a "Switch / Upgrade" button on the other paid tier
 *   (also → Portal — Stripe owns the plan-change UX).
 * - Past-due / canceled / incomplete users see a "Restore the lantern"
 *   button on their current tier; other tiers stay quiet until the user is
 *   back in good standing.
 *
 * Every CTA fires a single themed toast and disables every button while the
 * browser is awaiting the Stripe URL so the user cannot double-submit.
 *
 * @returns Subscription Card Component
 */
export function SubscriptionCard(): ReactElement {
  const { userSubscription } = useLocal()
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false)

  /**
   * Handle Stripe Redirect
   *
   * Centralizes the toast + DAL-call + redirect dance for both Checkout and
   * Customer Portal flows. The button is disabled for the duration so the
   * user cannot double-tap; on failure we restore the button and surface
   * either the Zod error message (when the DAL re-throws a validation
   * failure) or the generic darkness-swallows copy.
   *
   * @param action Which Stripe-hosted surface to open.
   * @param planId Target plan ID when `action === 'checkout'`.
   */
  const handleRedirect = async (
    action: 'checkout' | 'portal',
    planId?: BillingPlanId
  ): Promise<void> => {
    setIsRedirecting(true)
    toast.info(STRIPE_REDIRECT_MESSAGE())

    try {
      const url =
        action === 'checkout' && planId
          ? await startCheckout(planId)
          : await openPortal()

      // Full-page navigation: Stripe's hosted pages cannot be embedded.
      window.location.assign(url)
    } catch (error) {
      console.error('Subscription Redirect Error:', error)

      const message =
        error instanceof ZodError ? error.message : ERROR_MESSAGE()

      toast.error(message)
      setIsRedirecting(false)
    }
  }

  const currentPlan = resolveCurrentPlan(userSubscription)
  const currentStatus = userSubscription?.status ?? null
  const periodEnd = formatPeriodEnd(
    userSubscription?.current_period_end ?? null
  )
  const isWarning =
    currentStatus !== null && WARNING_STATUSES.includes(currentStatus)

  return (
    <div className="flex flex-col gap-2 pt-12 px-2">
      <div className="grid gap-2 md:grid-cols-3">
        {PLAN_ORDER.map((plan) => {
          const meta = PLAN_METADATA[plan]
          const isCurrent = plan === currentPlan
          const cta = resolvePlanCta(plan, currentPlan, currentStatus)
          const statusNote = resolveStatusNote(
            plan,
            currentPlan,
            currentStatus,
            periodEnd
          )

          // Current-plan badge swaps the price for the live status label
          // (Active / Trial / Past Due / etc.) on paid plans, and keeps the
          // "Free" label on the Wanderer card. Non-current plans always
          // show their price.
          const badgeLabel = isCurrent
            ? currentPlan === 'free'
              ? meta.price
              : (STATUS_DISPLAY_NAMES[currentStatus ?? 'active'] ??
                currentStatus ??
                'Active')
            : meta.price

          return (
            <Card
              key={plan}
              data-plan={plan}
              data-current={isCurrent ? 'true' : 'false'}
              className={cn(
                'p-0 flex flex-col h-full',
                isCurrent &&
                  isWarning &&
                  'border-destructive/60 ring-2 ring-destructive/30',
                isCurrent &&
                  !isWarning &&
                  'border-amber-400/60 ring-2 ring-amber-400/30'
              )}>
              <CardHeader className="px-4 pt-3 pb-1">
                <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                  <LanternMark
                    className="h-5 w-5 text-amber-400/90"
                    aria-hidden="true"
                  />
                  {meta.name}
                  <Badge
                    variant={
                      isCurrent
                        ? isWarning
                          ? 'destructive'
                          : 'default'
                        : 'secondary'
                    }
                    className="ml-1">
                    {badgeLabel}
                  </Badge>
                  {isCurrent ? (
                    <Badge variant="outline" className="ml-1">
                      Current plan
                    </Badge>
                  ) : null}
                </CardTitle>
                <CardDescription>{meta.tagline}</CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-2 flex flex-col gap-3 flex-1">
                <p className="text-sm text-muted-foreground">
                  {meta.description}
                </p>
                {statusNote ? (
                  <p className="text-sm text-muted-foreground">{statusNote}</p>
                ) : null}
                {cta.label ? (
                  <Button
                    onClick={() => handleRedirect(cta.action, cta.planId)}
                    disabled={isRedirecting}
                    variant={isCurrent && !isWarning ? 'outline' : 'default'}
                    className="w-fit mt-auto">
                    {isRedirecting ? (
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                    ) : null}
                    {cta.label}
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
