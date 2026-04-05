import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getSurvivorDisorders,
  addSurvivorDisorder,
  removeSurvivorDisorder,
  updateSurvivorDisorder
} = await import('@/lib/dal/survivor-disorder')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getSurvivorDisorders', () => {
  it('throws when survivorId is null', async () => {
    await expect(getSurvivorDisorders(null)).rejects.toThrow('Required: Survivor ID')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when survivorId is undefined', async () => {
    await expect(getSurvivorDisorders(undefined)).rejects.toThrow('Required: Survivor ID')
  })

  it('returns disorders for a survivor', async () => {
    const mockData = [
      { id: 'sd1', disorder_id: 'd1' },
      { id: 'sd2', disorder_id: 'd2' }
    ]
    const mockEq = vi.fn().mockResolvedValue({ data: mockData, error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getSurvivorDisorders('survivor-1')

    expect(mockSupabase.from).toHaveBeenCalledWith('survivor_disorder')
    expect(mockSelect).toHaveBeenCalledWith('id, disorder_id')
    expect(mockEq).toHaveBeenCalledWith('survivor_id', 'survivor-1')
    expect(result).toEqual(mockData)
  })

  it('returns empty array when data is null', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getSurvivorDisorders('survivor-1')

    expect(result).toEqual([])
  })

  it('throws when query fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getSurvivorDisorders('survivor-1')).rejects.toThrow(
      'Error Fetching Survivor Disorders: DB error'
    )
  })
})

describe('addSurvivorDisorder', () => {
  it('inserts and returns the junction row id', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'sd-new' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addSurvivorDisorder('survivor-1', 'disorder-1')

    expect(mockSupabase.from).toHaveBeenCalledWith('survivor_disorder')
    expect(mockInsert).toHaveBeenCalledWith({ survivor_id: 'survivor-1', disorder_id: 'disorder-1' })
    expect(result).toBe('sd-new')
  })

  it('throws when insert fails', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(addSurvivorDisorder('survivor-1', 'disorder-1')).rejects.toThrow(
      'Error Adding Survivor Disorder: Insert failed'
    )
  })
})

describe('removeSurvivorDisorder', () => {
  it('deletes matching junction row', async () => {
    const mockSecondEq = vi.fn().mockResolvedValue({ error: null })
    const mockFirstEq = vi.fn().mockReturnValue({ eq: mockSecondEq })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockFirstEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSurvivorDisorder('survivor-1', 'disorder-1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('survivor_disorder')
    expect(mockFirstEq).toHaveBeenCalledWith('survivor_id', 'survivor-1')
    expect(mockSecondEq).toHaveBeenCalledWith('disorder_id', 'disorder-1')
  })

  it('throws when delete fails', async () => {
    const mockSecondEq = vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockFirstEq = vi.fn().mockReturnValue({ eq: mockSecondEq })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockFirstEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeSurvivorDisorder('survivor-1', 'disorder-1')).rejects.toThrow(
      'Error Removing Survivor Disorder: Delete failed'
    )
  })
})

describe('updateSurvivorDisorder', () => {
  it('updates matching row', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateSurvivorDisorder('sd-1', { disorder_id: 'disorder-2' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('survivor_disorder')
    expect(mockUpdate).toHaveBeenCalledWith({ disorder_id: 'disorder-2' })
    expect(mockEq).toHaveBeenCalledWith('id', 'sd-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(updateSurvivorDisorder('sd-1', { disorder_id: 'disorder-2' })).rejects.toThrow(
      'Error Updating Survivor Disorder: Update failed'
    )
  })
})
