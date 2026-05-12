import { getUserId } from '@/lib/dal/user'
import { createClient } from '@/lib/supabase/client'

/**
 * Get Settlement Member Usernames
 *
 * Returns a `Map<user_id, username>` of every user connected to a
 * settlement — the owner plus every collaborator listed in
 * `settlement_shared_user`. Powers the "By @username" authorship chip on
 * custom catalog rows materialized into `SettlementDetail`'s collections
 * (E2.8 in local/sharing-architecture.md §7.4 / §10 Phase 2 item 2.6).
 *
 * Goes through the `get_settlement_member_usernames` SECURITY DEFINER RPC
 * because RLS on `user_settings` restricts SELECT to the row owner. A
 * direct embedded query
 * (`settlement_<x> → <catalog> → user_settings`) would silently return
 * `null` for every author who is not the calling user. The RPC scopes
 * results to settlements the caller is a member of (owner or
 * collaborator); unrelated callers receive an empty map. Mirrors
 * {@link getSettlementSharedUsers}'s use of `get_settlement_collaborators`.
 *
 * @param settlementId Settlement ID
 * @returns Map of `user_id -> username` for every settlement member
 */
export async function getSettlementMemberUsernames(
  settlementId: string | null | undefined
): Promise<Map<string, string>> {
  if (!settlementId) throw new Error('Required: Settlement ID')

  const supabase = createClient()

  const { data, error } = await supabase.rpc(
    'get_settlement_member_usernames',
    {
      target_settlement: settlementId
    }
  )

  if (error)
    throw new Error(
      `Error Fetching Settlement Member Usernames: ${error.message}`
    )

  const map = new Map<string, string>()
  for (const row of (data ?? []) as {
    user_id: string | null
    username: string | null
  }[]) {
    if (row.user_id && row.username) map.set(row.user_id, row.username)
  }

  return map
}

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

/**
 * Unshare Blocker Detail
 *
 * One catalog row that prevents the owner from revoking a settlement
 * collaborator: the row is `custom`, was authored by the collaborator,
 * and is still attached to the settlement. Surfaced to the share-management
 * panel so the owner can be told what to detach before retrying.
 *
 * `kind` mirrors the catalog table name (e.g. `'knowledge'`, `'gear'`,
 * `'quarry'`); the dialog groups blockers by it. `itemName` is the
 * canonical display string of the row (`knowledge_name`, `gear_name`,
 * `monster_name`, …). `itemId` is provided so future iterations can deep
 * link to the attachment, but the dialog does not need to render it
 * today.
 */
export interface UnshareBlockerDetail {
  /** Catalog Kind (e.g. `knowledge`, `gear`, `quarry`) */
  kind: string
  /** Catalog Display Name */
  itemName: string
  /** Catalog Row ID */
  itemId: string
}

/**
 * Get Unshare Blockers
 *
 * Calls the `get_unshare_blockers` SECURITY DEFINER RPC to enumerate
 * custom catalog rows authored by `sharedUserId` that are still attached
 * to `settlementId`. The owner of the settlement must detach every
 * returned row before {@link removeSettlementSharedUsers} can produce a
 * clean revoke (the catalog rows would otherwise become unreadable to
 * the remaining members of the settlement once the share is dropped).
 *
 * The RPC enforces ownership server-side: collaborators and unrelated
 * callers receive an empty list. Anonymous callers are blocked at the
 * GRANT layer, which surfaces here as a thrown error rather than an
 * empty list.
 *
 * @param settlementId Settlement ID
 * @param sharedUserId Shared User ID (the collaborator about to be revoked)
 * @returns Blocker List (empty when the revoke is safe to proceed)
 */
export async function getUnshareBlockers(
  settlementId: string,
  sharedUserId: string
): Promise<UnshareBlockerDetail[]> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_unshare_blockers', {
    p_settlement_id: settlementId,
    p_shared_user_id: sharedUserId
  })

  if (error)
    throw new Error(`Error Fetching Unshare Blockers: ${error.message}`)

  if (!data || data.length === 0) return []

  return data.map(
    (row: { kind: string; item_name: string; item_id: string }) => ({
      kind: row.kind,
      itemName: row.item_name,
      itemId: row.item_id
    })
  )
}
