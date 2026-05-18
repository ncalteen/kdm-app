import { z } from 'zod'

/**
 * Billing Plan ID
 *
 * Identifiers for the paid `subscription_plan` rows that the checkout route
 * accepts. `free` is the implicit default for every user and is not a valid
 * Checkout target — downgrades flow through the Customer Portal, not this
 * endpoint.
 */
export enum BillingPlanId {
  /** Lantern Plan (Unlimited Settlements) */
  LANTERN = 'lantern',
  /** Lantern Hoard Plan (Settlement Sharing) */
  LANTERN_HOARD = 'lantern_hoard'
}

/**
 * Billing Checkout Input Schema
 *
 * Validates the JSON body posted to `POST /api/billing/checkout`. Callers
 * must specify which paid plan the resulting Stripe Checkout session should
 * be configured for.
 */
export const BillingCheckoutInputSchema = z.object({
  /** Target Subscription Plan */
  planId: z.enum(BillingPlanId, {
    message: 'A plan must be selected to light the lantern.'
  })
})

/**
 * Billing Checkout Input
 */
export type BillingCheckoutInput = z.infer<typeof BillingCheckoutInputSchema>
