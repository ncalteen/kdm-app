import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getSurvivorCursedGear,
  addSurvivorCursedGear,
  removeSurvivorCursedGear,
  updateSurvivorCursedGear
} = await import('@/lib/dal/survivor-cursed-gear')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getSurvivorCursedGear', () => {
  it('throws when survivorId is null', async () => {
    await expect(getSurvivorCursedGear(null)).rejects.toThrow('Required: Survivor ID')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when survivorId is undefined', async () => {
    await expect(getSurvivorCursedGear(undefined)).rejects.toThrow('Required: Survivor ID')
  })

  it('returns cursed gear for a survivor', async () => {
    const mockData = [
      { id: 'cg1', gear_id: 'g1' },
      { id: 'cg2', gear_id: 'g2' }
    ]
    const mockEq = vi.fn().mockResolvedValue({ data: mockData, error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getSurvivorCursedGear('survivor-1')

    expect(mockSupabase.from).toHaveBeenCalledWith('survivor_cursed_gear')
    expect(mockSelect).toHaveBeenCalledWith('id, gear_id')
    expect(mockEq).toHaveBeenCalledWith('survivor_id', 'survivor-1')
    expect(result).toEqual(mockData)
  })

  it('returns empty array when data is null', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getSurvivorCursedGear('survivor-1')

    expect(result).toEqual([])
  })

  it('throws when query fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getSurvivorCursedGear('survivor-1')).rejects.toThrow(
      'Error Fetching Survivor Cursed Gear: DB error'
    )
  })
})

describe('addSurvivorCursedGear', () => {
  it('inserts and returns the junction row id', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'cg-new' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addSurvivorCursedGear('survivor-1', 'gear-1')

    expect(mockSupabase.from).toHaveBeenCalledWith('survivor_cursed_gear')
    expect(mockInsert).toHaveBeenCalledWith({ survivor_id: 'survivor-1', gear_id: 'gear-1' })
    expect(result).toBe('cg-new')
  })

  it('throws when insert fails', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(addSurvivorCursedGear('survivor-1', 'gear-1')).rejects.toThrow(
      'Error Adding Survivor Cursed Gear: Insert failed'
    )
  })
})

describe('removeSurvivorCursedGear', () => {
  it('deletes matching junction row', async () => {
    const mockSecondEq = vi.fn().mockResolvedValue({ error: null })
    const mockFirstEq = vi.fn().mockReturnValue({ eq: mockSecondEq })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockFirstEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSurvivorCursedGear('survivor-1', 'gear-1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('survivor_cursed_gear')
    expect(mockFirstEq).toHaveBeenCalledWith('survivor_id', 'survivor-1')
    expect(mockSecondEq).toHaveBeenCalledWith('gear_id', 'gear-1')
  })

  it('throws when delete fails', async () => {
    const mockSecondEq = vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockFirstEq = vi.fn().mockReturnValue({ eq: mockSecondEq })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockFirstEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSurvivorCursedGear('survivor-1', 'gear-1')).rejects.toThrow(
      'Error Removing Survivor Cursed Gear: Delete failed'
    )
  })
})

describe('updateSurvivorCursedGear', () => {
  it('updates matching row', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSurvivorCursedGear('cg-1', { gear_id: 'gear-2' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('survivor_cursed_gear')
    expect(mockUpdate).toHaveBeenCalledWith({ gear_id: 'gear-2' })
    expect(mockEq).toHaveBeenCalledWith('id', 'cg-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(updateSurvivorCursedGear('cg-1', { gear_id: 'gear-2' })).rejects.toThrow(
      'Error Updating Survivor Cursed Gear: Update failed'
    )
  })
})
