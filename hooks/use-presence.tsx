'use client'

import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useEffect, useRef, useState } from 'react'

/**
 * Presence User
 *
 * Lightweight identity payload tracked on the realtime channel for a
 * given collaborator currently viewing the active settlement. The shape
 * intentionally mirrors `user_settings` columns referenced by
 * {@link UserAvatar} so consumers can hand the value straight to the
 * avatar primitive without an extra projection step.
 */
export interface PresenceUser {
  /** User ID (auth.users.id; used as the avatar fallback color key) */
  user_id: string
  /** Display Username (`@`-prefixed in tooltips) */
  username: string
  /** Provider-Supplied Avatar URL, or `null` when no OAuth image */
  avatar_url: string | null
  /** ISO Timestamp Marking When This Client Joined The Channel */
  online_at: string
}

/**
 * Current User Identity For Presence Tracking
 *
 * Caller-supplied identity used as the `track()` payload. The hook
 * skips the track call when this is `null` (caller is anonymous /
 * pre-auth), but still subscribes to sync events so the local component
 * tree can react when other clients are present.
 */
export interface PresenceTrackUser {
  /** User ID */
  user_id: string
  /** Username */
  username: string
  /** Avatar URL */
  avatar_url: string | null
}

/**
 * `usePresence` Options
 */
interface UsePresenceOptions {
  /**
   * Active Settlement ID
   *
   * Realtime channel is scoped per settlement (`settlement-presence-${id}`)
   * so each open settlement page produces its own presence room. The
   * hook is a no-op while `null` (no active selection) so the SiteHeader
   * can mount the hook unconditionally without paying the socket cost
   * before the user picks a settlement.
   */
  settlementId: string | null
  /**
   * Current User Identity
   *
   * The `track()` payload broadcast to every other subscriber on the
   * channel. The hook waits to call `track()` until the channel
   * transitions to `SUBSCRIBED` and `currentUser` is non-null. Passing
   * `null` while authentication or user-settings is still loading is
   * supported — the hook re-runs cleanly once the value arrives.
   */
  currentUser: PresenceTrackUser | null
}

/**
 * `usePresence` Return Value
 */
interface UsePresenceResult {
  /**
   * Currently Subscribed Users
   *
   * Each `user_id` appears once even when a single user has multiple
   * tabs open — the hook collapses duplicate presence keys to the
   * earliest `online_at` so the avatar list does not flicker on tab
   * focus changes. Order is stable: earliest joiner first.
   */
  presenceUsers: PresenceUser[]
}

/**
 * Reduce A Realtime `presenceState()` Snapshot To An Ordered User List
 *
 * Exposed (rather than inlined) so the dedup + sort behaviour can be
 * unit-tested without spinning up a real realtime channel. The hook
 * calls this on every `sync` / `join` / `leave` event with the latest
 * snapshot from `channel.presenceState()`.
 *
 * Behaviour:
 *
 *   - Each `user_id` collapses to a single entry, keeping the meta with
 *     the earliest `online_at`. This protects the avatar list from
 *     flicker when a user has multiple tabs open.
 *   - Metas missing `user_id`, `username`, or `online_at` are silently
 *     dropped (defensive — a future client publishing a different
 *     schema shouldn't crash the header).
 *   - Output is sorted by `online_at` ascending so the avatar order is
 *     stable across re-renders.
 *
 * @param state Raw Realtime Presence State
 * @returns Ordered, Deduplicated Presence Users
 */
export function reducePresenceState(
  state: Record<string, Array<Record<string, unknown>>>
): PresenceUser[] {
  const byUserId = new Map<string, PresenceUser>()

  for (const metas of Object.values(state)) {
    for (const meta of metas) {
      const userId = meta.user_id
      const username = meta.username
      const onlineAt = meta.online_at

      if (
        typeof userId !== 'string' ||
        typeof username !== 'string' ||
        typeof onlineAt !== 'string'
      ) {
        continue
      }

      const avatarUrl =
        typeof meta.avatar_url === 'string' ? meta.avatar_url : null

      const existing = byUserId.get(userId)
      if (!existing || onlineAt < existing.online_at) {
        byUserId.set(userId, {
          user_id: userId,
          username,
          avatar_url: avatarUrl,
          online_at: onlineAt
        })
      }
    }
  }

  return Array.from(byUserId.values()).sort((a, b) =>
    a.online_at.localeCompare(b.online_at)
  )
}

/**
 * Track Other Survivors Watching The Same Settlement
 *
 * Wraps the Supabase Realtime presence primitive on a dedicated
 * `settlement-presence-${settlementId}` channel and returns the
 * deduplicated list of users currently subscribed. Separate from the
 * Postgres-changes channel used by {@link useRealtimeSubscriptions}
 * because Supabase presence events are channel-local and we want the
 * existing gameplay subscription lifecycle to remain unaffected by
 * presence churn.
 *
 * Lifecycle:
 *
 *   1. Channel is created on mount (or on `settlementId` change) with
 *      a per-user presence key so reconnects collapse to the same
 *      slot in `presenceState()`.
 *   2. `presence` sync / join / leave handlers refresh local state
 *      from `channel.presenceState()` — we never merge payloads
 *      manually because the server-side state is the source of truth.
 *   3. After `subscribe()` resolves with `SUBSCRIBED`, the hook calls
 *      `channel.track({ user_id, username, avatar_url, online_at })`
 *      so other clients see this caller. The track call is skipped
 *      when `currentUser` is `null` (still loading auth/user-settings).
 *   4. On unmount or input change, the channel is removed (which
 *      implicitly untracks this client). The server broadcasts a
 *      `leave` to remaining subscribers, typically within ~2s of the
 *      socket close — matching the acceptance criteria on #177.
 *
 * The deduplication in step 2 means a single user with three tabs
 * open registers a single avatar. The kept entry is the earliest
 * `online_at`, so closing one tab does not flicker the avatar out.
 *
 * @param options Presence Configuration
 * @returns Current Presence List
 */
