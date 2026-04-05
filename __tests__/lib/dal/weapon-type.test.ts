import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  auth: {
    getUser: vi.fn()
  },
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getWeaponTypes,
  addWeaponType,
  updateWeaponType,
  removeWeaponType
} = await import('@/lib/dal/weapon-type')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getWeaponTypes', () => {
  const mockUser = { id: 'user-1' }
  const nonCustomWeaponType = { id: 'wt1', custom: false, weapon_type_name: 'Sword' }
  const userCustomWeaponType = { id: 'wt2', custom: true, weapon_type_name: 'My Weapon Type' }
  const sharedWeaponType = { id: 'wt3', custom: true, weapon_type_name: 'Shared Weapon Type' }

  it('returns weapon types from all three sources', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [nonCustomWeaponType], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [userCustomWeaponType], error: null })
          })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ weapon_type: [sharedWeaponType] }],
            error: null
          })
        })
      })

    const result = await getWeaponTypes()

    expect(result).toEqual({
      wt1: nonCustomWeaponType,
      wt2: userCustomWeaponType,
      wt3: sharedWeaponType
    })
  })

  it('throws when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

    await expect(getWeaponTypes()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(getWeaponTypes()).rejects.toThrow('Error Fetching User: Auth error')
  })

  it('throws when non-custom query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      })

    await expect(getWeaponTypes()).rejects.toThrow('Error Fetching Weapon Types: DB error')
  })

  it('throws when user-custom query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
          })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      })

    await expect(getWeaponTypes()).rejects.toThrow('Error Fetching Weapon Types: DB error')
  })

  it('throws when shared query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
        })
      })

    await expect(getWeaponTypes()).rejects.toThrow('Error Fetching Weapon Types: DB error')
  })

  it('returns empty map when all sources return empty arrays', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      })

    const result = await getWeaponTypes()
    expect(result).toEqual({})
  })
})

describe('addWeaponType', () => {
  const mockUser = { id: 'user-1' }
  const mockWeaponType = { id: 'wt1', custom: false, weapon_type_name: 'Sword' }

  it('inserts a non-custom weapon type without user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    const mockSingle = vi.fn().mockResolvedValue({ data: mockWeaponType, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addWeaponType({ weapon_type_name: 'Sword', custom: false })

    expect(result).toEqual(mockWeaponType)
    expect(mockInsert).toHaveBeenCalledWith({ weapon_type_name: 'Sword', custom: false })
  })

  it('inserts a custom weapon type with user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    const customWeaponType = { id: 'wt2', custom: true, weapon_type_name: 'My Weapon Type' }
    const mockSingle = vi.fn().mockResolvedValue({ data: customWeaponType, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addWeaponType({ weapon_type_name: 'My Weapon Type', custom: true })

    expect(result).toEqual(customWeaponType)
    expect(mockInsert).toHaveBeenCalledWith({
      weapon_type_name: 'My Weapon Type',
      custom: true,
      user_id: mockUser.id
    })
  })

  it('throws when custom and user is null', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

    await expect(
      addWeaponType({ weapon_type_name: 'My Weapon Type', custom: true })
    ).rejects.toThrow('Not Authenticated')
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(addWeaponType({ weapon_type_name: 'Sword', custom: false })).rejects.toThrow(
      'Error Fetching User: Auth error'
    )
  })

  it('throws when DB insert fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(addWeaponType({ weapon_type_name: 'Sword', custom: false })).rejects.toThrow(
      'Error Adding Weapon Type: Insert failed'
    )
  })
})

describe('updateWeaponType', () => {
  it('updates a weapon type successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateWeaponType('wt1', { weapon_type_name: 'Updated Sword' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('weapon_type')
    expect(mockEq).toHaveBeenCalledWith('id', 'wt1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(updateWeaponType('wt1', { weapon_type_name: 'Sword' })).rejects.toThrow(
      'Error Updating Weapon Type: Update failed'
    )
  })
})

describe('removeWeaponType', () => {
  it('removes a weapon type successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeWeaponType('wt1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('weapon_type')
    expect(mockEq).toHaveBeenCalledWith('id', 'wt1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeWeaponType('wt1')).rejects.toThrow(
      'Error Removing Weapon Type: Delete failed'
    )
  })
})
