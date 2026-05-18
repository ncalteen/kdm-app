import {
  BillingCheckoutInputSchema,
  BillingPlanId
} from '@/schemas/billing-checkout-input'
import { describe, expect, it } from 'vitest'

describe('BillingCheckoutInputSchema', () => {
  it('accepts the Lantern plan', () => {
    const result = BillingCheckoutInputSchema.parse({
      planId: BillingPlanId.LANTERN
    })
    expect(result.planId).toBe('lantern')
  })

  it('accepts the Lantern Hoard plan', () => {
    const result = BillingCheckoutInputSchema.parse({
      planId: BillingPlanId.LANTERN_HOARD
    })
    expect(result.planId).toBe('lantern_hoard')
  })

  it('rejects the free plan', () => {
    const result = BillingCheckoutInputSchema.safeParse({ planId: 'free' })
    expect(result.success).toBe(false)
  })

  it('rejects an unknown plan ID', () => {
    const result = BillingCheckoutInputSchema.safeParse({
      planId: 'platinum'
    })
    expect(result.success).toBe(false)
  })

  it('rejects a missing plan ID', () => {
    const result = BillingCheckoutInputSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('surfaces the lantern-themed message on invalid plan', () => {
    const result = BillingCheckoutInputSchema.safeParse({ planId: 'free' })
    expect(result.success).toBe(false)
    if (!result.success)
      expect(result.error.issues[0].message).toMatch(/lantern/i)
  })
})
