import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock supabase client
const mockDelete = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ data: null, error: null })
  })
})
const mockSettlementDelete = vi.fn().mockReturnValue({
  eq: vi.fn().mockResolvedValue({ data: null, error: null })
})

const mockFrom = vi.fn((table: string) => {
  if (table === 'settlement') {
    return {
      delete: mockSettlementDelete,
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'settlement-1',
              survivor_type: 'CORE',
              philosophies: []
            },
            error: null
          })
        })
      })
    }
  }
  return {
    delete: mockDelete,
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi
          .fn()
          .mockResolvedValue({ data: { id: 'new-id' }, error: null })
      })
    }),
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: [], error: null })
    })
  }
})

const mockAuth = {
  getUser: vi.fn()
}
const mockSupabase = {
  auth: mockAuth,
  from: mockFrom
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

// Mock toast
const mockToast = {
  error: vi.fn(),
  success: vi.fn()
}

vi.mock('sonner', () => ({
  toast: mockToast
}))

// Mock saveToLocalStorage
const mockSaveToLocalStorage = vi.fn()
vi.mock('@/lib/utils', () => ({
  saveToLocalStorage: mockSaveToLocalStorage
}))

const { generateSeedData } = await import('@/lib/seed')

describe('generateSeedData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows error toast when not in development mode', async () => {
    vi.stubEnv('NODE_ENV', 'production')

    await generateSeedData()

    expect(mockToast.error).toHaveBeenCalledWith('Development Mode Only')

    vi.unstubAllEnvs()
  })

  it('shows error toast when in test mode', async () => {
    // NODE_ENV is 'test' during vitest runs
    await generateSeedData()

    expect(mockToast.error).toHaveBeenCalledWith('Development Mode Only')
    expect(mockSupabase.auth.getUser).not.toHaveBeenCalled()
  })

  it('throws auth error when getUser returns an error', async () => {
    vi.stubEnv('NODE_ENV', 'development')

    const authError = new Error('Auth failed')
    mockAuth.getUser.mockResolvedValue({
      data: { user: null },
      error: authError
    })

    await expect(generateSeedData()).rejects.toThrow('Auth failed')

    vi.unstubAllEnvs()
  })
})
