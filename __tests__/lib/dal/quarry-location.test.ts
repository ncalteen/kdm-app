import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  auth: { getUser: vi.fn() },
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getQuarryLocationJunctionIds,
  getQuarryLocationIds,
  getQuarryLocations,
  addQuarryLocation,
  updateQuarryLocation,
  removeQuarryLocations
} = await import('@/lib/dal/quarry-location')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getQuarryLocationJunctionIds', () => {
  it('returns junction row IDs for a quarry', async () => {
    const mockEq = vi.fn().mockResolvedValue({
      data: [{ id: 'jid1' }, { id: 'jid2' }],
      error: null
    })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getQuarryLocationJunctionIds('q1')

    expect(result).toEqual(['jid1', 'jid2'])
    expect(mockSupabase.from).toHaveBeenCalledWith('quarry_location')
    expect(mockEq).toHaveBeenCalledWith('quarry_id', 'q1')
  })

  it('returns empty array when no junctions exist', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getQuarryLocationJunctionIds('q1')

    expect(result).toEqual([])
  })

  it('throws when query fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getQuarryLocationJunctionIds('q1')).rejects.toThrow(
      'Error Fetching Quarry Location Junction IDs: DB error'
    )
  })
})

describe('getQuarryLocationIds', () => {
  it('throws when quarryId is null', async () => {
    await expect(getQuarryLocationIds(null)).rejects.toThrow('Required: Quarry ID')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when quarryId is undefined', async () => {
    await expect(getQuarryLocationIds(undefined)).rejects.toThrow('Required: Quarry ID')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns location IDs for a valid quarry', async () => {
    const mockEq = vi.fn().mockResolvedValue({
      data: [{ location_id: 'loc1' }, { location_id: 'loc2' }],
      error: null
    })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getQuarryLocationIds('q1')

    expect(result).toEqual(['loc1', 'loc2'])
  })

  it('throws when query fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getQuarryLocationIds('q1')).rejects.toThrow(
      'Error Fetching Quarry Location IDs: DB error'
    )
  })

  it('throws when data is null', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getQuarryLocationIds('q1')).rejects.toThrow('Quarry Location ID(s) Not Found')
  })
})

describe('getQuarryLocations', () => {
  it('throws when quarryId is null', async () => {
    await expect(getQuarryLocations(null)).rejects.toThrow('Required: Quarry ID')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when quarryId is undefined', async () => {
    await expect(getQuarryLocations(undefined)).rejects.toThrow('Required: Quarry ID')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns location data for a valid quarry', async () => {
    const locationRow = {
      location: { custom: false, id: 'loc1', location_name: 'Forest' }
    }
    const mockEq = vi.fn().mockResolvedValue({ data: [locationRow], error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getQuarryLocations('q1')

    expect(result).toEqual([{ custom: false, id: 'loc1', location_name: 'Forest' }])
  })

  it('throws when query fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getQuarryLocations('q1')).rejects.toThrow(
      'Error Fetching Quarry Location Data: DB error'
    )
  })

  it('throws when data is null', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getQuarryLocations('q1')).rejects.toThrow('Quarry Location Data Not Found')
  })
})

describe('addQuarryLocation', () => {
  it('inserts a quarry location junction and returns its id', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'ql1' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addQuarryLocation({ quarry_id: 'q1', location_id: 'loc1' })

    expect(result).toBe('ql1')
    expect(mockSupabase.from).toHaveBeenCalledWith('quarry_location')
    expect(mockInsert).toHaveBeenCalledWith({ quarry_id: 'q1', location_id: 'loc1' })
  })

  it('throws when insert fails', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(addQuarryLocation({ quarry_id: 'q1', location_id: 'loc1' })).rejects.toThrow(
      'Error Adding Quarry Location: Insert failed'
    )
  })
})

describe('updateQuarryLocation', () => {
  it('updates a quarry location successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(updateQuarryLocation('ql1', { location_id: 'loc2' })).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('quarry_location')
    expect(mockEq).toHaveBeenCalledWith('id', 'ql1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(updateQuarryLocation('ql1', { location_id: 'loc2' })).rejects.toThrow(
      'Error Updating Quarry Location: Update failed'
    )
  })
})

describe('removeQuarryLocations', () => {
  it('removes multiple quarry locations successfully', async () => {
    const mockIn = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeQuarryLocations(['ql1', 'ql2'])).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('quarry_location')
    expect(mockIn).toHaveBeenCalledWith('id', ['ql1', 'ql2'])
  })

  it('throws when delete fails', async () => {
    const mockIn = vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeQuarryLocations(['ql1'])).rejects.toThrow(
      'Error Removing Quarry Locations: Delete failed'
    )
  })
})
