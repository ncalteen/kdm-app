import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  auth: { getUser: vi.fn() },
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const {
  getNemesisLocationJunctionIds,
  getNemesisLocationIds,
  getNemesisLocations,
  addNemesisLocation,
  updateNemesisLocation,
  removeNemesisLocation
} = await import('@/lib/dal/nemesis-location')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getNemesisLocationJunctionIds', () => {
  it('returns junction row IDs for a nemesis', async () => {
    const mockEq = vi.fn().mockResolvedValue({
      data: [{ id: 'jid1' }, { id: 'jid2' }],
      error: null
    })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getNemesisLocationJunctionIds('n1')

    expect(result).toEqual(['jid1', 'jid2'])
    expect(mockSupabase.from).toHaveBeenCalledWith('nemesis_location')
    expect(mockEq).toHaveBeenCalledWith('nemesis_id', 'n1')
  })

  it('returns empty array when no junctions exist', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getNemesisLocationJunctionIds('n1')

    expect(result).toEqual([])
  })

  it('throws when query fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getNemesisLocationJunctionIds('n1')).rejects.toThrow(
      'Error Fetching Nemesis Location Junction IDs: DB error'
    )
  })
})

describe('getNemesisLocationIds', () => {
  it('throws when nemesisId is null', async () => {
    await expect(getNemesisLocationIds(null)).rejects.toThrow(
      'Required: Nemesis ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when nemesisId is undefined', async () => {
    await expect(getNemesisLocationIds(undefined)).rejects.toThrow(
      'Required: Nemesis ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns location IDs for a valid nemesis', async () => {
    const mockEq = vi.fn().mockResolvedValue({
      data: [{ location_id: 'loc1' }, { location_id: 'loc2' }],
      error: null
    })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getNemesisLocationIds('n1')

    expect(result).toEqual(['loc1', 'loc2'])
  })

  it('throws when query fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getNemesisLocationIds('n1')).rejects.toThrow(
      'Error Fetching Nemesis Location IDs: DB error'
    )
  })

  it('throws when data is null', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getNemesisLocationIds('n1')).rejects.toThrow(
      'Nemesis Location ID(s) Not Found'
    )
  })
})

describe('getNemesisLocations', () => {
  it('throws when nemesisId is null', async () => {
    await expect(getNemesisLocations(null)).rejects.toThrow(
      'Required: Nemesis ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when nemesisId is undefined', async () => {
    await expect(getNemesisLocations(undefined)).rejects.toThrow(
      'Required: Nemesis ID'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('returns location data for a valid nemesis', async () => {
    const locationRow = {
      location: { custom: false, id: 'loc1', location_name: 'Forest' }
    }
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: [locationRow], error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getNemesisLocations('n1')

    expect(result).toEqual([
      { custom: false, id: 'loc1', location_name: 'Forest' }
    ])
  })

  it('throws when query fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getNemesisLocations('n1')).rejects.toThrow(
      'Error Fetching Nemesis Location Data: DB error'
    )
  })

  it('throws when data is null', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getNemesisLocations('n1')).rejects.toThrow(
      'Nemesis Location Data Not Found'
    )
  })
})

describe('addNemesisLocation', () => {
  it('inserts a nemesis location and returns its id', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: { id: 'nll1' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addNemesisLocation({
      nemesis_id: 'n1',
      location_id: 'loc1'
    })

    expect(result).toBe('nll1')
    expect(mockSupabase.from).toHaveBeenCalledWith('nemesis_location')
    expect(mockInsert).toHaveBeenCalledWith({
      nemesis_id: 'n1',
      location_id: 'loc1'
    })
  })

  it('throws when insert fails', async () => {
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    await expect(
      addNemesisLocation({ nemesis_id: 'n1', location_id: 'loc1' })
    ).rejects.toThrow('Error Adding Nemesis Location: Insert failed')
  })
})

describe('updateNemesisLocation', () => {
  it('updates a nemesis location successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateNemesisLocation('nll1', { location_id: 'loc2' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('nemesis_location')
    expect(mockEq).toHaveBeenCalledWith('id', 'nll1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateNemesisLocation('nll1', { location_id: 'loc2' })
    ).rejects.toThrow('Error Updating Nemesis Location: Update failed')
  })
})

describe('removeNemesisLocation', () => {
  it('removes a nemesis location successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeNemesisLocation('nll1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('nemesis_location')
    expect(mockEq).toHaveBeenCalledWith('id', 'nll1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeNemesisLocation('nll1')).rejects.toThrow(
      'Error Removing Nemesis Location: Delete failed'
    )
  })
})
