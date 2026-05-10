import { getUserId } from '@/lib/dal/user'
import { createClient } from '@/lib/supabase/client'

/**
 * Settlement Collaborator Detail
 *
 * Row shape returned by {@link getSettlementSharedUsers}. Includes the
 * fields the share-management panel needs to render each collaborator
 * row: identifier, display name, optional avatar, and the timestamp of
 * when the share was created (used for "Joined: 14 days ago").
 */
export interface SettlementCollaboratorDetail {
  /** Shared User ID */
  shared_user_id: string
  /** Username */
  username: string
  /** Avatar URL (OAuth-supplied; nullable) */
  avatar_url: string | null
  /** Share Created At (ISO 8601) */
  created_at: string
}

/**
 * Get Settlement Shared Users
 *
 * Retrieves all users a settlement is shared with, including their
 * username and avatar from `user_settings` and the share's `created_at`
 * timestamp from the junction row. The full shape is what the
 * collaborators panel renders, so consumers do not need a second round
 * trip to look up display data.
 *
 * Goes through the `get_settlement_collaborators` SECURITY DEFINER RPC
 * because RLS on `user_settings` blocks the settlement owner from
 * reading collaborators' usernames and avatars directly. The RPC scopes
 * results to settlements the caller owns; collaborators on the same
 * settlement get an empty list (matching the SELECT-only contract on
 * `settlement_shared_user`).
 *
 * @param settlementId Settlement ID
 * @returns Collaborator List (sorted oldest-share-first for stable order)
 */
export async function getSettlementSharedUsers(
  settlementId: string
): Promise<SettlementCollaboratorDetail[]> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_settlement_collaborators', {
    target_settlement: settlementId
  })

  if (error)
    throw new Error(`Error Fetching Settlement Shared Users: ${error.message}`)

  if (!data || data.length === 0) return []

  return data.map(
    (row: {
      shared_user_id: string
      username: string | null
      avatar_url: string | null
      created_at: string
    }) => ({
      shared_user_id: row.shared_user_id,
      username: row.username ?? '',
      avatar_url: row.avatar_url ?? null,
      created_at: row.created_at
    })
  )
}

/**
 * Add Settlement Shared Users
 *
 * Shares a settlement with other users.
 *
 * @param settlementId Settlement ID
 * @param sharedUserIds Shared User IDs
 * @param userId Owner User ID
 */
export async function addSettlementSharedUsers(
  settlementId: string,
  sharedUserIds: string[],
  userId: string
): Promise<void> {
  if (sharedUserIds.length === 0) return

  const supabase = createClient()

  const { error } = await supabase.from('settlement_shared_user').insert(
    sharedUserIds.map((sharedUserId) => ({
      settlement_id: settlementId,
      shared_user_id: sharedUserId,
      user_id: userId
    }))
  )

  if (error)
    throw new Error(`Error Adding Settlement Shared Users: ${error.message}`)
}

/**
 * Remove Settlement Shared Users
 *
 * Revokes sharing of a settlement with users. Only allows the owner of the
 * resource to revoke sharing.
 *
 * @param settlementId Settlement ID
 * @param sharedUserIds Shared User IDs
 */
export async function removeSettlementSharedUsers(
  settlementId: string,
  sharedUserIds: string[]
): Promise<void> {
  if (sharedUserIds.length === 0) return

  const userId = await getUserId()
  const supabase = createClient()

  const { error } = await supabase
    .from('settlement_shared_user')
    .delete()
    .eq('settlement_id', settlementId)
    .in('shared_user_id', sharedUserIds)
    .eq('user_id', userId)

  if (error)
    throw new Error(`Error Removing Settlement Shared Users: ${error.message}`)
}
