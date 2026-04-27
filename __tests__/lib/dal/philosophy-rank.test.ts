import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getPhilosophyRanks,
  addPhilosophyRank,
  updatePhilosophyRank,
  removePhilosophyRank
} = await import('@/lib/dal/philosophy-rank')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getPhilosophyRanks', () => {
  it('throws when philosophy ID is missing', async () => {
    await expect(getPhilosophyRanks(null)).rejects.toThrow(
      'Required: Philosophy ID'
    )
    await expect(getPhilosophyRanks(undefined)).rejects.toThrow(
      'Required: Philosophy ID'
    )
    await expect(getPhilosophyRanks('')).rejects.toThrow(
      'Required: Philosophy ID'
    )
  })

  it('returns philosophy ranks ordered by rank_number', async () => {
    const order = vi.fn().mockResolvedValue({
      data: [{ id: 'r1', philosophy_id: 'p1', rank_number: 1, rules: 'rules' }],
      error: null
    })
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ order })
      })
    })

    const result = await getPhilosophyRanks('p1')
    expect(result).toEqual([
      { id: 'r1', philosophy_id: 'p1', rank_number: 1, rules: 'rules' }
    ])
    expect(order).toHaveBeenCalledWith('rank_number', { ascending: true })
  })

  it('returns [] when data is null', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: null })
        })
      })
    })

    expect(await getPhilosophyRanks('p1')).toEqual([])
  })

  it('throws on query error', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi
            .fn()
            .mockResolvedValue({ data: null, error: { message: 'DB' } })
        })
      })
    })

    await expect(getPhilosophyRanks('p1')).rejects.toThrow(
      'Error Fetching Philosophy Ranks: DB'
    )
  })
})

describe('addPhilosophyRank', () => {
  it('inserts a philosophy rank', async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: 'r1', philosophy_id: 'p1', rank_number: 1, rules: 'r' },
      error: null
    })
    const insert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({ single })
    })
    mockSupabase.from.mockReturnValue({ insert })

    const result = await addPhilosophyRank({
      philosophy_id: 'p1',
      rank_number: 1,
      rules: 'r'
    })

    expect(result).toEqual({
      id: 'r1',
      philosophy_id: 'p1',
      rank_number: 1,
      rules: 'r'
    })
    expect(insert).toHaveBeenCalledWith({
      philosophy_id: 'p1',
      rank_number: 1,
      rules: 'r'
    })
  })

  it('throws on insert error', async () => {
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi
            .fn()
            .mockResolvedValue({ data: null, error: { message: 'fail' } })
        })
      })
    })

    await expect(
      addPhilosophyRank({ philosophy_id: 'p1', rank_number: 1, rules: 'r' })
    ).rejects.toThrow('Error Adding Philosophy Rank: fail')
  })
})

describe('updatePhilosophyRank', () => {
  it('updates a rank', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({ eq })
    })

    await updatePhilosophyRank('r1', { rank_number: 2 })
    expect(eq).toHaveBeenCalledWith('id', 'r1')
  })

  it('throws on update error', async () => {
    mockSupabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'fail' } })
      })
    })

    await expect(
      updatePhilosophyRank('r1', { rank_number: 2 })
    ).rejects.toThrow('Error Updating Philosophy Rank: fail')
  })
})

describe('removePhilosophyRank', () => {
  it('removes a rank', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({ eq })
    })

    await removePhilosophyRank('r1')
    expect(eq).toHaveBeenCalledWith('id', 'r1')
  })

  it('throws on delete error', async () => {
    mockSupabase.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'fail' } })
      })
    })

    await expect(removePhilosophyRank('r1')).rejects.toThrow(
      'Error Removing Philosophy Rank: fail'
    )
  })
})
