import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getShowdownSurvivors,
  addShowdownSurvivor,
  updateShowdownSurvivor,
  removeShowdownSurvivor
} = await import('@/lib/dal/showdown-survivor')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getShowdownSurvivors', () => {
  it('returns null when showdownId is null', async () => {
    const result = await getShowdownSurvivors(null)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns null when showdownId is undefined', async () => {
    const result = await getShowdownSurvivors(undefined)

    expect(result).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns a map of showdown survivors', async () => {
    const survivor1 = {
      id: 'ss-1',
      showdown_id: 'showdown-1',
      survivor_id: 'surv-1',
      scout: false,
      knocked_down: false,
      settlement_id: 'settlement-1',
      notes: null
    }
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [survivor1], error: null })
      })
    })

    const result = await getShowdownSurvivors('showdown-1')

    expect(result).toEqual({ 'ss-1': survivor1 })
    expect(mockSupabase.from).toHaveBeenCalledWith('showdown_survivor')
  })

  it('returns null when data is null', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null })
      })
    })

    const result = await getShowdownSurvivors('showdown-1')

    expect(result).toBeNull()
  })

  it('returns an empty map when no survivors are found', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })

    const result = await getShowdownSurvivors('showdown-1')

    expect(result).toEqual({})
  })

  it('throws when query fails', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
      })
    })

    await expect(getShowdownSurvivors('showdown-1')).rejects.toThrow(
      'Error Fetching Showdown Survivors: DB error'
    )
  })
})

describe('addShowdownSurvivor', () => {
  it('inserts a showdown survivor and returns the id', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'ss-1' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addShowdownSurvivor({ showdown_id: 'showdown-1', survivor_id: 'surv-1' })

    expect(result).toBe('ss-1')
    expect(mockSupabase.from).toHaveBeenCalledWith('showdown_survivor')
  })

  it('throws when insert fails', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addShowdownSurvivor({ showdown_id: 'showdown-1', survivor_id: 'surv-1' })
    ).rejects.toThrow('Error Adding Showdown Survivor: Insert failed')
  })
})

describe('updateShowdownSurvivor', () => {
  it('updates a showdown survivor successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateShowdownSurvivor('ss-1', { knocked_down: true })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('showdown_survivor')
    expect(mockUpdate).toHaveBeenCalledWith({ knocked_down: true })
    expect(mockEq).toHaveBeenCalledWith('id', 'ss-1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(updateShowdownSurvivor('ss-1', { knocked_down: true })).rejects.toThrow(
      'Error Updating Showdown Survivor: Update failed'
    )
  })
})

describe('removeShowdownSurvivor', () => {
  it('removes a showdown survivor successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeShowdownSurvivor('ss-1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('showdown_survivor')
    expect(mockEq).toHaveBeenCalledWith('id', 'ss-1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeShowdownSurvivor('ss-1')).rejects.toThrow(
      'Error Removing Showdown Survivor: Delete failed'
    )
  })
})
