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
  getPatterns,
  addPattern,
  updatePattern,
  removePattern,
  replacePatternGearCosts,
  replacePatternResourceCosts,
  replacePatternResourceTypeCosts,
  replacePatternInnovationRequirements
} = await import('@/lib/dal/pattern')

/**
 * Augment a raw pattern fixture with the normalized junction defaults that
 * `toPatternDetail` adds when reading from the database.
 */
const withPatternDefaults = <T extends Record<string, unknown>>(p: T) => ({
  ...p,
  gear_costs: [],
  resource_costs: [],
  resource_type_costs: [],
  innovation_requirement_ids: []
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getPatterns', () => {
  const mockUser = { id: 'user-1' }
  const nonCustomPattern = {
    id: 'p1',
    custom: false,
    pattern_name: 'Screaming Coat'
  }
  const userCustomPattern = {
    id: 'p2',
    custom: true,
    pattern_name: 'My Pattern'
  }
  const sharedPattern = {
    id: 'p3',
    custom: true,
    pattern_name: 'Shared Pattern'
  }

  it('returns patterns from all three sources', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi
            .fn()
            .mockResolvedValue({ data: [nonCustomPattern], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi
              .fn()
              .mockResolvedValue({ data: [userCustomPattern], error: null })
          })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ pattern: [sharedPattern] }],
            error: null
          })
        })
      })

    const result = await getPatterns()

    expect(result).toEqual({
      p1: withPatternDefaults(nonCustomPattern),
      p2: withPatternDefaults(userCustomPattern),
      p3: withPatternDefaults(sharedPattern)
    })
  })

  it('throws when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(getPatterns()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(getPatterns()).rejects.toThrow(
      'Error Fetching User: Auth error'
    )
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

    await expect(getPatterns()).rejects.toThrow(
      'Error Fetching Patterns: DB error'
    )
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

    await expect(getPatterns()).rejects.toThrow(
      'Error Fetching Patterns: DB error'
    )
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

    await expect(getPatterns()).rejects.toThrow(
      'Error Fetching Patterns: DB error'
    )
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

    const result = await getPatterns()
    expect(result).toEqual({})
  })
})

describe('addPattern', () => {
  const mockUser = { id: 'user-1' }
  const mockPattern = {
    id: 'p1',
    custom: false,
    pattern_name: 'Screaming Coat'
  }

  it('inserts a non-custom pattern without user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: mockPattern, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addPattern({
      pattern_name: 'Screaming Coat',
      custom: false
    })

    expect(result).toEqual(withPatternDefaults(mockPattern))
    expect(mockInsert).toHaveBeenCalledWith({
      pattern_name: 'Screaming Coat',
      custom: false
    })
  })

  it('inserts a custom pattern with user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const customPattern = { id: 'p2', custom: true, pattern_name: 'My Pattern' }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: customPattern, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addPattern({
      pattern_name: 'My Pattern',
      custom: true
    })

    expect(result).toEqual(withPatternDefaults(customPattern))
    expect(mockInsert).toHaveBeenCalledWith({
      pattern_name: 'My Pattern',
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
      addPattern({ pattern_name: 'My Pattern', custom: true })
    ).rejects.toThrow('Not Authenticated')
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(
      addPattern({ pattern_name: 'Screaming Coat', custom: false })
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
      addPattern({ pattern_name: 'Screaming Coat', custom: false })
    ).rejects.toThrow('Error Adding Pattern: Insert failed')
  })
})

describe('updatePattern', () => {
  it('updates a pattern successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updatePattern('p1', { pattern_name: 'Updated Screaming Coat' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('pattern')
    expect(mockEq).toHaveBeenCalledWith('id', 'p1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updatePattern('p1', { pattern_name: 'Screaming Coat' })
    ).rejects.toThrow('Error Updating Pattern: Update failed')
  })
})

describe('removePattern', () => {
  it('removes a pattern successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removePattern('p1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('pattern')
    expect(mockEq).toHaveBeenCalledWith('id', 'p1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removePattern('p1')).rejects.toThrow(
      'Error Removing Pattern: Delete failed'
    )
  })
})

