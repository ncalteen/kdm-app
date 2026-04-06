import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getHuntSurvivors,
  addHuntSurvivor,
  updateHuntSurvivor,
  removeHuntSurvivor
} = await import('@/lib/dal/hunt-survivor')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getHuntSurvivors', () => {
  it('returns null when huntId is null', async () => {
    const result = await getHuntSurvivors(null)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns null when huntId is undefined', async () => {
    const result = await getHuntSurvivors(undefined)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns a map of hunt survivors', async () => {
    const survivor1 = {
      id: 'hs-1',
      hunt_id: 'hunt-1',
      survivor_id: 'surv-1',
      scout: false,
      settlement_id: 'settlement-1',
      notes: null
    }
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [survivor1], error: null })
      })
    })

    const result = await getHuntSurvivors('hunt-1')

    expect(result).toEqual({ 'hs-1': survivor1 })
    expect(mockSupabase.from).toHaveBeenCalledWith('hunt_survivor')
  })

  it('returns null when data is null', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null })
      })
    })

    const result = await getHuntSurvivors('hunt-1')

    expect(result).toBeNull()
  })

  it('returns an empty map when no survivors are found', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })

    const result = await getHuntSurvivors('hunt-1')

    expect(result).toEqual({})
  })

  it('throws when query fails', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi
          .fn()
          .mockResolvedValue({ data: null, error: { message: 'DB error' } })
      })
    })

    await expect(getHuntSurvivors('hunt-1')).rejects.toThrow(
      'Error Fetching Hunt Survivors: DB error'
    )
  })
})

describe('addHuntSurvivor', () => {
  it('inserts a hunt survivor and returns the id', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: { id: 'hs-1' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addHuntSurvivor({
      hunt_id: 'hunt-1',
      survivor_id: 'surv-1'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    expect(result).toBe('hs-1')
    expect(mockSupabase.from).toHaveBeenCalledWith('hunt_survivor')
  })

  it('throws when insert fails', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      addHuntSurvivor({ hunt_id: 'hunt-1', survivor_id: 'surv-1' } as any)
    ).rejects.toThrow('Error Adding Hunt Survivor: Insert failed')
  })
})

describe('updateHuntSurvivor', () => {
  it('updates a hunt survivor successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateHuntSurvivor('hs-1', { scout: true })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('hunt_survivor')
    expect(mockUpdate).toHaveBeenCalledWith({ scout: true })
    expect(mockEq).toHaveBeenCalledWith('id', 'hs-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(updateHuntSurvivor('hs-1', { scout: true })).rejects.toThrow(
      'Error Updating Hunt Survivor: Update failed'
    )
  })
})

describe('removeHuntSurvivor', () => {
  it('removes a hunt survivor successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeHuntSurvivor('hs-1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('hunt_survivor')
    expect(mockEq).toHaveBeenCalledWith('id', 'hs-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeHuntSurvivor('hs-1')).rejects.toThrow(
      'Error Removing Hunt Survivor: Delete failed'
    )
  })
})
