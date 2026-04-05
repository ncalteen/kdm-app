import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getSurvivorFightingArts,
  addSurvivorFightingArt,
  removeSurvivorFightingArt,
  updateSurvivorFightingArt
} = await import('@/lib/dal/survivor-fighting-art')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getSurvivorFightingArts', () => {
  it('throws when survivorId is null', async () => {
    await expect(getSurvivorFightingArts(null)).rejects.toThrow('Required: Survivor ID')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when survivorId is undefined', async () => {
    await expect(getSurvivorFightingArts(undefined)).rejects.toThrow('Required: Survivor ID')
  })

  it('returns fighting arts for a survivor', async () => {
    const mockData = [
      { id: 'sfa1', fighting_art_id: 'fa1' },
      { id: 'sfa2', fighting_art_id: 'fa2' }
    ]
    const mockEq = vi.fn().mockResolvedValue({ data: mockData, error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getSurvivorFightingArts('survivor-1')

    expect(mockSupabase.from).toHaveBeenCalledWith('survivor_fighting_art')
    expect(mockSelect).toHaveBeenCalledWith('id, fighting_art_id')
    expect(mockEq).toHaveBeenCalledWith('survivor_id', 'survivor-1')
    expect(result).toEqual(mockData)
  })

  it('returns empty array when data is null', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getSurvivorFightingArts('survivor-1')

    expect(result).toEqual([])
  })

  it('throws when query fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getSurvivorFightingArts('survivor-1')).rejects.toThrow(
      'Error Fetching Survivor Fighting Arts: DB error'
    )
  })
})

describe('addSurvivorFightingArt', () => {
  it('inserts and returns the junction row id', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'sfa-new' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addSurvivorFightingArt('survivor-1', 'fa-1')

    expect(mockSupabase.from).toHaveBeenCalledWith('survivor_fighting_art')
    expect(mockInsert).toHaveBeenCalledWith({ survivor_id: 'survivor-1', fighting_art_id: 'fa-1' })
    expect(result).toBe('sfa-new')
  })

  it('throws when insert fails', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(addSurvivorFightingArt('survivor-1', 'fa-1')).rejects.toThrow(
      'Error Adding Survivor Fighting Art: Insert failed'
    )
  })
})

describe('removeSurvivorFightingArt', () => {
  it('deletes matching junction row', async () => {
    const mockSecondEq = vi.fn().mockResolvedValue({ error: null })
    const mockFirstEq = vi.fn().mockReturnValue({ eq: mockSecondEq })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockFirstEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSurvivorFightingArt('survivor-1', 'fa-1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('survivor_fighting_art')
    expect(mockFirstEq).toHaveBeenCalledWith('survivor_id', 'survivor-1')
    expect(mockSecondEq).toHaveBeenCalledWith('fighting_art_id', 'fa-1')
  })

  it('throws when delete fails', async () => {
    const mockSecondEq = vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockFirstEq = vi.fn().mockReturnValue({ eq: mockSecondEq })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockFirstEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSurvivorFightingArt('survivor-1', 'fa-1')).rejects.toThrow(
      'Error Removing Survivor Fighting Art: Delete failed'
    )
  })
})

describe('updateSurvivorFightingArt', () => {
  it('updates matching row', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSurvivorFightingArt('sfa-1', { fighting_art_id: 'fa-2' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('survivor_fighting_art')
    expect(mockUpdate).toHaveBeenCalledWith({ fighting_art_id: 'fa-2' })
    expect(mockEq).toHaveBeenCalledWith('id', 'sfa-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(updateSurvivorFightingArt('sfa-1', { fighting_art_id: 'fa-2' })).rejects.toThrow(
      'Error Updating Survivor Fighting Art: Update failed'
    )
  })
})
