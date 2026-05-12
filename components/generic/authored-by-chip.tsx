'use client'

import { UserAvatar } from '@/components/generic/user-avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useLocal } from '@/contexts/local-context'
import { cn } from '@/lib/utils'
import { ReactElement } from 'react'

/**
 * Authored-By Chip Properties
 */
export interface AuthoredByChipProps {
  /**
   * Author User ID
   *
   * `null` for built-in catalog rows (and the chip renders nothing). Custom
   * rows authored by a user who has since left the settlement still carry
   * the original `author_user_id`, so the chip can render a foreign-author
   * indicator with a ghost username.
   */
  authorUserId: string | null
  /**
   * Author Username
   *
   * Surfaces in the tooltip as `@username`. `null` for built-ins and for
   * authors who left the settlement (the tooltip then renders `@unknown`).
   */
  authorUsername: string | null
  /**
   * Author Avatar URL
   *
   * OAuth-supplied avatar URL when available; `null` falls back to the
   * deterministic colored-initials avatar from {@link UserAvatar}.
   */
  authorAvatarUrl: string | null
  /** Optional Class Name Override */
  className?: string
}

/**
 * Authored-By Chip
 *
 * Renders a small avatar with a tooltip identifying the author of a custom
 * catalog row that surfaces inside a settlement (E2.9). Implements the
 * lantern-light identity cue without surfacing the author's display name
 * directly in the card body — only an avatar that reveals the username on
 * hover.
 *
 * Renders **nothing** in two cases so it never adds visual noise where it
 * isn't useful:
 *
 * 1. The row is a built-in (`authorUserId === null`).
 * 2. The row was authored by the **current user** — survivors don't need a
 *    chip to remind them they made the thing.
 *
 * @param props Authored-By Chip Properties
 * @returns Authored-By Chip Component, or `null` when the chip should hide
 */
export function AuthoredByChip({
  authorUserId,
  authorUsername,
  authorAvatarUrl,
  className
}: AuthoredByChipProps): ReactElement | null {
  const { userSettings } = useLocal()
  const currentUserId = userSettings?.user_id ?? null

  // Built-ins and self-authored rows render nothing.
  if (!authorUserId) return null
  if (currentUserId && currentUserId === authorUserId) return null

  const displayUsername = authorUsername ?? 'unknown'

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'inline-flex shrink-0 cursor-default items-center',
              className
            )}
            aria-label={`Authored by @${displayUsername}`}>
            <UserAvatar
              avatarUrl={authorAvatarUrl}
              username={authorUsername}
              userId={authorUserId}
              alt={`Authored by @${displayUsername}`}
              className="size-4 text-[0.5rem]"
            />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={4}>
          <span className="text-xs">{`@${displayUsername}`}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
