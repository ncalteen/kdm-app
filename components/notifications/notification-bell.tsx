'use client'

import { LanternMark } from '@/components/generic/lantern-mark'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { useLocal } from '@/contexts/local-context'
import {
  getNotifications,
  getUnreadCount,
  markAllRead,
  markRead
} from '@/lib/dal/notification'
import { ERROR_MESSAGE } from '@/lib/messages'
import { NotificationRow } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

const MAX_VISIBLE_NOTIFICATIONS = 10

type NotificationPayloadRecord = Exclude<
  Extract<NotificationRow['payload'], object>,
  unknown[]
>

interface NotificationSnapshot {
  /** Notification Rows */
  notifications: NotificationRow[]
  /** Unread Count */
  unreadCount: number
}

/**
 * Is Notification Payload Record
 *
 * @param payload Notification Payload
 * @returns Whether the payload is an object record
 */
function isNotificationPayloadRecord(
  payload: NotificationRow['payload']
): payload is NotificationPayloadRecord {
  return (
    typeof payload === 'object' && payload !== null && !Array.isArray(payload)
  )
}

/**
 * Fetch Notification Snapshot
 *
 * Reads the notification list and unread count in parallel.
 *
 * @returns Notification Snapshot
 */
async function fetchNotificationSnapshot(): Promise<NotificationSnapshot> {
  const [notifications, unreadCount] = await Promise.all([
    getNotifications(),
    getUnreadCount()
  ])

  return { notifications, unreadCount }
}

/**
 * Read Payload String
 *
 * Reads the first non-empty string from a notification payload.
 *
 * @param payload Notification Payload
 * @param keys Candidate Keys
 * @param fallback Fallback Copy
 * @returns Payload String or Fallback
 */
function readPayloadString(
  payload: NotificationRow['payload'],
  keys: string[],
  fallback: string
): string {
  if (!isNotificationPayloadRecord(payload)) return fallback

  for (const key of keys) {
    const value = payload[key]
    if (typeof value === 'string' && value.trim().length > 0)
      return value.trim()
  }

  return fallback
}

/**
 * Format Notification Copy
 *
 * @param notification Notification Row
 * @returns Notification Copy
 */
export function formatNotificationCopy(
  notification: Pick<NotificationRow, 'kind' | 'payload'>
): string {
  const settlementName = readPayloadString(
    notification.payload,
    ['settlement_name', 'settlementName'],
    'a settlement'
  )

  switch (notification.kind) {
    case 'settlement_shared_with_you': {
      const owner = readPayloadString(
        notification.payload,
        ['owner', 'owner_username', 'ownerUsername', 'owner_name', 'ownerName'],
        'Someone'
      )

      return `${owner} has invited you to ${settlementName}.`
    }
    case 'removed_from_settlement':
      return `Your watch on ${settlementName} ends.`
    default:
      return 'A message waits in the dark.'
  }
}

/**
 * Format Unread Badge Count
 *
 * @param unreadCount Unread Count
 * @returns Badge Text
 */
export function formatUnreadBadgeCount(unreadCount: number): string {
  return unreadCount > 99 ? '99+' : String(unreadCount)
}

/**
 * Notification Bell Component
 *
 * @returns Notification bell with unread badge and notification popover.
 */
export function NotificationBell(): ReactElement {
  const { isAuthenticated, subscribeToNotificationInserts } = useLocal()
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false)

  const visibleNotifications = useMemo(
    () => notifications.slice(0, MAX_VISIBLE_NOTIFICATIONS),
    [notifications]
  )

  const refreshNotifications = useCallback(async () => {
    if (isAuthenticated !== true) return

    try {
      const snapshot = await fetchNotificationSnapshot()

      setNotifications(snapshot.notifications)
      setUnreadCount(snapshot.unreadCount)
    } catch (error) {
      console.error('Notification Fetch Error:', error)
      toast.error(ERROR_MESSAGE())
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated !== true) return

    let isCancelled = false

    const handleSnapshot = (snapshot: NotificationSnapshot) => {
      if (isCancelled) return

      setNotifications(snapshot.notifications)
      setUnreadCount(snapshot.unreadCount)
    }

    const handleFetchError = (error: unknown) => {
      if (isCancelled) return

      console.error('Notification Fetch Error:', error)
      toast.error(ERROR_MESSAGE())
    }

    fetchNotificationSnapshot().then(handleSnapshot).catch(handleFetchError)

    const unsubscribe = subscribeToNotificationInserts(() => {
      fetchNotificationSnapshot().then(handleSnapshot).catch(handleFetchError)
    })

    return () => {
      isCancelled = true
      unsubscribe()
    }
  }, [isAuthenticated, subscribeToNotificationInserts])

  const handleMarkRead = async (notification: NotificationRow) => {
    if (notification.read_at) return

    const readAt = new Date().toISOString()
    setNotifications((prev) =>
      prev.map((row) =>
        row.id === notification.id ? { ...row, read_at: readAt } : row
      )
    )
    setUnreadCount((prev) => Math.max(prev - 1, 0))

    try {
      await markRead([notification.id])
    } catch (error) {
      console.error('Notification Mark Read Error:', error)
      toast.error(ERROR_MESSAGE())
      void refreshNotifications()
    }
  }

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || isMarkingAllRead) return

    setIsMarkingAllRead(true)
    const readAt = new Date().toISOString()
    setNotifications((prev) =>
      prev.map((row) => ({ ...row, read_at: row.read_at ?? readAt }))
    )
    setUnreadCount(0)

    try {
      await markAllRead()
      await refreshNotifications()
    } catch (error) {
      console.error('Notification Mark All Read Error:', error)
      toast.error(ERROR_MESSAGE())
      void refreshNotifications()
    } finally {
      setIsMarkingAllRead(false)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread notifications`
              : 'Notifications'
          }
          className="relative h-8 w-8 shrink-0 px-0">
          <LanternMark
            className="size-4 text-amber-400/90"
            aria-hidden="true"
          />
          {unreadCount > 0 && (
            <span className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] leading-none font-semibold">
              {formatUnreadBadgeCount(unreadCount)}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-80 p-0">
        <div className="flex items-center justify-between gap-3 border-b px-3 py-2.5">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">Notifications</h2>
            <p className="text-muted-foreground text-xs">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All accounted for'}
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              disabled={isMarkingAllRead}
              onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto p-1">
          {visibleNotifications.length === 0 ? (
            <div className="text-muted-foreground px-3 py-6 text-center text-sm">
              Your settlement is quiet. For now.
            </div>
          ) : (
            <ul className="space-y-1">
              {visibleNotifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => void handleMarkRead(notification)}
                    className={cn(
                      'hover:bg-accent hover:text-accent-foreground flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
                      notification.read_at
                        ? 'text-muted-foreground'
                        : 'text-foreground'
                    )}>
                    <span
                      className={cn(
                        'mt-1 size-2 shrink-0 rounded-full',
                        notification.read_at
                          ? 'bg-muted-foreground/25'
                          : 'bg-amber-400'
                      )}
                      aria-hidden="true"
                    />
                    <span>{formatNotificationCopy(notification)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