export function usePresence({
  settlementId,
  currentUser
}: UsePresenceOptions): UsePresenceResult {
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([])

  // Keep the latest `currentUser` in a ref so the channel-creation
  // effect doesn't tear down and re-create the socket every time the
  // username or avatar URL re-renders the parent. Track is fired once
  // per SUBSCRIBED transition; identity changes after that point are
  // re-broadcast via `channel.track()` in a dedicated effect below.
  const currentUserRef = useRef<PresenceTrackUser | null>(currentUser)
  useEffect(() => {
    currentUserRef.current = currentUser
  }, [currentUser])

  // Hold the active channel reference so the sibling identity-update
  // effect can call `track()` without recreating the channel.
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Track whether the active channel has reached the SUBSCRIBED state.
  // The identity-re-broadcast effect refuses to call `channel.track()`
  // until this flips true — `track()` on a non-subscribed channel either
  // throws or silently no-ops depending on the realtime version, and
  // both outcomes leak unhandled rejections into the console.
  const subscribedRef = useRef<boolean>(false)

  // Preserve the original `online_at` for this client across identity
  // re-broadcasts. The reducer uses `online_at` to order the avatar
  // stack, so re-stamping it on every username/avatar change would shove
  // the caller to a different slot in the stack on each rename. The ref
  // is cleared on settlement change so the next channel resets the clock.
  const initialOnlineAtRef = useRef<string | null>(null)

  useEffect(() => {
    if (!settlementId) {
      // No active settlement — fall through without touching state.
      // The cleanup of the previous effect (if any) already cleared
      // `presenceUsers`, and the initial state is `[]`.
      return
    }

    const supabase = createClient()
    const presenceKey =
      currentUserRef.current?.user_id ??
      `anon-${Math.random().toString(36).slice(2)}`

    const channel = supabase.channel(`settlement-presence-${settlementId}`, {
      config: {
        // Use the user ID as the presence key so multiple tabs from
        // the same user collapse into a single slot in `presenceState()`.
        // For anonymous (pre-auth) callers we synthesize a random key —
        // they will not call `track()` so the slot stays empty.
        presence: { key: presenceKey }
      }
    })

    channelRef.current = channel
    subscribedRef.current = false
    initialOnlineAtRef.current = null

    /**
     * Refresh Local Presence List From The Channel's Server State
     *
     * Reads `channel.presenceState()` (the authoritative dictionary the
     * realtime server maintains) and runs it through
     * {@link reducePresenceState} so the in-hook behaviour matches the
     * pure helper that the unit tests exercise.
     */
    const refresh = () => {
      const state = channel.presenceState() as Record<
        string,
        Array<Record<string, unknown>>
      >
      setPresenceUsers(reducePresenceState(state))
    }

    channel
      .on('presence', { event: 'sync' }, refresh)
      .on('presence', { event: 'join' }, refresh)
      .on('presence', { event: 'leave' }, refresh)
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return

        subscribedRef.current = true

        const me = currentUserRef.current
        if (!me) return

        // Stamp the first `online_at` on initial subscribe and keep it
        // for the lifetime of this channel so later identity updates
        // don't shift the caller's slot in the avatar stack ordering.
        if (initialOnlineAtRef.current === null) {
          initialOnlineAtRef.current = new Date().toISOString()
        }

        try {
          await channel.track({
            user_id: me.user_id,
            username: me.username,
            avatar_url: me.avatar_url,
            online_at: initialOnlineAtRef.current
          })
        } catch (error) {
          // `track()` rejects when the realtime server refuses the
          // payload (rare — usually a malformed config). Logging keeps
          // the failure visible in dev tools without disturbing the UI.
          console.error('Presence Track Error:', error)
        }
      })

    return () => {
      // `removeChannel` implicitly untracks this client and closes the
      // socket binding. The realtime server broadcasts `leave` to the
      // remaining subscribers shortly after the underlying transport
      // tears down.
      channelRef.current = null
      subscribedRef.current = false
      initialOnlineAtRef.current = null
      supabase.removeChannel(channel)
      setPresenceUsers([])
    }
  }, [settlementId])

  // Re-broadcast the track payload when the caller's identity changes
  // after the initial SUBSCRIBED handshake (e.g. username rename or
  // avatar refresh). The realtime server treats successive `track()`
  // calls on the same key as updates, so this does not produce extra
  // join/leave noise. We gate on `subscribedRef` so an identity change
  // that arrives before the initial handshake doesn't fire `track()`
  // against a still-subscribing channel (the subscribe callback will
  // pick the latest identity off `currentUserRef` itself).
  useEffect(() => {
    const channel = channelRef.current
    if (!channel || !currentUser || !subscribedRef.current) return

    const onlineAt = initialOnlineAtRef.current ?? new Date().toISOString()

    void (async () => {
      try {
        await channel.track({
          user_id: currentUser.user_id,
          username: currentUser.username,
          avatar_url: currentUser.avatar_url,
          online_at: onlineAt
        })
      } catch (error) {
        console.error('Presence Track Error:', error)
      }
    })()
  }, [currentUser])

  return { presenceUsers }
}
