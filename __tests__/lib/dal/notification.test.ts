import type { NotificationRow } from '@/lib/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))

vi.mock('@/lib/dal/user', () => ({
  getUserId: vi.fn()
}))

const { getNotifications, getUnreadCount, markRead, markAllRead } =
  await import('@/lib/dal/notification')
const { getUserId } = await import('@/lib/dal/user')

beforeEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
  vi.mocked(getUserId).mockResolvedValue('user-1')
})

describe('getNotifications', () => {
  it('fetches the authenticated user notifications newest first with a limit', async () => {
    const rows: NotificationRow[] = [
      {
        id: 'notification-1',
        recipient_user_id: 'user-1',
        kind: 'settlement_shared_with_you',
        payload: { settlementId: 'settlement-1' },
        read_at: null,
        created_at: '2026-05-20T12:00:00.000Z'
      }
    ]
    const limit = vi.fn().mockResolvedValue({ data: rows, error: null })
    const order = vi.fn().mockReturnValue({ limit })
    const eq = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ eq })
    mockSupabase.from.mockReturnValue({ select })

    const result = await getNotifications()

    expect(mockSupabase.from).toHaveBeenCalledWith('notification')
    expect(select).toHaveBeenCalledWith(
      'id, recipient_user_id, kind, payload, read_at, created_at'
    )
    expect(eq).toHaveBeenCalledWith('recipient_user_id', 'user-1')
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(limit).toHaveBeenCalledWith(50)
    expect(result).toEqual(rows)
  })

  it('returns an empty list when data is null', async () => {
    const limit = vi.fn().mockResolvedValue({ data: null, error: null })
    const order = vi.fn().mockReturnValue({ limit })
    const eq = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ eq })
    mockSupabase.from.mockReturnValue({ select })

    const result = await getNotifications()

    expect(result).toEqual([])
  })

  it('throws when the notification query fails', async () => {
    const limit = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const order = vi.fn().mockReturnValue({ limit })
    const eq = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ eq })
    mockSupabase.from.mockReturnValue({ select })

    await expect(getNotifications()).rejects.toThrow(
      'Error Fetching Notifications: DB error'
    )
  })
})

describe('getUnreadCount', () => {
  it('counts unread notifications for the authenticated user', async () => {
    const is = vi.fn().mockResolvedValue({ count: 7, error: null })
    const eq = vi.fn().mockReturnValue({ is })
    const select = vi.fn().mockReturnValue({ eq })
    mockSupabase.from.mockReturnValue({ select })

    const result = await getUnreadCount()

    expect(mockSupabase.from).toHaveBeenCalledWith('notification')
    expect(select).toHaveBeenCalledWith('id', {
      count: 'exact',
      head: true
    })
    expect(eq).toHaveBeenCalledWith('recipient_user_id', 'user-1')
    expect(is).toHaveBeenCalledWith('read_at', null)
    expect(result).toBe(7)
  })

  it('treats a null count as zero', async () => {
    const is = vi.fn().mockResolvedValue({ count: null, error: null })
    const eq = vi.fn().mockReturnValue({ is })
    const select = vi.fn().mockReturnValue({ eq })
    mockSupabase.from.mockReturnValue({ select })

    const result = await getUnreadCount()

    expect(result).toBe(0)
  })

  it('throws when the unread count query fails', async () => {
    const is = vi
      .fn()
      .mockResolvedValue({ count: null, error: { message: 'count failed' } })
    const eq = vi.fn().mockReturnValue({ is })
    const select = vi.fn().mockReturnValue({ eq })
    mockSupabase.from.mockReturnValue({ select })

    await expect(getUnreadCount()).rejects.toThrow(
      'Error Fetching Unread Notification Count: count failed'
    )
  })
})

describe('markRead', () => {
  it('returns early without calling Supabase when no ids are provided', async () => {
    await markRead([])

    expect(getUserId).not.toHaveBeenCalled()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('marks the requested notifications read for the authenticated user', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-20T12:34:56.000Z'))

    const inFilter = vi.fn().mockResolvedValue({ error: null })
    const eq = vi.fn().mockReturnValue({ in: inFilter })
    const update = vi.fn().mockReturnValue({ eq })
    mockSupabase.from.mockReturnValue({ update })

    await markRead(['notification-1', 'notification-2'])

    expect(mockSupabase.from).toHaveBeenCalledWith('notification')
    expect(update).toHaveBeenCalledWith({
      read_at: '2026-05-20T12:34:56.000Z'
    })
    expect(eq).toHaveBeenCalledWith('recipient_user_id', 'user-1')
    expect(inFilter).toHaveBeenCalledWith('id', [
      'notification-1',
      'notification-2'
    ])
  })

  it('throws when marking notifications read fails', async () => {
    const inFilter = vi
      .fn()
      .mockResolvedValue({ error: { message: 'update failed' } })
    const eq = vi.fn().mockReturnValue({ in: inFilter })
    const update = vi.fn().mockReturnValue({ eq })
    mockSupabase.from.mockReturnValue({ update })

    await expect(markRead(['notification-1'])).rejects.toThrow(
      'Error Marking Notifications Read: update failed'
    )
  })
})

describe('markAllRead', () => {
  it('marks all unread notifications read for the authenticated user', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-20T12:34:56.000Z'))

    const is = vi.fn().mockResolvedValue({ error: null })
    const eq = vi.fn().mockReturnValue({ is })
    const update = vi.fn().mockReturnValue({ eq })
    mockSupabase.from.mockReturnValue({ update })

    await markAllRead()

    expect(mockSupabase.from).toHaveBeenCalledWith('notification')
    expect(update).toHaveBeenCalledWith({
      read_at: '2026-05-20T12:34:56.000Z'
    })
    expect(eq).toHaveBeenCalledWith('recipient_user_id', 'user-1')
    expect(is).toHaveBeenCalledWith('read_at', null)
  })

  it('throws when marking all notifications read fails', async () => {
    const is = vi
      .fn()
      .mockResolvedValue({ error: { message: 'update failed' } })
    const eq = vi.fn().mockReturnValue({ is })
    const update = vi.fn().mockReturnValue({ eq })
    mockSupabase.from.mockReturnValue({ update })

    await expect(markAllRead()).rejects.toThrow(
      'Error Marking All Notifications Read: update failed'
    )
  })
})
