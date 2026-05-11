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
  getLocations,
  getLocationIds,
  addLocation,
  updateLocation,
  removeLocation
} = await import('@/lib/dal/location')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getLocations', () => {
  const mockUser = { id: 'user-1' }
  const row1 = { id: 'l1', custom: false, location_name: 'Location', tags: [] }
  const row2 = { id: 'l2', custom: true, location_name: 'Custom', tags: [] }

  it('returns every row surfaced by RLS', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({
        data: [row1, row2],
        error: null
      })
    })

    const result = await getLocations()

    expect(result).toEqual({ [row1.id]: row1, [row2.id]: row2 })
    expect(mockSupabase.from).toHaveBeenCalledWith('location')
  })

  it('throws when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(getLocations()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(getLocations()).rejects.toThrow(
      'Error Fetching User: Auth error'
    )
  })

  it('throws when the query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSupabase.from.mockReturnValueOnce({
      select: vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    })

    await expect(getLocations()).rejects.toThrow(
      'Error Fetching Locations: DB error'
    )
  })

  it('returns an empty map when the query returns no rows', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({ data: [], error: null })
    })

    const result = await getLocations()
    expect(result).toEqual({})
  })
})

describe('getLocationIds', () => {
  it('returns location IDs without userId', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 'l1' }, { id: 'l2' }], error: null })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEq })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getLocationIds(['Lantern Hoard', 'Bone Smith'], false)

    expect(result).toEqual(['l1', 'l2'])
    expect(mockSupabase.from).toHaveBeenCalledWith('location')
  })

  it('returns location IDs with userId (adds user_id filter)', async () => {
    const mockEq2 = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 'l3' }], error: null })
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEq1 })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getLocationIds(['My Location'], true, 'user-1')

    expect(result).toEqual(['l3'])
    expect(mockEq2).toHaveBeenCalledWith('user_id', 'user-1')
  })

  it('throws when DB query fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEq })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getLocationIds(['Lantern Hoard'], false)).rejects.toThrow(
      'Error Fetching Location ID(s): DB error'
    )
  })

  it('throws when data is null', async () => {
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEq })
    const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getLocationIds(['Lantern Hoard'], false)).rejects.toThrow(
      'Location(s) Not Found'
    )
  })
})

describe('addLocation', () => {
  const mockUser = { id: 'user-1' }
  const mockLocation = {
    id: 'l1',
    custom: false,
    location_name: 'Lantern Hoard'
  }

  it('inserts a non-custom location without user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: mockLocation, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addLocation({
      location_name: 'Lantern Hoard',
      custom: false
    })

    expect(result).toEqual(mockLocation)
    expect(mockInsert).toHaveBeenCalledWith({
      location_name: 'Lantern Hoard',
      custom: false
    })
  })

  it('inserts a custom location with user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const customLocation = {
      id: 'l2',
      custom: true,
      location_name: 'My Location'
    }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: customLocation, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addLocation({
      location_name: 'My Location',
      custom: true
    })

    expect(result).toEqual(customLocation)
    expect(mockInsert).toHaveBeenCalledWith({
      location_name: 'My Location',
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
      addLocation({ location_name: 'My Location', custom: true })
    ).rejects.toThrow('Not Authenticated')
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(
      addLocation({ location_name: 'Lantern Hoard', custom: false })
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
      addLocation({ location_name: 'Lantern Hoard', custom: false })
    ).rejects.toThrow('Error Adding Location: Insert failed')
  })
})

describe('updateLocation', () => {
  it('updates a location successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateLocation('l1', { location_name: 'Updated Lantern Hoard' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('location')
    expect(mockEq).toHaveBeenCalledWith('id', 'l1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateLocation('l1', { location_name: 'Lantern Hoard' })
    ).rejects.toThrow('Error Updating Location: Update failed')
  })
})

describe('removeLocation', () => {
  it('removes a location successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeLocation('l1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('location')
    expect(mockEq).toHaveBeenCalledWith('id', 'l1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeLocation('l1')).rejects.toThrow(
      'Error Removing Location: Delete failed'
    )
  })
})