describe('replacePatternGearCosts', () => {
  it('inserts deduped/filtered cost rows', async () => {
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    })
    const insert = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValueOnce({ insert })

    await replacePatternGearCosts('p1', [
      { cost_gear_id: 'a', quantity: 1 },
      { cost_gear_id: 'a', quantity: 2 }, // dup
      { cost_gear_id: 'b', quantity: 0 }, // q<1
      { cost_gear_id: '', quantity: 1 } // empty
    ])

    expect(insert).toHaveBeenCalledWith([
      { pattern_id: 'p1', cost_gear_id: 'a', quantity: 1 }
    ])
  })

  it('skips insert when no rows remain', async () => {
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    })
    await replacePatternGearCosts('p1', [])
    expect(mockSupabase.from).toHaveBeenCalledTimes(1)
  })

  it('throws on delete error', async () => {
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'd' } })
      })
    })
    await expect(replacePatternGearCosts('p1', [])).rejects.toThrow(
      'Error Clearing Pattern Gear Costs: d'
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
      replacePatternGearCosts('p1', [{ cost_gear_id: 'a', quantity: 1 }])
    ).rejects.toThrow('Error Saving Pattern Gear Costs: i')
  })
})

describe('replacePatternResourceCosts', () => {
  it('inserts deduped/filtered rows', async () => {
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    })
    const insert = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValueOnce({ insert })

    await replacePatternResourceCosts('p1', [
      { resource_id: 'r1', quantity: 1 },
      { resource_id: 'r1', quantity: 2 },
      { resource_id: '', quantity: 1 }
    ])

    expect(insert).toHaveBeenCalledWith([
      { pattern_id: 'p1', resource_id: 'r1', quantity: 1 }
    ])
  })

  it('throws on delete error', async () => {
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'd' } })
      })
    })
    await expect(replacePatternResourceCosts('p1', [])).rejects.toThrow(
      'Error Clearing Pattern Resource Costs: d'
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
      replacePatternResourceCosts('p1', [{ resource_id: 'r1', quantity: 1 }])
    ).rejects.toThrow('Error Saving Pattern Resource Costs: i')
  })
})

describe('replacePatternResourceTypeCosts', () => {
  it('inserts deduped/filtered rows', async () => {
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    })
    const insert = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValueOnce({ insert })

    await replacePatternResourceTypeCosts('p1', [
      { resource_type: 'BONE', quantity: 1 },
      { resource_type: 'BONE', quantity: 5 },
      { resource_type: 'CLOTH', quantity: 0 }
    ])

    expect(insert).toHaveBeenCalledWith([
      { pattern_id: 'p1', resource_type: 'BONE', quantity: 1 }
    ])
  })

  it('throws on delete error', async () => {
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'd' } })
      })
    })
    await expect(replacePatternResourceTypeCosts('p1', [])).rejects.toThrow(
      'Error Clearing Pattern Resource Type Costs: d'
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
      replacePatternResourceTypeCosts('p1', [
        { resource_type: 'BONE', quantity: 1 }
      ])
    ).rejects.toThrow('Error Saving Pattern Resource Type Costs: i')
  })
})

describe('replacePatternInnovationRequirements', () => {
  it('inserts deduped innovation IDs', async () => {
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    })
    const insert = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValueOnce({ insert })

    await replacePatternInnovationRequirements('p1', ['i1', 'i1', '', 'i2'])

    expect(insert).toHaveBeenCalledWith([
      { pattern_id: 'p1', innovation_id: 'i1' },
      { pattern_id: 'p1', innovation_id: 'i2' }
    ])
  })

  it('skips insert when no IDs remain', async () => {
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    })
    await replacePatternInnovationRequirements('p1', [])
    expect(mockSupabase.from).toHaveBeenCalledTimes(1)
  })

  it('throws on delete error', async () => {
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'd' } })
      })
    })
    await expect(
      replacePatternInnovationRequirements('p1', [])
    ).rejects.toThrow('Error Clearing Pattern Innovation Requirements: d')
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
      replacePatternInnovationRequirements('p1', ['i1'])
    ).rejects.toThrow('Error Saving Pattern Innovation Requirements: i')
  })
})
