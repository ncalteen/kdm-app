import { ERROR_MESSAGE } from '@/lib/messages'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const { mockRequireSupabaseAdminUser } = vi.hoisted(() => ({
  mockRequireSupabaseAdminUser: vi.fn()
}))

const { mockAdoptionRpc, mockCreateAdminClient } = vi.hoisted(() => ({
  mockAdoptionRpc: vi.fn(),
  mockCreateAdminClient: vi.fn()
}))

vi.mock('@/lib/supabase/admin-auth', () => ({
  requireSupabaseAdminUser: mockRequireSupabaseAdminUser
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: mockCreateAdminClient
}))

const adoptionRoute = await import('@/app/api/admin/adoption/route')

describe('admin adoption API route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireSupabaseAdminUser.mockResolvedValue({
      user: { id: '11111111-1111-4111-8111-111111111111' }
    })
    mockCreateAdminClient.mockReturnValue({ rpc: mockAdoptionRpc })
  })

  it('blocks callers rejected by admin auth', async () => {
    mockRequireSupabaseAdminUser.mockResolvedValue({
      response: Response.json({ error: 'Forbidden' }, { status: 403 })
    })

    const response = await adoptionRoute.GET()
    const json = await response.json()

    expect(response.status).toBe(403)
    expect(json.error).toBe('Forbidden')
    expect(mockCreateAdminClient).not.toHaveBeenCalled()
    expect(mockAdoptionRpc).not.toHaveBeenCalled()
  })

  it('returns adoption metrics for admin callers', async () => {
    const metrics = {
      generated_at: '2026-06-11T00:00:00.000Z',
      totals: { users: 3 },
      daily_series: []
    }
    mockAdoptionRpc.mockResolvedValue({ data: metrics, error: null })

    const response = await adoptionRoute.GET()
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.metrics).toEqual(metrics)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(mockAdoptionRpc).toHaveBeenCalledWith('get_admin_adoption_metrics')
  })

  it('returns a thematic error when the metrics RPC fails', async () => {
    mockAdoptionRpc.mockResolvedValue({
      data: null,
      error: { message: 'darkness everywhere' }
    })

    const response = await adoptionRoute.GET()
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.error).toBe(ERROR_MESSAGE())
  })
})
