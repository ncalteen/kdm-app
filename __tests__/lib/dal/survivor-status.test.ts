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
  getSurvivorStatuses,
  addSurvivorStatus,
  updateSurvivorStatus,
  removeSurvivorStatus,
  resolveSurvivorStatusNames
} = await import('@/lib/dal/survivor-status')
const { getUserId, getUserIdOrNull } = await import('@/lib/dal/user')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getSurvivorStatuses', () => {
  const userId = 'user-1'
  const nonCustom = {
    id: 's1',
    custom: false,
    survivor_status_name: 'Cursed',
    rules: null
  }
  const userCustom = {
    id: 's2',
    custom: true,
    survivor_status_name: 'Mine',
    rules: null
  }
  const shared = {
    id: 's3',
    custom: true,
    survivor_status_name: 'Shared',
    rules: null
  }

  it('returns statuses from all three sources', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)
    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [nonCustom], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [userCustom], error: null })
          })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ survivor_status: [shared] }],
            error: null
          })
        })
      })

    const result = await getSurvivorStatuses()
    expect(result).toEqual({ s1: nonCustom, s2: userCustom, s3: shared })
  })

  it('handles shared status as single object', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)
    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ survivor_status: shared }],
            error: null
          })
        })
      })

    const result = await getSurvivorStatuses()
    expect(result).toEqual({ s3: shared })
  })

  it('skips shared rows with null status', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)
    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ survivor_status: null }],
            error: null
          })
        })
      })

    const result = await getSurvivorStatuses()
    expect(result).toEqual({})
  })

  it('throws on query error', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)
    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi
            .fn()
            .mockResolvedValue({ data: null, error: { message: 'DB' } })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      })

    await expect(getSurvivorStatuses()).rejects.toThrow(
      'Error Fetching Survivor Statuses: DB'
    )
  })
})

describe('addSurvivorStatus', () => {
  const userId = 'user-1'

  it('inserts a non-custom status without user_id', async () => {
    vi.mocked(getUserIdOrNull).mockResolvedValue(userId)
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 's1' }, error: null })
        })
      })
    })

    const result = await addSurvivorStatus({
      custom: false,
      survivor_status_name: 'A'
    })
    expect(result).toEqual({ id: 's1' })
  })

  it('inserts a custom status with user_id', async () => {
    vi.mocked(getUserIdOrNull).mockResolvedValue(userId)
    const insert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: 's2' }, error: null })
      })
    })
    mockSupabase.from.mockReturnValue({ insert })

    await addSurvivorStatus({ custom: true, survivor_status_name: 'B' })
    expect(insert).toHaveBeenCalledWith({
      custom: true,
      survivor_status_name: 'B',
      user_id: userId
    })
  })

  it('throws when custom status requires auth but user is null', async () => {
    vi.mocked(getUserIdOrNull).mockResolvedValue(null)
    await expect(
      addSurvivorStatus({ custom: true, survivor_status_name: 'X' })
    ).rejects.toThrow('Not Authenticated')
  })

  it('throws on insert error', async () => {
    vi.mocked(getUserIdOrNull).mockResolvedValue(userId)
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi
            .fn()
            .mockResolvedValue({ data: null, error: { message: 'fail' } })
        })
      })
    })

    await expect(
      addSurvivorStatus({ custom: false, survivor_status_name: 'A' })
    ).rejects.toThrow('Error Adding Survivor Status: fail')
  })
})

describe('updateSurvivorStatus', () => {
  it('updates a status', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({ eq })
    })

    await updateSurvivorStatus('s1', { survivor_status_name: 'X' })
    expect(eq).toHaveBeenCalledWith('id', 's1')
  })

  it('throws on update error', async () => {
    mockSupabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'fail' } })
      })
    })

    await expect(
      updateSurvivorStatus('s1', { survivor_status_name: 'X' })
    ).rejects.toThrow('Error Updating Survivor Status: fail')
  })
})

describe('removeSurvivorStatus', () => {
  it('removes a status', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({ eq })
    })

    await removeSurvivorStatus('s1')
    expect(eq).toHaveBeenCalledWith('id', 's1')
  })

  it('throws on delete error', async () => {
    mockSupabase.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'fail' } })
      })
    })

    await expect(removeSurvivorStatus('s1')).rejects.toThrow(
      'Error Removing Survivor Status: fail'
    )
  })
})

describe('resolveSurvivorStatusNames', () => {
  const userId = 'user-1'

  it('returns empty array for empty input', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)
    const result = await resolveSurvivorStatusNames(['', '   '])
    expect(result).toEqual([])
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('reuses existing rows and inserts missing ones', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        or: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'e1',
              survivor_status_name: 'Cursed',
              custom: false,
              user_id: null
            }
          ],
          error: null
        })
      })
    })
    mockSupabase.from.mockReturnValueOnce({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi
            .fn()
            .mockResolvedValue({ data: { id: 'new1' }, error: null })
        })
      })
    })

    const result = await resolveSurvivorStatusNames([
      'Cursed',
      'cursed',
      '  Bleed '
    ])
    expect(result).toEqual(['e1', 'new1'])
  })

  it('throws when lookup fails', async () => {
    vi.mocked(getUserId).mockResolvedValue(userId)
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        or: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB' } })
      })
    })

    await expect(resolveSurvivorStatusNames(['x'])).rejects.toThrow(
      'Error Resolving Survivor Statuses: DB'
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

    await expect(resolveSurvivorStatusNames(['x'])).rejects.toThrow(
      'Error Adding Survivor Status: fail'
    )
  })
})
