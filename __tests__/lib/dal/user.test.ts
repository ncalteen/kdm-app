import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the Supabase client module.
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
    signOut: vi.fn()
  },
  from: vi.fn(),
  rpc: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

// Import after mocking so the module picks up the mock.
const {
  getUserId,
  getUserSettings,
  getSettlementForUser,
  addUserSettings,
  updateUserSettings,
  removeUserSettings,
  renameUsername
} = await import('@/lib/dal/user')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getUserSettings', () => {
  const mockUser = { id: 'user-1', email: 'test@example.com' }
  const mockSettings = {
    id: 'settings-1',
    user_id: 'user-1',
    unlocked_killenium_butcher: false,
    unlocked_screaming_nukalope: true,
    unlocked_white_gigalion: false
  }

  it('returns user settings for the authenticated user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: mockSettings,
      error: null
    })
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getUserSettings()

    expect(mockSupabase.from).toHaveBeenCalledWith('user_settings')
    expect(mockSelect).toHaveBeenCalledWith(
      'id, unlocked_killenium_butcher, unlocked_screaming_nukalope, unlocked_white_gigalion, user_id, username, username_renamed_at'
    )
    expect(mockEq).toHaveBeenCalledWith('user_id', mockUser.id)
    expect(mockMaybeSingle).toHaveBeenCalledOnce()
    expect(result).toEqual(mockSettings)
  })

  it('throws an error when no user is authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(getUserSettings()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws an error when the query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database error' }
    })
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getUserSettings()).rejects.toThrow(
      'Error Fetching User Settings: Database error'
    )
  })
})

describe('getUserId', () => {
  it('returns the user ID for the authenticated user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null
    })

    const result = await getUserId()
    expect(result).toBe('user-1')
  })

  it('throws and signs out when there is an auth error', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth failed' }
    })
    mockSupabase.auth.signOut.mockResolvedValue({})

    await expect(getUserId()).rejects.toThrow(
      'Error Fetching User: Auth failed'
    )
    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
  })

  it('throws when no user is authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(getUserId()).rejects.toThrow('Not Authenticated')
  })
})

describe('getSettlementForUser', () => {
  const mockUser = { id: 'user-1' }

  it('returns owned and shared settlements with owner usernames', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const ownedSettlement = {
      campaign_type: 'PEOPLE_OF_THE_LANTERN',
      id: 'set-1',
      settlement_name: 'My Settlement'
    }
    const sharedSettlement = {
      campaign_type: 'PEOPLE_OF_THE_LANTERN',
      id: 'set-2',
      settlement_name: 'Shared Settlement'
    }

    const mockOwnedEq = vi.fn().mockResolvedValue({
      data: [ownedSettlement],
      error: null
    })
    const mockOwnedSelect = vi.fn().mockReturnValue({ eq: mockOwnedEq })

    const mockSharedEq = vi.fn().mockResolvedValue({
      data: [{ settlement: sharedSettlement }],
      error: null
    })
    const mockSharedSelect = vi.fn().mockReturnValue({ eq: mockSharedEq })

    mockSupabase.from
      .mockReturnValueOnce({ select: mockOwnedSelect })
      .mockReturnValueOnce({ select: mockSharedSelect })

    mockSupabase.rpc.mockResolvedValue({
      data: [{ settlement_id: 'set-2', username: 'lanternbearer' }],
      error: null
    })

    const result = await getSettlementForUser()
    expect(mockSupabase.rpc).toHaveBeenCalledWith(
      'get_shared_settlement_owners'
    )
    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({
      ...ownedSettlement,
      role: 'owner',
      owner_username: null
    })
    expect(result[1]).toMatchObject({
      ...sharedSettlement,
      role: 'collaborator',
      owner_username: 'lanternbearer'
    })
  })

  it('falls back to null owner_username when the RPC returns no row for a shared settlement', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const sharedSettlement = {
      campaign_type: 'PEOPLE_OF_THE_LANTERN',
      id: 'set-2',
      settlement_name: 'Shared Settlement'
    }

    const mockOwnedEq = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockOwnedSelect = vi.fn().mockReturnValue({ eq: mockOwnedEq })

    const mockSharedEq = vi.fn().mockResolvedValue({
      data: [{ settlement: sharedSettlement }],
      error: null
    })
    const mockSharedSelect = vi.fn().mockReturnValue({ eq: mockSharedEq })

    mockSupabase.from
      .mockReturnValueOnce({ select: mockOwnedSelect })
      .mockReturnValueOnce({ select: mockSharedSelect })

    mockSupabase.rpc.mockResolvedValue({ data: [], error: null })

    const result = await getSettlementForUser()
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      ...sharedSettlement,
      role: 'collaborator',
      owner_username: null
    })
  })

  it('throws when owned settlements query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockOwnedEq = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'owned error' } })
    const mockOwnedSelect = vi.fn().mockReturnValue({ eq: mockOwnedEq })

    const mockSharedEq = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockSharedSelect = vi.fn().mockReturnValue({ eq: mockSharedEq })

    mockSupabase.from
      .mockReturnValueOnce({ select: mockOwnedSelect })
      .mockReturnValueOnce({ select: mockSharedSelect })

    mockSupabase.rpc.mockResolvedValue({ data: [], error: null })

    await expect(getSettlementForUser()).rejects.toThrow(
      'Error Fetching Owned Settlements: owned error'
    )
  })

  it('throws when the owner usernames RPC fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockOwnedEq = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockOwnedSelect = vi.fn().mockReturnValue({ eq: mockOwnedEq })

    const mockSharedEq = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockSharedSelect = vi.fn().mockReturnValue({ eq: mockSharedEq })

    mockSupabase.from
      .mockReturnValueOnce({ select: mockOwnedSelect })
      .mockReturnValueOnce({ select: mockSharedSelect })

    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: { message: 'rpc error' }
    })

    await expect(getSettlementForUser()).rejects.toThrow(
      'Error Fetching Settlement Owner Usernames: rpc error'
    )
  })
})

