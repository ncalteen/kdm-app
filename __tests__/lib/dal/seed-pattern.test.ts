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
  getSeedPatterns,
  addSeedPattern,
  updateSeedPattern,
  removeSeedPattern,
  replaceSeedPatternGearCosts
} = await import('@/lib/dal/seed-pattern')

/**
 * Augment a raw seed pattern fixture with the normalized junction default
 * that `toSeedPatternDetail` adds when reading from the database.
 */
const withSeedPatternDefaults = <T extends Record<string, unknown>>(s: T) => ({
  ...s,
  gear_costs: []
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getSeedPatterns', () => {
  const mockUser = { id: 'user-1' }
  const nonCustomSeedPattern = {
    id: 'sp1',
    custom: false,
    seed_pattern_name: 'Cloth'
  }
  const userCustomSeedPattern = {
    id: 'sp2',
    custom: true,
    seed_pattern_name: 'My Seed Pattern'
  }

  const mockSelect = (data: object[] | null, error: object | null = null) => {
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({ data, error })
    })
  }

  it('returns every seed pattern surfaced by RLS', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSelect([nonCustomSeedPattern, userCustomSeedPattern])

    const result = await getSeedPatterns()

    expect(result).toEqual({
      sp1: withSeedPatternDefaults(nonCustomSeedPattern),
      sp2: withSeedPatternDefaults(userCustomSeedPattern)
    })
    expect(mockSupabase.from).toHaveBeenCalledWith('seed_pattern')
  })

  it('throws when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(getSeedPatterns()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(getSeedPatterns()).rejects.toThrow(
      'Error Fetching User: Auth error'
    )
  })

  it('throws when the query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSelect(null, { message: 'DB error' })

    await expect(getSeedPatterns()).rejects.toThrow(
      'Error Fetching Seed Patterns: DB error'
    )
  })

  it('returns an empty map when the query returns no rows', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSelect([])

    const result = await getSeedPatterns()
    expect(result).toEqual({})
  })
})

describe('addSeedPattern', () => {
  const mockUser = { id: 'user-1' }
  const mockSeedPattern = {
    id: 'sp1',
    custom: false,
    seed_pattern_name: 'Cloth'
  }

  it('inserts a non-custom seed pattern without user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: mockSeedPattern, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addSeedPattern({
      seed_pattern_name: 'Cloth',
      custom: false
    })

    expect(result).toEqual(withSeedPatternDefaults(mockSeedPattern))
    expect(mockInsert).toHaveBeenCalledWith({
      seed_pattern_name: 'Cloth',
      custom: false
    })
  })

  it('inserts a custom seed pattern with user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const customSeedPattern = {
      id: 'sp2',
      custom: true,
      seed_pattern_name: 'My Seed Pattern'
    }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: customSeedPattern, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addSeedPattern({
      seed_pattern_name: 'My Seed Pattern',
      custom: true
    })

    expect(result).toEqual(withSeedPatternDefaults(customSeedPattern))
    expect(mockInsert).toHaveBeenCalledWith({
      seed_pattern_name: 'My Seed Pattern',
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
      addSeedPattern({ seed_pattern_name: 'My Seed Pattern', custom: true })
    ).rejects.toThrow('Not Authenticated')
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(
      addSeedPattern({ seed_pattern_name: 'Cloth', custom: false })
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
      addSeedPattern({ seed_pattern_name: 'Cloth', custom: false })
    ).rejects.toThrow('Error Adding Seed Pattern: Insert failed')
  })
})

describe('updateSeedPattern', () => {
  it('updates a seed pattern successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSeedPattern('sp1', { seed_pattern_name: 'Updated Cloth' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('seed_pattern')
    expect(mockEq).toHaveBeenCalledWith('id', 'sp1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSeedPattern('sp1', { seed_pattern_name: 'Cloth' })
    ).rejects.toThrow('Error Updating Seed Pattern: Update failed')
  })
})

describe('removeSeedPattern', () => {
  it('removes a seed pattern successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSeedPattern('sp1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('seed_pattern')
    expect(mockEq).toHaveBeenCalledWith('id', 'sp1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSeedPattern('sp1')).rejects.toThrow(
      'Error Removing Seed Pattern: Delete failed'
    )
  })
})

describe('replaceSeedPatternGearCosts', () => {
  it('inserts deduped/filtered cost rows', async () => {
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    })
    const insert = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValueOnce({ insert })

    await replaceSeedPatternGearCosts('sp1', [
      { cost_gear_id: 'g1', quantity: 1 },
      { cost_gear_id: 'g1', quantity: 5 }, // dup
      { cost_gear_id: 'g2', quantity: 0 }, // q<1
      { cost_gear_id: '', quantity: 1 } // empty
    ])

    expect(insert).toHaveBeenCalledWith([
      { seed_pattern_id: 'sp1', cost_gear_id: 'g1', quantity: 1 }
    ])
  })

  it('skips insert when no rows remain', async () => {
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    })
    await replaceSeedPatternGearCosts('sp1', [])
    expect(mockSupabase.from).toHaveBeenCalledTimes(1)
  })

  it('throws on delete error', async () => {
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'd' } })
      })
    })
    await expect(replaceSeedPatternGearCosts('sp1', [])).rejects.toThrow(
      'Error Clearing Seed Pattern Gear Costs: d'
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
      replaceSeedPatternGearCosts('sp1', [{ cost_gear_id: 'g1', quantity: 1 }])
    ).rejects.toThrow('Error Saving Seed Pattern Gear Costs: i')
  })
})
