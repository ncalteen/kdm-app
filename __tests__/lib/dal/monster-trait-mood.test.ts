import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

vi.mock('@/lib/dal/trait', () => ({
  resolveTraitNames: vi.fn()
}))
vi.mock('@/lib/dal/mood', () => ({
  resolveMoodNames: vi.fn()
}))
vi.mock('@/lib/dal/survivor-status', () => ({
  resolveSurvivorStatusNames: vi.fn()
}))

const {
  syncMonsterTraits,
  syncMonsterMoods,
  syncMonsterSurvivorStatuses,
  copyMonsterJunctions
} = await import('@/lib/dal/monster-trait-mood')
const { resolveTraitNames } = await import('@/lib/dal/trait')
const { resolveMoodNames } = await import('@/lib/dal/mood')
const { resolveSurvivorStatusNames } = await import('@/lib/dal/survivor-status')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('syncMonsterTraits', () => {
  it('inserts missing rows and deletes stale ones', async () => {
    vi.mocked(resolveTraitNames).mockResolvedValue(['t1', 't2'])

    // Initial fetch
    const fetchEq = vi.fn().mockResolvedValue({
      data: [
        { id: 'row1', trait_id: 't1' }, // keep
        { id: 'row2', trait_id: 'tX' } // delete
      ],
      error: null
    })
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({ eq: fetchEq })
    })
    // Delete
    const deleteIn = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({ in: deleteIn })
    })
    // Insert
    const insert = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValueOnce({ insert })

    await syncMonsterTraits('hunt_monster_trait', 'h1', ['Tough', 'Fast'])

    expect(deleteIn).toHaveBeenCalledWith('id', ['row2'])
    expect(insert).toHaveBeenCalledWith([
      { hunt_monster_id: 'h1', trait_id: 't2' }
    ])
  })

  it('skips delete and insert when nothing to change', async () => {
    vi.mocked(resolveTraitNames).mockResolvedValue(['t1'])

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [{ id: 'row1', trait_id: 't1' }],
          error: null
        })
      })
    })

    await syncMonsterTraits('hunt_monster_trait', 'h1', ['Tough'])

    // Only the initial fetch should have happened.
    expect(mockSupabase.from).toHaveBeenCalledTimes(1)
  })

  it('throws on fetch error', async () => {
    vi.mocked(resolveTraitNames).mockResolvedValue([])
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi
          .fn()
          .mockResolvedValue({ data: null, error: { message: 'fetch' } })
      })
    })

    await expect(
      syncMonsterTraits('hunt_monster_trait', 'h1', [])
    ).rejects.toThrow('Error Fetching hunt_monster_trait Junctions: fetch')
  })

  it('throws on delete error', async () => {
    vi.mocked(resolveTraitNames).mockResolvedValue([])

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [{ id: 'row1', trait_id: 'tX' }],
          error: null
        })
      })
    })
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({ error: { message: 'del' } })
      })
    })

    await expect(
      syncMonsterTraits('hunt_monster_trait', 'h1', [])
    ).rejects.toThrow('Error Removing hunt_monster_trait Junctions: del')
  })

  it('throws on insert error', async () => {
    vi.mocked(resolveTraitNames).mockResolvedValue(['t1'])

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })
    mockSupabase.from.mockReturnValueOnce({
      insert: vi.fn().mockResolvedValue({ error: { message: 'ins' } })
    })

    await expect(
      syncMonsterTraits('hunt_monster_trait', 'h1', ['Tough'])
    ).rejects.toThrow('Error Adding hunt_monster_trait Junctions: ins')
  })
})

describe('syncMonsterMoods', () => {
  it('delegates to resolveMoodNames and syncs junction', async () => {
    vi.mocked(resolveMoodNames).mockResolvedValue(['m1'])

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })
    mockSupabase.from.mockReturnValueOnce({
      insert: vi.fn().mockResolvedValue({ error: null })
    })

    await syncMonsterMoods('showdown_monster_mood', 's1', ['Aloof'])
    expect(resolveMoodNames).toHaveBeenCalledWith(['Aloof'])
  })
})

describe('syncMonsterSurvivorStatuses', () => {
  it('delegates to resolveSurvivorStatusNames', async () => {
    vi.mocked(resolveSurvivorStatusNames).mockResolvedValue(['ss1'])

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })
    mockSupabase.from.mockReturnValueOnce({
      insert: vi.fn().mockResolvedValue({ error: null })
    })

    await syncMonsterSurvivorStatuses('quarry_level_survivor_status', 'q1', [
      'Cursed'
    ])
    expect(resolveSurvivorStatusNames).toHaveBeenCalledWith(['Cursed'])
  })
})

describe('copyMonsterJunctions', () => {
  it('throws when catalog tables mismatch', async () => {
    await expect(
      copyMonsterJunctions(
        { table: 'hunt_monster_trait', parentId: 'h1' },
        { table: 'hunt_monster_mood', parentId: 's1' }
      )
    ).rejects.toThrow('catalog mismatch')
  })

  it('copies rows into destination table', async () => {
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [{ trait_id: 't1' }, { trait_id: 't2' }],
          error: null
        })
      })
    })
    const insert = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValueOnce({ insert })

    await copyMonsterJunctions(
      { table: 'hunt_monster_trait', parentId: 'h1' },
      { table: 'showdown_monster_trait', parentId: 's1' }
    )

    expect(insert).toHaveBeenCalledWith([
      { showdown_monster_id: 's1', trait_id: 't1' },
      { showdown_monster_id: 's1', trait_id: 't2' }
    ])
  })

  it('returns early when no source rows', async () => {
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })

    await copyMonsterJunctions(
      { table: 'hunt_monster_trait', parentId: 'h1' },
      { table: 'showdown_monster_trait', parentId: 's1' }
    )
    expect(mockSupabase.from).toHaveBeenCalledTimes(1)
  })

  it('throws on read error', async () => {
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'r' } })
      })
    })

    await expect(
      copyMonsterJunctions(
        { table: 'hunt_monster_trait', parentId: 'h1' },
        { table: 'showdown_monster_trait', parentId: 's1' }
      )
    ).rejects.toThrow('Error Reading hunt_monster_trait: r')
  })

  it('throws on insert error', async () => {
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [{ trait_id: 't1' }],
          error: null
        })
      })
    })
    mockSupabase.from.mockReturnValueOnce({
      insert: vi.fn().mockResolvedValue({ error: { message: 'w' } })
    })

    await expect(
      copyMonsterJunctions(
        { table: 'hunt_monster_trait', parentId: 'h1' },
        { table: 'showdown_monster_trait', parentId: 's1' }
      )
    ).rejects.toThrow('Error Writing showdown_monster_trait: w')
  })
})
