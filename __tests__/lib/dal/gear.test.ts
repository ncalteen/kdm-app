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
  getGear,
  addGear,
  updateGear,
  removeGear,
  getCustomGear,
  replaceGearGearCosts,
  replaceGearResourceCosts,
  replaceGearResourceTypeCosts
} = await import('@/lib/dal/gear')

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

  const mockSelect = (data: object[] | null, error: object | null = null) => {
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({ data, error })
    })
  }

  it('returns every gear surfaced by RLS', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSelect([nonCustomGear, userCustomGear])

    const result = await getGear()

    expect(result).toEqual({
      g1: withGearDefaults(nonCustomGear),
      g2: withGearDefaults(userCustomGear)
    })
    expect(mockSupabase.from).toHaveBeenCalledWith('gear')
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

  it('throws when the query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSelect(null, { message: 'DB error' })

    await expect(getGear()).rejects.toThrow('Error Fetching Gear: DB error')
  })

  it('returns an empty map when the query returns no rows', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSelect([])

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

describe('replaceGearGearCosts', () => {
  it('clears and inserts deduped/filtered cost rows', async () => {
    const deleteEq = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({ eq: deleteEq })
    })
    const insert = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValueOnce({ insert })

    await replaceGearGearCosts('g1', [
      { cost_gear_id: 'a', quantity: 1 },
      { cost_gear_id: 'a', quantity: 2 }, // dup → skipped
      { cost_gear_id: 'b', quantity: 0 }, // q<1 → skipped
      { cost_gear_id: 'g1', quantity: 1 }, // self → skipped
      { cost_gear_id: '', quantity: 1 }, // empty → skipped
      { cost_gear_id: 'c', quantity: 3 }
    ])

    expect(insert).toHaveBeenCalledWith([
      { gear_id: 'g1', cost_gear_id: 'a', quantity: 1 },
      { gear_id: 'g1', cost_gear_id: 'c', quantity: 3 }
    ])
  })

  it('skips insert when no rows remain', async () => {
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    })

    await replaceGearGearCosts('g1', [])
    expect(mockSupabase.from).toHaveBeenCalledTimes(1)
  })

  it('throws on delete error', async () => {
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'd' } })
      })
    })
    await expect(replaceGearGearCosts('g1', [])).rejects.toThrow(
      'Error Clearing Gear Gear Costs: d'
    )
  })

  it('throws on insert error', async () => {
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    })
    mockSupabase.from.mockReturnValueOnce({
      insert: vi.fn().mockResolvedValue({ error: { message: 'i' } })
    })

    await expect(
      replaceGearGearCosts('g1', [{ cost_gear_id: 'a', quantity: 1 }])
    ).rejects.toThrow('Error Saving Gear Gear Costs: i')
  })
})

describe('replaceGearResourceCosts', () => {
  it('inserts deduped/filtered cost rows', async () => {
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    })
    const insert = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValueOnce({ insert })

    await replaceGearResourceCosts('g1', [
      { resource_id: 'r1', quantity: 1 },
      { resource_id: 'r1', quantity: 2 }, // dup
      { resource_id: '', quantity: 1 } // empty
    ])

    expect(insert).toHaveBeenCalledWith([
      { gear_id: 'g1', resource_id: 'r1', quantity: 1 }
    ])
  })

  it('throws on delete error', async () => {
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'd' } })
      })
    })
    await expect(replaceGearResourceCosts('g1', [])).rejects.toThrow(
      'Error Clearing Gear Resource Costs: d'
    )
  })

  it('throws on insert error', async () => {
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    })
    mockSupabase.from.mockReturnValueOnce({
      insert: vi.fn().mockResolvedValue({ error: { message: 'i' } })
    })
    await expect(
      replaceGearResourceCosts('g1', [{ resource_id: 'r1', quantity: 1 }])
    ).rejects.toThrow('Error Saving Gear Resource Costs: i')
  })
})

describe('replaceGearResourceTypeCosts', () => {
  it('inserts deduped/filtered cost rows', async () => {
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    })
    const insert = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValueOnce({ insert })

    await replaceGearResourceTypeCosts('g1', [
      { resource_type: 'BONE', quantity: 1 },
      { resource_type: 'BONE', quantity: 2 }, // dup
      { resource_type: 'CLOTH', quantity: 0 } // q<1
    ])

    expect(insert).toHaveBeenCalledWith([
      { gear_id: 'g1', resource_type: 'BONE', quantity: 1 }
    ])
  })

  it('throws on delete error', async () => {
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'd' } })
      })
    })
    await expect(replaceGearResourceTypeCosts('g1', [])).rejects.toThrow(
      'Error Clearing Gear Resource Type Costs: d'
    )
  })

  it('throws on insert error', async () => {
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    })
    mockSupabase.from.mockReturnValueOnce({
      insert: vi.fn().mockResolvedValue({ error: { message: 'i' } })
    })
    await expect(
      replaceGearResourceTypeCosts('g1', [
        { resource_type: 'BONE', quantity: 1 }
      ])
    ).rejects.toThrow('Error Saving Gear Resource Type Costs: i')
  })
})
