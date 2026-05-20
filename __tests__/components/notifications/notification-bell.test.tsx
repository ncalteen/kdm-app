import {
  formatNotificationCopy,
  formatUnreadBadgeCount
} from '@/components/notifications/notification-bell'
import { NotificationRow } from '@/lib/types'
import { describe, expect, it } from 'vitest'

const baseNotification: NotificationRow = {
  id: 'notification-1',
  recipient_user_id: 'user-1',
  kind: 'settlement_shared_with_you',
  payload: {},
  read_at: null,
  created_at: '2026-05-20T12:00:00.000Z'
}

describe('formatNotificationCopy', () => {
  it('formats settlement share notifications with owner and settlement payload fields', () => {
    expect(
      formatNotificationCopy({
        ...baseNotification,
        payload: {
          owner: 'Nick',
          settlement_name: 'Lantern Hold'
        }
      })
    ).toBe('Nick extended a hand. The Lantern Hold watches with you.')
  })

  it('supports camelCase payload fields for settlement share notifications', () => {
    expect(
      formatNotificationCopy({
        ...baseNotification,
        payload: {
          ownerUsername: 'Archivist',
          settlementName: 'Stone Face'
        }
      })
    ).toBe('Archivist extended a hand. The Stone Face watches with you.')
  })

  it('formats settlement removal notifications', () => {
    expect(
      formatNotificationCopy({
        ...baseNotification,
        kind: 'removed_from_settlement',
        payload: { settlement_name: 'Lantern Hold' }
      })
    ).toBe('Your watch on Lantern Hold ends.')
  })

  it('falls back gracefully when payload copy fields are missing', () => {
    expect(formatNotificationCopy(baseNotification)).toBe(
      'Someone extended a hand. The settlement watches with you.'
    )
  })
})

describe('formatUnreadBadgeCount', () => {
  it('returns the unread count for double-digit values', () => {
    expect(formatUnreadBadgeCount(42)).toBe('42')
  })

  it('caps three-digit values', () => {
    expect(formatUnreadBadgeCount(100)).toBe('99+')
  })
})
