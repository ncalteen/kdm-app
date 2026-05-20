import { getUserId } from '@/lib/dal/user'
import { createClient } from '@/lib/supabase/client'
import { NotificationRow } from '@/lib/types'

/**
 * Get Notifications
 *
 * Fetches the authenticated user's most recent notification rows, newest
 * first. RLS also scopes rows to the recipient, but the explicit
 * `recipient_user_id` filter keeps the query contract and index usage clear.
 *
 * @returns Notification rows for the authenticated user.
 */
export async function getNotifications(): Promise<NotificationRow[]> {
  const userId = await getUserId()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('notification')
    .select('id, recipient_user_id, kind, payload, read_at, created_at')
    .eq('recipient_user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(`Error Fetching Notifications: ${error.message}`)

  return (data ?? []) as NotificationRow[]
}

/**
 * Get Unread Count
 *
 * Counts unread notifications for the authenticated user. Returns zero when
 * PostgREST does not include a count value.
 *
 * @returns Unread notification count.
 */
export async function getUnreadCount(): Promise<number> {
  const userId = await getUserId()
  const supabase = createClient()

  const { count, error } = await supabase
    .from('notification')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_user_id', userId)
    .is('read_at', null)

  if (error)
    throw new Error(
      `Error Fetching Unread Notification Count: ${error.message}`
    )

  return count ?? 0
}

/**
 * Mark Read
 *
 * Marks the provided notification IDs as read for the authenticated user.
 * Empty batches return without touching Supabase.
 *
 * @param ids Notification IDs to mark read.
 */
export async function markRead(ids: string[]): Promise<void> {
  if (ids.length === 0) return

  const userId = await getUserId()
  const supabase = createClient()
  const readAt = new Date().toISOString()

  const { error } = await supabase
    .from('notification')
    .update({ read_at: readAt })
    .eq('recipient_user_id', userId)
    .in('id', ids)
    .is('read_at', null)

  if (error)
    throw new Error(`Error Marking Notifications Read: ${error.message}`)
}

/**
 * Mark All Read
 *
 * Marks every unread notification for the authenticated user as read.
 */
export async function markAllRead(): Promise<void> {
  const userId = await getUserId()
  const supabase = createClient()
  const readAt = new Date().toISOString()

  const { error } = await supabase
    .from('notification')
    .update({ read_at: readAt })
    .eq('recipient_user_id', userId)
    .is('read_at', null)

  if (error)
    throw new Error(`Error Marking All Notifications Read: ${error.message}`)
}
