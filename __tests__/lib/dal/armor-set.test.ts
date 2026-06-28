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

const {
  getArmorSets,
  getUserCustomArmorSets,
  addArmorSet,
  updateArmorSet,
  removeArmorSet
} = await import('@/lib/dal/armor-set')
const { getUserId, getUserIdOrNull } = await import('@/lib/dal/user')

beforeEach(() => {
  vi.clearAllMocks()
})

function mockOrderedArmorSetQuery(
  data: object[] | null,
  error: { message: string } | null = null
): void {
  const order3 = vi.fn().mockResolvedValue({ data, error })
  const order2 = vi.fn().mockReturnValue({ order: order3 })
  const order1 = vi.fn().mockReturnValue({ order: order2 })

  mockSupabase.from.mockReturnValue({
    select: vi.fn().mockReturnValue({ order: order1 })
  })
}

function mockCustomArmorSetQuery(
  data: object[] | null,
  error: { message: string } | null = null
): void {
  const order3 = vi.fn().mockResolvedValue({ data, error })
  const order2 = vi.fn().mockReturnValue({ order: order3 })
  const order1 = vi.fn().mockReturnValue({ order: order2 })
  const is = vi.fn().mockReturnValue({ order: order1 })
  const eq2 = vi.fn().mockReturnValue({ is })
  const eq1 = vi.fn().mockReturnValue({ eq: eq2 })

  mockSupabase.from.mockReturnValue({
    select: vi.fn().mockReturnValue({ eq: eq1 })
  })
}

describe('getArmorSets', () => {
  const userId = 'user-1'
  const armorSet = {
    id: 'armor-set-1',
    custom: false,
    armor_set_name: 'Rawhide',
    bonuses: null,
    slots: []
  }

  it('returns every armor set surfaced by RLS', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)
    mockOrderedArmorSetQuery([armorSet])

    const result = await getArmorSets()

    expect(result).toEqual([armorSet])
    expect(mockSupabase.from).toHaveBeenCalledWith('armor_set')
  })

  it('throws when user is not authenticated', async () => {
    vi.mocked(getUserId).mockRejectedValue(new Error('Not Authenticated'))

    await expect(getArmorSets()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws when query fails', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)
    mockOrderedArmorSetQuery(null, { message: 'DB error' })

    await expect(getArmorSets()).rejects.toThrow(
      'Error Fetching Armor Sets: DB error'
    )
  })
})

describe('getUserCustomArmorSets', () => {
  const userId = 'user-1'

  it('returns only active custom armor sets for the authenticated user', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)
    const armorSet = {
      id: 'custom-armor-set-1',
      custom: true,
      armor_set_name: 'Lantern Shell',
      bonuses: null,
      slots: []
    }
    mockCustomArmorSetQuery([armorSet])

    const result = await getUserCustomArmorSets()

    expect(result).toEqual([armorSet])
  })

  it('throws when query fails', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)
    mockCustomArmorSetQuery(null, { message: 'DB error' })

    await expect(getUserCustomArmorSets()).rejects.toThrow(
      'Error Fetching Custom Armor Sets: DB error'
    )
  })
})

describe('addArmorSet', () => {
  const userId = 'user-1'
  const armorSet = {
    id: 'armor-set-1',
    custom: true,
    armor_set_name: 'Lantern Shell',
    bonuses: null,
    slots: []
  }

  it('inserts a non-custom armor set without user_id', async () => {
    vi.mocked(getUserIdOrNull).mockResolvedValue(userId)
    const single = vi.fn().mockResolvedValue({ data: armorSet, error: null })
    const select = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select })
    mockSupabase.from.mockReturnValue({ insert })

    const result = await addArmorSet({
      custom: false,
      armor_set_name: 'Lantern Shell'
    })

    expect(result).toEqual(armorSet)
    expect(insert).toHaveBeenCalledWith({
      custom: false,
      armor_set_name: 'Lantern Shell'
    })
  })

  it('ignores caller-provided user_id when inserting a custom armor set', async () => {
    vi.mocked(getUserIdOrNull).mockResolvedValue(userId)
    const single = vi.fn().mockResolvedValue({ data: armorSet, error: null })
    const select = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select })
    mockSupabase.from.mockReturnValue({ insert })

    await addArmorSet({
      custom: true,
      armor_set_name: 'Lantern Shell',
      user_id: 'other-user'
    } as Parameters<typeof addArmorSet>[0])

    expect(insert).toHaveBeenCalledWith({
      custom: true,
      armor_set_name: 'Lantern Shell',
      user_id: userId
    })
  })

  it('throws when custom requires auth but user is null', async () => {
    vi.mocked(getUserIdOrNull).mockResolvedValue(null)

    await expect(
      addArmorSet({ custom: true, armor_set_name: 'Lantern Shell' })
    ).rejects.toThrow('Not Authenticated')
  })
})

describe('updateArmorSet', () => {
  it('updates an armor set', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    mockSupabase.from.mockReturnValue({ update })

    await updateArmorSet('armor-set-1', { armor_set_name: 'Lantern Shell' })

    expect(update).toHaveBeenCalledWith({ armor_set_name: 'Lantern Shell' })
    expect(eq).toHaveBeenCalledWith('id', 'armor-set-1')
  })

  it('allows archived_at updates while ignoring custom and user_id', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    mockSupabase.from.mockReturnValue({ update })

    await updateArmorSet('armor-set-1', {
      archived_at: '2026-06-27T00:00:00.000Z',
      custom: false,
      user_id: 'other-user'
    } as Parameters<typeof updateArmorSet>[1])

    expect(update).toHaveBeenCalledWith({
      archived_at: '2026-06-27T00:00:00.000Z'
    })
  })

  it('throws when update fails', async () => {
    mockSupabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'Update failed' } })
      })
    })

    await expect(
      updateArmorSet('armor-set-1', { armor_set_name: 'Lantern Shell' })
    ).rejects.toThrow('Error Updating Armor Set: Update failed')
  })
})

describe('removeArmorSet', () => {
  it('removes an armor set', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const remove = vi.fn().mockReturnValue({ eq })
    mockSupabase.from.mockReturnValue({ delete: remove })

    await removeArmorSet('armor-set-1')

    expect(eq).toHaveBeenCalledWith('id', 'armor-set-1')
  })

  it('throws when delete fails', async () => {
    mockSupabase.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
      })
    })

    await expect(removeArmorSet('armor-set-1')).rejects.toThrow(
      'Error Removing Armor Set: Delete failed'
    )
  })
})
