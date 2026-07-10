import { createClient } from '@/lib/supabase/client'
import { SubscriptionPlanDetail } from '@/lib/types'

const SUBSCRIPTION_PLAN_SELECT = `
  display_name,
  id,
  max_collaborators_per_settlement,
  max_owned_settlements,
  may_be_invited,
  may_create_custom,
  may_share,
  monthly_price_cents
`

/**
 * Get Subscription Plans
 *
 * Retrieves the requested subscription plans data.
 *
 * @returns Subscription Plans
 */
export async function getSubscriptionPlans(): Promise<
  SubscriptionPlanDetail[]
> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('subscription_plan')
    .select(SUBSCRIPTION_PLAN_SELECT)
    .order('monthly_price_cents')

  if (error)
    throw new Error(`Error Fetching Subscription Plans: ${error.message}`)

  return data ?? []
}

/**
 * Get Subscription Plan
 *
 * Retrieves the requested subscription plan data.
 *
 * @param id Subscription Plan ID
 * @returns Subscription Plan
 */
export async function getSubscriptionPlan(
  id: string | null | undefined
): Promise<SubscriptionPlanDetail | null> {
  if (!id) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('subscription_plan')
    .select(SUBSCRIPTION_PLAN_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error)
    throw new Error(`Error Fetching Subscription Plan: ${error.message}`)

  return data
}
