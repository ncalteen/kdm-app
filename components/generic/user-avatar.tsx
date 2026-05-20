'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitialsFromName, pickInitialsColor } from '@/lib/avatar'
import { cn } from '@/lib/utils'
import { ComponentProps, ReactElement, useMemo } from 'react'

/**
 * User Avatar Properties
 */
export interface UserAvatarProps extends Omit<
  ComponentProps<typeof Avatar>,
  'children'
> {
  /** Provider-Supplied Avatar URL (Discord, Google, ...) */
  avatarUrl?: string | null
  /** Username (used to derive initials and the alt attribute) */
  username?: string | null
  /** User ID (used to deterministically pick a fallback colour) */
  userId?: string | null
  /** Override Initials (e.g. for survivors using survivor_name) */
  initialsOverride?: string
  /** Override Fallback Colour (e.g. for survivors keyed on survivor_id) */
  colorClassName?: string
  /** Optional alt text override (defaults to the username) */
  alt?: string
}

/**
 * User Avatar
 *
 * Renders an OAuth-supplied avatar when one is available, otherwise falls
 * back to colored initials derived from the username. Designed to be the
 * single avatar primitive across presence indicators, "By @user" chips,
 * and the notification bell so identity stays visually consistent.
 *
 * @param props User Avatar Properties
 * @returns User Avatar Component
 */
export function UserAvatar({
  avatarUrl,
  username,
  userId,
  initialsOverride,
  colorClassName,
  alt,
  className,
  ...props
}: UserAvatarProps): ReactElement {
  const initials = useMemo(
    () =>
      initialsOverride && initialsOverride.trim().length > 0
        ? initialsOverride.trim().toUpperCase().slice(0, 2)
        : getInitialsFromName(username),
    [initialsOverride, username]
  )

  const fallbackColor = useMemo(
    () => colorClassName ?? pickInitialsColor(userId ?? username ?? null),
    [colorClassName, userId, username]
  )

  const altText = alt ?? username ?? 'User avatar'

  return (
    <Avatar className={cn('size-8 bg-black', className)} {...props}>
      {avatarUrl ? (
        <AvatarImage
          src={avatarUrl}
          alt={altText}
          referrerPolicy="no-referrer"
          className="bg-black"
        />
      ) : null}
      <AvatarFallback
        className={cn(
          'text-xs font-semibold text-white bg-black',
          fallbackColor
        )}>
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
