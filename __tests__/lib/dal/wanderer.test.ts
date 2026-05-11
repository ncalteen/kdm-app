import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  auth: { getUser: vi.fn() },
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getWanderers,
  getWandererIds,
  addWanderer,
  updateWanderer,
  removeWanderer,
  getCustomWanderers
} = await import('@/lib/dal/wanderer')

beforeEach(() => {
  vi.clearAllMocks()
})

const baseWanderer = {
  id: 'w1',
  custom: false,
  wanderer_name: 'The Survivor',
  abilities_impairments: [],
  accuracy: 0,
  arc: null,
  courage: 0,
  disposition: null,
  evasion: 0,
  fighting_art_ids: [],
  gender: 'M',
  hunt_xp: 0,
  hunt_xp_rank_up: [],
  insanity: 0,
  luck: 0,
  lumi: 0,
  movement: 5,
  permanent_injuries: [],
  rare_gear_ids: [],
  speed: 0,
  strength: 0,
  survival: 0,
  systemic_pressure: 0,
  torment: 0,
  understanding: 0
}

describe('getWanderers', () => {
  const mockUser = { id: 'user-1' }
  const nonCustomWanderer = { ...baseWanderer, id: 'w1', custom: false }
  const userCustomWanderer = {
    ...baseWanderer,
    id: 'w2',
    custom: true,
    wanderer_name: 'My Wanderer'
  }

  const mockSelect = (data: object[] | null, error: object | null = null) => {
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({ data, error })
    })
  }

  it('returns every wanderer surfaced by RLS', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSelect([nonCustomWanderer, userCustomWanderer])

    const result = await getWanderers()

    expect(result).toEqual({
      w1: nonCustomWanderer,
      w2: userCustomWanderer
    })
    expect(mockSupabase.from).toHaveBeenCalledWith('wanderer')
  })

  it('throws when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(getWanderers()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when auth returns an error', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(getWanderers()).rejects.toThrow(
      'Error Fetching User: Auth error'
    )
  })

  it('throws when the query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSelect(null, { message: 'DB error' })

    await expect(getWanderers()).rejects.toThrow(
      'Error Fetching Wanderers: DB error'
    )
  })

  it('returns an empty map when the query returns no rows', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSelect([])

    const result = await getWanderers()
    expect(result).toEqual({})
  })
})

describe('getWandererIds', () => {
  const mockUser = { id: 'user-1' }

  it('fetches wanderer IDs without userId', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 'w1' }, { id: 'w2' }], error: null })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEq })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getWandererIds(['The Survivor', 'The Hunter'], false)

    expect(result).toEqual(['w1', 'w2'])
  })

  it('fetches wanderer IDs with userId', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockEq2 = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 'w3' }], error: null })
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEq1 })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getWandererIds(['My Wanderer'], true, 'user-1')

    expect(result).toEqual(['w3'])
  })

  it('throws when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(getWandererIds(['The Survivor'], false)).rejects.toThrow(
      'Not Authenticated'
    )
  })

  it('throws when auth returns an error', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(getWandererIds(['The Survivor'], false)).rejects.toThrow(
      'Error Fetching User: Auth error'
    )
  })

  it('throws when query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEq })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getWandererIds(['The Survivor'], false)).rejects.toThrow(
      'Error Fetching Wanderer ID(s): DB error'
    )
  })

  it('throws when data is null', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEq })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getWandererIds(['The Survivor'], false)).rejects.toThrow(
      'Wanderer(s) Not Found'
    )
  })
})

describe('addWanderer', () => {
  const mockUser = { id: 'user-1' }

  it('inserts a non-custom wanderer without user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: baseWanderer, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addWanderer({
      wanderer_name: 'The Survivor',
      custom: false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    expect(result).toEqual(baseWanderer)
    expect(mockInsert).toHaveBeenCalledWith({
      wanderer_name: 'The Survivor',
      custom: false
    })
  })

  it('inserts a custom wanderer with user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const customWanderer = {
      ...baseWanderer,
      id: 'w2',
      custom: true,
      wanderer_name: 'My Wanderer'
    }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: customWanderer, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addWanderer({
      wanderer_name: 'My Wanderer',
      custom: true
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    expect(result).toEqual(customWanderer)
    expect(mockInsert).toHaveBeenCalledWith({
      wanderer_name: 'My Wanderer',
      custom: true,
      user_id: mockUser.id
    })
  })

  it('throws when custom wanderer requires auth but user is null', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      addWanderer({ wanderer_name: 'My Wanderer', custom: true } as any)
    ).rejects.toThrow('Not Authenticated')
  })

  it('throws when auth returns an error', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      addWanderer({ wanderer_name: 'The Survivor', custom: false } as any)
    ).rejects.toThrow('Error Fetching User: Auth error')
  })

  it('throws when DB insert fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      addWanderer({ wanderer_name: 'The Survivor', custom: false } as any)
    ).rejects.toThrow('Error Adding Wanderer: Insert failed')
  })
})

describe('updateWanderer', () => {
  it('updates a wanderer successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateWanderer('w1', { wanderer_name: 'Renamed Survivor' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('wanderer')
    expect(mockEq).toHaveBeenCalledWith('id', 'w1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateWanderer('w1', { wanderer_name: 'Survivor' })
    ).rejects.toThrow('Error Updating Wanderer: Update failed')
  })
})

describe('removeWanderer', () => {
  it('removes a wanderer successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeWanderer('w1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('wanderer')
    expect(mockEq).toHaveBeenCalledWith('id', 'w1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeWanderer('w1')).rejects.toThrow(
      'Error Removing Wanderer: Delete failed'
    )
  })
})

describe('getCustomWanderers', () => {
  const mockUser = { id: 'user-1' }
  const customWanderer = {
    ...baseWanderer,
    id: 'w2',
    custom: true,
    wanderer_name: 'My Wanderer'
  }

  it('returns only custom wanderers for the user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockEq2 = vi
      .fn()
      .mockResolvedValue({ data: [customWanderer], error: null })
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getCustomWanderers()

    expect(result).toEqual({ w2: customWanderer })
  })

  it('throws when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(getCustomWanderers()).rejects.toThrow('Not Authenticated')
  })

  it('throws when auth returns an error', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(getCustomWanderers()).rejects.toThrow(
      'Error Fetching User: Auth error'
    )
  })

  it('throws when query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockEq2 = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getCustomWanderers()).rejects.toThrow(
      'Error Fetching Custom Wanderers: DB error'
    )
  })

  it('returns empty map when no custom wanderers exist', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockEq2 = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getCustomWanderers()
    expect(result).toEqual({})
  })
})
