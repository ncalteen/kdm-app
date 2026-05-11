import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  auth: { getUser: vi.fn() },
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

const { getCharacters, addCharacter, updateCharacter, removeCharacter } =
  await import('@/lib/dal/character')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getCharacters', () => {
  const mockUser = { id: 'user-1' }
  const row1 = { id: 'c1', custom: false, character_name: 'Survivor', is_named: true }
  const row2 = { id: 'c2', custom: true, character_name: 'Custom', is_named: false }

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

    const result = await getCharacters()

    expect(result).toEqual({ [row1.id]: row1, [row2.id]: row2 })
    expect(mockSupabase.from).toHaveBeenCalledWith('character')
  })

  it('throws when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(getCharacters()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when auth errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(getCharacters()).rejects.toThrow(
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

    await expect(getCharacters()).rejects.toThrow(
      'Error Fetching Characters: DB error'
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

    const result = await getCharacters()
    expect(result).toEqual({})
  })
})

describe('addCharacter', () => {
  const mockUser = { id: 'user-1' }
  const mockCharacter = { id: 'c1', custom: false, character_name: 'Warrior' }

  it('inserts a non-custom character without user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: mockCharacter, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addCharacter({
      character_name: 'Warrior',
      custom: false
    })

    expect(result).toEqual(mockCharacter)
    expect(mockInsert).toHaveBeenCalledWith({
      character_name: 'Warrior',
      custom: false
    })
  })

  it('inserts a custom character with user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const customCharacter = {
      id: 'c2',
      custom: true,
      character_name: 'My Hero'
    }
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: customCharacter, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    const result = await addCharacter({
      character_name: 'My Hero',
      custom: true
    })

    expect(result).toEqual(customCharacter)
    expect(mockInsert).toHaveBeenCalledWith({
      character_name: 'My Hero',
      custom: true,
      user_id: mockUser.id
    })
  })

  it('throws when custom character requires auth but user is null', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    await expect(
      addCharacter({ character_name: 'My Hero', custom: true })
    ).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when auth returns an error', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' }
    })

    await expect(
      addCharacter({ character_name: 'Warrior', custom: false })
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
      addCharacter({ character_name: 'Warrior', custom: false })
    ).rejects.toThrow('Error Adding Character: Insert failed')
  })
})

describe('updateCharacter', () => {
  it('updates a character successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateCharacter('c1', { character_name: 'Updated Warrior' })
    ).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('character')
    expect(mockUpdate).toHaveBeenCalledWith({
      character_name: 'Updated Warrior'
    })
    expect(mockEq).toHaveBeenCalledWith('id', 'c1')
  })

  it('throws when update fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Update failed' } })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ update: mockUpdate })

    await expect(
      updateCharacter('c1', { character_name: 'Warrior' })
    ).rejects.toThrow('Error Updating Character: Update failed')
  })
})

describe('removeCharacter', () => {
  it('removes a character successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeCharacter('c1')).resolves.toBeUndefined()

    expect(mockSupabase.from).toHaveBeenCalledWith('character')
    expect(mockEq).toHaveBeenCalledWith('id', 'c1')
  })

  it('throws when delete fails', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ delete: mockDelete })

    await expect(removeCharacter('c1')).rejects.toThrow(
      'Error Removing Character: Delete failed'
    )
  })
})
