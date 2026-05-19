'use client'

import { UserAvatar } from '@/components/generic/user-avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import type { PresenceUser } from '@/hooks/use-presence'
import { cn } from '@/lib/utils'
import { ReactElement, useMemo } from 'react'

/**
 * Maximum Number Of Avatars Rendered Inline
 *
 * Anything beyond this count collapses into a `+N` overflow badge so
 * the header doesn't stretch in shared parties. Matches the cap called
 * out in issue #177.
 */
const MAX_VISIBLE_AVATARS = 5

/**
 * Presence Stack Properties
 */
export interface PresenceStackProps {
  /**
   * Currently Subscribed Users
   *
   * Output of {@link usePresence}. The stack renders up to
   * {@link MAX_VISIBLE_AVATARS} avatars in the supplied order, then a
   * `+N` overflow badge for any remaining users. An empty list renders
   * nothing at all.
   */
  users: PresenceUser[]
  /**
   * Current User ID
   *
   * When provided, the matching presence entry is rendered with a
   * subtler "self" treatment (ghosted opacity + lantern ring) so the
   * caller can immediately distinguish their own avatar from
   * collaborators. Pass `null` to treat every entry equivalently.
   */
  currentUserId?: string | null
  /** Optional Class Name Forwarded To The Outer Wrapper */
  className?: string
}

/**
 * Stacked Presence Avatars
 *
 * Renders a horizontal stack of {@link UserAvatar} chips for every
 * survivor currently watching the active settlement. Each avatar is
 * wrapped in a tooltip showing the `@username`, and overflow beyond
 * {@link MAX_VISIBLE_AVATARS} collapses into a `+N` badge that lists
 * the remaining usernames in its own tooltip.
 *
 * Self treatment: when `currentUserId` matches a presence entry, that
 * avatar receives a lantern-amber ring and reduced opacity so the
 * caller can tell their own dot from the rest of the watch.
 *
 * @param props Presence Stack Properties
 * @returns Presence Stack Element, Or `null` When No Users
 */
export function PresenceStack({
  users,
  currentUserId = null,
  className
}: PresenceStackProps): ReactElement | null {
  const { visible, overflow } = useMemo(() => {
    if (users.length <= MAX_VISIBLE_AVATARS) {
      return { visible: users, overflow: [] as PresenceUser[] }
    }

    return {
      visible: users.slice(0, MAX_VISIBLE_AVATARS),
      overflow: users.slice(MAX_VISIBLE_AVATARS)
    }
  }, [users])

  if (users.length === 0) return null

  return (
    <TooltipProvider delayDuration={150}>
      <div
        className={cn('flex items-center', className)}
        aria-label="Survivors keeping watch"
        role="group">
        {visible.map((user, index) => {
          const isSelf =
            currentUserId !== null && user.user_id === currentUserId
          return (
            <Tooltip key={user.user_id}>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    'relative inline-flex transition-transform',
                    // Stack overlap. The first avatar sits flush; every
                    // subsequent avatar pulls back into the previous
                    // one with a thin ring so the silhouettes remain
                    // legible against any background.
                    index === 0 ? 'ml-0' : '-ml-2',
                    // Self treatment — softer opacity with a lantern
                    // ring so the caller spots themselves quickly.
                    isSelf
                      ? 'opacity-75 ring-2 ring-amber-400/70 rounded-full'
                      : 'ring-2 ring-background rounded-full',
                    // Lift on hover so the focused avatar visually
                    // separates from the stack without breaking layout.
                    'hover:z-10 hover:-translate-y-0.5'
                  )}
                  style={{ zIndex: visible.length - index }}>
                  <UserAvatar
                    avatarUrl={user.avatar_url}
                    username={user.username}
                    userId={user.user_id}
                    className="size-6"
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {isSelf
                  ? `@${user.username} (you)`
                  : `@${user.username} keeps watch`}
              </TooltipContent>
            </Tooltip>
          )
        })}

        {overflow.length > 0 ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  'relative -ml-2 inline-flex h-6 min-w-6 items-center justify-center',
                  'rounded-full bg-muted px-1.5 text-[10px] font-semibold',
                  'ring-2 ring-background',
                  'hover:z-10 hover:-translate-y-0.5 transition-transform'
                )}
                style={{ zIndex: 0 }}>
                +{overflow.length}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <div className="flex flex-col gap-0.5">
                {overflow.map((user) => (
                  <span key={user.user_id}>@{user.username}</span>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>
    </TooltipProvider>
  )
}
