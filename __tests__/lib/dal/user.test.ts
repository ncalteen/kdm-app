import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the Supabase client module.
const mockSupabase = {
  auth: {
    getUser: vi.fn()
  },
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

// Import after mocking so the module picks up the mock.
const { getUserSettings } = await import('@/lib/dal/user')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getUserSettings', () => {
  const mockUser = { id: 'user-1', email: 'test@example.com' }
  const mockSettings = {
    id: 'settings-1',
    user_id: 'user-1',
    unlocked_killenium_butcher: false,
    unlocked_screaming_nukalope: true,
    unlocked_white_gigalion: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  }

  it('returns user settings for the authenticated user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser }
    })

    const mockSingle = vi.fn().mockResolvedValue({
      data: mockSettings,
      error: null
    })
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const result = await getUserSettings()

    expect(mockSupabase.from).toHaveBeenCalledWith('user_settings')
    expect(mockSelect).toHaveBeenCalledWith('*')
    expect(mockEq).toHaveBeenCalledWith('user_id', mockUser.id)
    expect(mockSingle).toHaveBeenCalledOnce()
    expect(result).toEqual(mockSettings)
  })

  it('throws an error when no user is authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null }
    })

    await expect(getUserSettings()).rejects.toThrow('Not Authenticated')
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('throws an error when the query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser }
    })

    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database error' }
    })
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    await expect(getUserSettings()).rejects.toThrow(
      'Error Fetching User Settings: Database error'
    )
  })
})
