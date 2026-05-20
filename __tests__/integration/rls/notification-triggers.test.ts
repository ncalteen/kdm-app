import {
  admin,
  createTestUser,
  deleteTestUser,
  seedSettlement,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

interface NotificationPayload {
  /** Owner User ID */
  owner_user_id?: string
  /** Owner Username */
  owner_username?: string
  /** Settlement ID */
  settlement_id?: string
  /** Settlement Name */
  settlement_name?: string
}

interface NotificationRow {
  /** Notification Kind */
  kind: string
  /** Notification Payload */
  payload: NotificationPayload
}

/**
 * RLS — Notification Triggers
 *
 * Verifies the SECURITY DEFINER trigger layer from issue #176. Sharing a
 * settlement writes an inbox row for the invitee, and removing that share
 * writes a second row that remains visible after the recipient loses access to
 * the settlement itself.
 */
describe('RLS: notification triggers', () => {
  let owner: TestUser
  let collaborator: TestUser
  let settlementId: string
  let ownerUsername: string

  beforeAll(async () => {
    owner = await createTestUser()
    collaborator = await createTestUser()
    settlementId = await seedSettlement(owner.id, 'E4.6 Trigger Settlement')

    const { error: subscriptionError } = await admin
      .from('user_subscription')
      .update({ plan_id: 'lantern_hoard', status: 'active' })
      .eq('user_id', owner.id)
    expect(subscriptionError).toBeNull()

    const { data: ownerSettings, error: ownerSettingsError } = await admin
      .from('user_settings')
      .select('username')
      .eq('user_id', owner.id)
      .single<{ username: string }>()
    expect(ownerSettingsError).toBeNull()
    ownerUsername = ownerSettings?.username ?? ''
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(collaborator.id)
  })

  /**
   * Get Collaborator Notifications
   *
   * Reads notification rows through the collaborator's authenticated client so
   * the assertion exercises the recipient SELECT policy rather than service
   * role bypass.
   *
   * @returns Notification Rows
   */
  async function getCollaboratorNotifications(): Promise<NotificationRow[]> {
    const { data, error } = await collaborator.client
      .from('notification')
      .select('kind, payload')
      .order('created_at', { ascending: true })
      .returns<NotificationRow[]>()

    expect(error).toBeNull()
    return data ?? []
  }

  it('writes recipient-visible notifications on share insert and delete', async () => {
    const { error: shareError } = await owner.client
      .from('settlement_shared_user')
      .insert({
        settlement_id: settlementId,
        shared_user_id: collaborator.id,
        user_id: owner.id
      })
    expect(shareError).toBeNull()

    const afterShare = await getCollaboratorNotifications()
    expect(afterShare).toHaveLength(1)
    expect(afterShare[0]).toEqual({
      kind: 'settlement_shared_with_you',
      payload: {
        owner_user_id: owner.id,
        owner_username: ownerUsername,
        settlement_id: settlementId,
        settlement_name: 'E4.6 Trigger Settlement'
      }
    })

    const { data: deletedShare, error: unshareError } = await owner.client
      .from('settlement_shared_user')
      .delete()
      .eq('settlement_id', settlementId)
      .eq('shared_user_id', collaborator.id)
      .select('shared_user_id')
      .single<{ shared_user_id: string }>()
    expect(unshareError).toBeNull()
    expect(deletedShare?.shared_user_id).toBe(collaborator.id)

    const { data: inaccessibleSettlement, error: inaccessibleSettlementError } =
      await collaborator.client
        .from('settlement')
        .select('id')
        .eq('id', settlementId)
    expect(inaccessibleSettlementError).toBeNull()
    expect(inaccessibleSettlement ?? []).toEqual([])

    const { data: inaccessibleShare, error: inaccessibleShareError } =
      await collaborator.client
        .from('settlement_shared_user')
        .select('shared_user_id')
        .eq('settlement_id', settlementId)
    expect(inaccessibleShareError).toBeNull()
    expect(inaccessibleShare ?? []).toEqual([])

    const afterUnshare = await getCollaboratorNotifications()
    expect(afterUnshare).toHaveLength(2)
    expect(afterUnshare[1]).toEqual({
      kind: 'removed_from_settlement',
      payload: {
        settlement_id: settlementId,
        settlement_name: 'E4.6 Trigger Settlement'
      }
    })
  })
})
