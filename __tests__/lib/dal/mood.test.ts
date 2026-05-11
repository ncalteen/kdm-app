import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

vi.mock('@/lib/dal/user', () => ({
  getUserId: vi.fn(),
  getUserIdOrNull: vi.fn()
}))

const { getMoods, addMood, updateMood, removeMood, resolveMoodNames } =
  await import('@/lib/dal/mood')
const { getUserId, getUserIdOrNull } = await import('@/lib/dal/user')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getMoods', () => {
  const userId = 'user-1'
  const row1 = { id: 'm1', custom: false, mood_name: 'Mood', rules: null }
  const row2 = { id: 'm2', custom: true, mood_name: 'Custom', rules: null }

  it('returns every row surfaced by RLS', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({
        data: [row1, row2],
        error: null
      })
    })

    const result = await getMoods()

    expect(result).toEqual({ [row1.id]: row1, [row2.id]: row2 })
    expect(mockSupabase.from).toHaveBeenCalledWith('mood')
  })

  it('throws when user is not authenticated', async () => {
    vi.mocked(getUserId).mockRejectedValue(new Error('Not Authenticated'))

    await expect(getMoods()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when auth errors', async () => {
    vi.mocked(getUserId).mockRejectedValue(
      new Error('Error Fetching User: Auth error')
    )

    await expect(getMoods()).rejects.toThrow('Error Fetching User: Auth error')
  })

  it('throws when the query fails', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)

    mockSupabase.from.mockReturnValueOnce({
      select: vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    })

    await expect(getMoods()).rejects.toThrow('Error Fetching Moods: DB error')
  })

  it('returns an empty map when the query returns no rows', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({ data: [], error: null })
    })

    const result = await getMoods()
    expect(result).toEqual({})
  })
})

describe('addMood', () => {
  const userId = 'user-1'

  it('inserts a non-custom mood without user_id', async () => {
    vi.mocked(getUserIdOrNull).mockResolvedValue(userId)
    const single = vi
      .fn()
      .mockResolvedValue({ data: { id: 'm1' }, error: null })
    const select = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select })
    mockSupabase.from.mockReturnValue({ insert })

    const result = await addMood({ custom: false, mood_name: 'A' })
    expect(result).toEqual({ id: 'm1' })
    expect(insert).toHaveBeenCalledWith({ custom: false, mood_name: 'A' })
  })

  it('inserts a custom mood with user_id', async () => {
    vi.mocked(getUserIdOrNull).mockResolvedValue(userId)
    const single = vi
      .fn()
      .mockResolvedValue({ data: { id: 'm2' }, error: null })
    const select = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select })
    mockSupabase.from.mockReturnValue({ insert })

    await addMood({ custom: true, mood_name: 'B' })
    expect(insert).toHaveBeenCalledWith({
      custom: true,
      mood_name: 'B',
      user_id: userId
    })
  })

  it('throws when custom mood requires auth but user is null', async () => {
    vi.mocked(getUserIdOrNull).mockResolvedValue(null)
    await expect(addMood({ custom: true, mood_name: 'X' })).rejects.toThrow(
      'Not Authenticated'
    )
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws on insert error', async () => {
    vi.mocked(getUserIdOrNull).mockResolvedValue(userId)
    const single = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'fail' } })
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({ single })
      })
    })

    await expect(addMood({ custom: false, mood_name: 'A' })).rejects.toThrow(
      'Error Adding Mood: fail'
    )
  })
})

describe('updateMood', () => {
  it('updates a mood', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    mockSupabase.from.mockReturnValue({ update })

    await updateMood('m1', { mood_name: 'X' })
    expect(update).toHaveBeenCalledWith({ mood_name: 'X' })
    expect(eq).toHaveBeenCalledWith('id', 'm1')
  })

  it('throws on update error', async () => {
    const eq = vi.fn().mockResolvedValue({ error: { message: 'fail' } })
    mockSupabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({ eq })
    })

    await expect(updateMood('m1', { mood_name: 'X' })).rejects.toThrow(
      'Error Updating Mood: fail'
    )
  })
})

describe('removeMood', () => {
  it('removes a mood', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({ eq })
    })

    await removeMood('m1')
    expect(eq).toHaveBeenCalledWith('id', 'm1')
  })

  it('throws on delete error', async () => {
    const eq = vi.fn().mockResolvedValue({ error: { message: 'fail' } })
    mockSupabase.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({ eq })
    })

    await expect(removeMood('m1')).rejects.toThrow('Error Removing Mood: fail')
  })
})

describe('resolveMoodNames', () => {
  const userId = 'user-1'

  it('returns empty array for empty/whitespace input', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)
    const result = await resolveMoodNames([
      '',
      '   ',
      null as unknown as string
    ])
    expect(result).toEqual([])
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('reuses existing rows and inserts missing ones (case-insensitive, dedupes)', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)

    // Existing lookup
    const or = vi.fn().mockResolvedValue({
      data: [{ id: 'e1', mood_name: 'Aloof', custom: false, user_id: null }],
      error: null
    })
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({ or })
    })

    // Insert for missing
    const single = vi
      .fn()
      .mockResolvedValue({ data: { id: 'new1' }, error: null })
    mockSupabase.from.mockReturnValueOnce({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({ single })
      })
    })

    const result = await resolveMoodNames([
      'Aloof',
      'aloof', // dedup
      '  New ', // trim + insert
      'New' // dedup of new
    ])

    expect(result).toEqual(['e1', 'new1'])
  })

  it('throws when existing-lookup fails', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        or: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB' } })
      })
    })

    await expect(resolveMoodNames(['x'])).rejects.toThrow(
      'Error Resolving Moods: DB'
    )
  })

  it('throws when insert fails', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        or: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    })
    mockSupabase.from.mockReturnValueOnce({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi
            .fn()
            .mockResolvedValue({ data: null, error: { message: 'fail' } })
        })
      })
    })

    await expect(resolveMoodNames(['x'])).rejects.toThrow(
      'Error Adding Mood: fail'
    )
  })
})
