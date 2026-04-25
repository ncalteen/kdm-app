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

const { getGear, addGear, updateGear, removeGear, getCustomGear } =
  await import('@/lib/dal/gear')

/**
 * Augment a raw gear fixture with the normalized junction defaults that
 * `toGearDetail` adds when reading from the database.
 */
const withGearDefaults = <T extends Record<string, unknown>>(g: T) => ({
  ...g,
  affinity_bonus_requirements: [],
  gear_costs: [],
  resource_costs: [],
  resource_type_costs: []
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getGear', () => {
  const mockUser = { id: 'user-1' }
  const nonCustomGear = {
    id: 'g1',
    custom: false,
    gear_name: 'Lantern Helm',
    location_id: 'l1'
  }
  const userCustomGear = {
    id: 'g2',
    custom: true,
    gear_name: 'My Gear',
    location_id: null
  }
  const sharedGear = {
    id: 'g3',
    custom: true,
    gear_name: 'Shared Gear',
    location_id: null
  }

  it('returns gear from all three sources', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [nonCustomGear], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi
              .fn()
              .mockResolvedValue({ data: [userCustomGear], error: null })
          })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ gear: [sharedGear] }],
            error: null
          })
        })
      })

    const result = await getGear()

    expect(result).toEqual({
      g1: withGearDefaults(nonCustomGear),
      g2: withGearDefaults(userCustomGear),
      g3: withGearDefaults(sharedGear)
    })
  })

  it('throws when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(getGear()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(getGear()).rejects.toThrow('Error Fetching User: Auth error')
  })

  it('throws when non-custom query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi
            .fn()
            .mockResolvedValue({ data: null, error: { message: 'DB error' } })
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

    await expect(getGear()).rejects.toThrow('Error Fetching Gear: DB error')
  })

  it('throws when user-custom query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi
              .fn()
              .mockResolvedValue({ data: null, error: { message: 'DB error' } })
          })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      })

    await expect(getGear()).rejects.toThrow('Error Fetching Gear: DB error')
  })

  it('throws when shared query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

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
          eq: vi
            .fn()
            .mockResolvedValue({ data: null, error: { message: 'DB error' } })
        })
      })

    await expect(getGear()).rejects.toThrow('Error Fetching Gear: DB error')
  })

  it('returns empty map when all sources return empty arrays', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

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

    const result = await getGear()
    expect(result).toEqual({})
  })
})

describe('addGear', () => {
  const mockUser = { id: 'user-1' }
  const mockGear = {
    id: 'g1',
    custom: false,
    gear_name: 'Lantern Helm',
    location_id: 'l1'
  }

  it('inserts a non-custom gear without user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: mockGear, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addGear({
      gear_name: 'Lantern Helm',
      custom: false,
      location_id: 'l1'
    })

    expect(result).toEqual(withGearDefaults(mockGear))
    expect(mockInsert).toHaveBeenCalledWith({
      gear_name: 'Lantern Helm',
      custom: false,
      location_id: 'l1'
    })
  })

  it('inserts a custom gear with user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const customGear = {
      id: 'g2',
      custom: true,
      gear_name: 'My Gear',
      location_id: null
    }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: customGear, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addGear({ gear_name: 'My Gear', custom: true })

    expect(result).toEqual(withGearDefaults(customGear))
    expect(mockInsert).toHaveBeenCalledWith({
      gear_name: 'My Gear',
      custom: true,
      user_id: mockUser.id
    })
  })

  it('throws when custom and user is null', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(
      addGear({ gear_name: 'My Gear', custom: true })
    ).rejects.toThrow('Not Authenticated')
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(
      addGear({ gear_name: 'Lantern Helm', custom: false })
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
      addGear({ gear_name: 'Lantern Helm', custom: false })
    ).rejects.toThrow('Error Adding Gear: Insert failed')
  })
})

describe('updateGear', () => {
  it('updates gear successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateGear('g1', { gear_name: 'Updated Lantern Helm' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('gear')
    expect(mockEq).toHaveBeenCalledWith('id', 'g1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateGear('g1', { gear_name: 'Lantern Helm' })
    ).rejects.toThrow('Error Updating Gear: Update failed')
  })
})

describe('removeGear', () => {
  it('removes gear successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeGear('g1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('gear')
    expect(mockEq).toHaveBeenCalledWith('id', 'g1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeGear('g1')).rejects.toThrow(
      'Error Removing Gear: Delete failed'
    )
  })
})

describe('getCustomGear', () => {
  const mockUser = { id: 'user-1' }

  it('returns only custom gear for the authenticated user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const customGear = {
      id: 'g2',
      custom: true,
      gear_name: 'My Gear',
      location_id: null
    }
    const mockEq2 = vi
      .fn()
      .mockResolvedValue({ data: [customGear], error: null })
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getCustomGear()

    expect(result).toEqual({ g2: withGearDefaults(customGear) })
    expect(mockEq1).toHaveBeenCalledWith('custom', true)
    expect(mockEq2).toHaveBeenCalledWith('user_id', mockUser.id)
  })

  it('returns empty map when user has no custom gear', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockEq2 = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getCustomGear()
    expect(result).toEqual({})
  })

  it('throws when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(getCustomGear()).rejects.toThrow('Not Authenticated')
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(getCustomGear()).rejects.toThrow(
      'Error Fetching User: Auth error'
    )
  })

  it('throws when DB query fails', async () => {
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

    await expect(getCustomGear()).rejects.toThrow(
      'Error Fetching Custom Gear: DB error'
    )
  })
})