describe('addUserSettings', () => {
  it('inserts and returns user settings', async () => {
    const mockData = {
      id: 'us-1',
      user_id: 'user-1',
      username: 'tester',
      unlocked_killenium_butcher: false,
      unlocked_screaming_nukalope: false,
      unlocked_white_gigalion: false
    }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: mockData, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addUserSettings({
      user_id: 'user-1',
      username: 'tester'
    })
    expect(result).toEqual(mockData)
  })

  it('throws on DB error', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'insert error' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addUserSettings({ user_id: 'user-1', username: 'tester' })
    ).rejects.toThrow('Error Adding User Settings: insert error')
  })
})

describe('updateUserSettings', () => {
  it('updates user settings', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await updateUserSettings('us-1', { username: 'updated' })

    expect(mockSupabase.from).toHaveBeenCalledWith('user_settings')
    expect(mockUpdate).toHaveBeenCalledWith({ username: 'updated' })
    expect(mockEq).toHaveBeenCalledWith('id', 'us-1')
  })

  it('throws on DB error', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'update error' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(updateUserSettings('us-1', {})).rejects.toThrow(
      'Error Updating User Settings: update error'
    )
  })
})

describe('removeUserSettings', () => {
  it('removes user settings', async () => {
    const mockEqUser = vi.fn().mockResolvedValue({ error: null })
    const mockEq = vi.fn().mockReturnValue({ eq: mockEqUser })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null
    })

    await removeUserSettings('us-1')

    expect(mockSupabase.from).toHaveBeenCalledWith('user_settings')
    expect(mockEq).toHaveBeenCalledWith('id', 'us-1')
    expect(mockEqUser).toHaveBeenCalledWith('user_id', 'user-1')
  })

  it('throws on DB error', async () => {
    const mockEqUser = vi
      .fn()
      .mockResolvedValue({ error: { message: 'delete error' } })
    const mockEq = vi.fn().mockReturnValue({ eq: mockEqUser })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null
    })

    await expect(removeUserSettings('us-1')).rejects.toThrow(
      'Error Removing User Settings: delete error'
    )
  })
})

describe('renameUsername', () => {
  it('returns invalid-format for too-short usernames without calling RPC', async () => {
    const result = await renameUsername('ab')

    expect(result).toBe('invalid-format')
    expect(mockSupabase.rpc).not.toHaveBeenCalled()
  })

  it('returns invalid-format for usernames with disallowed characters', async () => {
    const result = await renameUsername('has space')

    expect(result).toBe('invalid-format')
    expect(mockSupabase.rpc).not.toHaveBeenCalled()
  })

  it('returns invalid-format for too-long usernames', async () => {
    const result = await renameUsername('a'.repeat(21))

    expect(result).toBe('invalid-format')
    expect(mockSupabase.rpc).not.toHaveBeenCalled()
  })

  it('returns success when the RPC reports the rename was applied', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: true, error: null })

    const result = await renameUsername('new_handle')

    expect(result).toBe('success')
    expect(mockSupabase.rpc).toHaveBeenCalledWith('rename_username', {
      new_username: 'new_handle'
    })
  })

  it('returns collision when the RPC reports a name conflict', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: false, error: null })

    const result = await renameUsername('taken_name')

    expect(result).toBe('collision')
  })

  it('returns rate-limited when the RPC raises rate-limited', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: { message: 'rate-limited' }
    })

    const result = await renameUsername('hurry_hurry')

    expect(result).toBe('rate-limited')
  })

  it('returns invalid-format when the RPC raises invalid-format', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: { message: 'invalid-format' }
    })

    const result = await renameUsername('serverside_check_only')

    expect(result).toBe('invalid-format')
  })

  it('throws on unexpected RPC errors', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: { message: 'connection lost' }
    })

    await expect(renameUsername('valid_name')).rejects.toThrow(
      'Error Renaming Username: connection lost'
    )
  })
})
