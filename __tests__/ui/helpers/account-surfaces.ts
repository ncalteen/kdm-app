import { admin } from '@/__tests__/ui/helpers/supabase'
import { type PlanSlug } from '@/lib/types'

/** Subscription Status Fixture */
export type SubscriptionStatusFixture =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'past_due'
  | 'trialing'

/** Set Admin Role Fixture */
export async function setAdminRoleFixture(userId: string): Promise<void> {
  const { error } = await admin
    .from('user_settings')
    .update({ app_role: 'admin' })
    .eq('user_id', userId)

  if (error) throw new Error(`set admin role failed: ${error.message}`)
}

/** Set Username Renamed At Fixture */
export async function setUsernameRenamedAtFixture({
  userId,
  renamedAt
}: {
  renamedAt: string | null
  userId: string
}): Promise<void> {
  const { error } = await admin
    .from('user_settings')
    .update({ username_renamed_at: renamedAt })
    .eq('user_id', userId)

  if (error) throw new Error(`set username renamed at failed: ${error.message}`)
}

/** Get Username Fixture */
export async function getUsernameFixture(userId: string): Promise<string> {
  const { data, error } = await admin
    .from('user_settings')
    .select('username')
    .eq('user_id', userId)
    .single()

  if (error) throw new Error(`username lookup failed: ${error.message}`)

  return data.username
}

/** Get Avatar URL Fixture */
export async function getAvatarUrlFixture(
  userId: string
): Promise<string | null> {
  const { data, error } = await admin
    .from('user_settings')
    .select('avatar_url')
    .eq('user_id', userId)
    .single()

  if (error) throw new Error(`avatar URL lookup failed: ${error.message}`)

  return data.avatar_url
}

/** Set Subscription Fixture */
export async function setSubscriptionFixture({
  cancelAtPeriodEnd = false,
  currentPeriodEnd = null,
  planId,
  status,
  userId
}: {
  cancelAtPeriodEnd?: boolean
  currentPeriodEnd?: string | null
  planId: PlanSlug
  status: SubscriptionStatusFixture
  userId: string
}): Promise<void> {
  const { error } = await admin
    .from('user_subscription')
    .update({
      cancel_at_period_end: cancelAtPeriodEnd,
      current_period_end: currentPeriodEnd,
      plan_id: planId,
      status
    })
    .eq('user_id', userId)

  if (error) throw new Error(`subscription update failed: ${error.message}`)
}

/** Create Notification Fixture */
export async function createNotificationFixture({
  kind = 'settlement_shared_with_you',
  payload,
  recipientUserId
}: {
  kind?: string
  payload: Record<string, unknown>
  recipientUserId: string
}): Promise<string> {
  const { data, error } = await admin
    .from('notification')
    .insert({ kind, payload, recipient_user_id: recipientUserId })
    .select('id')
    .single()

  if (error) throw new Error(`notification insert failed: ${error.message}`)

  return data.id
}

/** Get Unread Notification Count Fixture */
export async function getUnreadNotificationCountFixture(
  userId: string
): Promise<number> {
  const { count, error } = await admin
    .from('notification')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_user_id', userId)
    .is('read_at', null)

  if (error) throw new Error(`unread count failed: ${error.message}`)

  return count ?? 0
}

/** Notification Is Read Fixture */
export async function notificationIsReadFixture(
  notificationId: string
): Promise<boolean> {
  const { data, error } = await admin
    .from('notification')
    .select('read_at')
    .eq('id', notificationId)
    .single()

  if (error)
    throw new Error(`notification read lookup failed: ${error.message}`)

  return data.read_at !== null
}
