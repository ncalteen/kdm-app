'use client'

import { ModeToggle } from '@/components/menu/mode-toggle'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { PresenceStack } from '@/components/settlement/presence-stack'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useSidebar } from '@/components/ui/sidebar'
import { useLocal } from '@/contexts/local-context'
import { usePresence, type PresenceTrackUser } from '@/hooks/use-presence'
import { SidebarIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ReactElement, useMemo } from 'react'

/**
 * Site Header Component
 *
 * @returns Site Header Component
 */
export function SiteHeader(): ReactElement {
  const { toggleSidebar } = useSidebar()
  const { selectedSettlementId, userSettings } = useLocal()

  // Build the presence-track payload from cached `user_settings`. The
  // hook itself skips `track()` while this is `null`, so we don't
  // need to gate the call here — passing `null` is the supported
  // pre-auth state.
  const currentUser = useMemo<PresenceTrackUser | null>(() => {
    if (!userSettings) return null
    return {
      user_id: userSettings.user_id,
      username: userSettings.username,
      avatar_url: userSettings.avatar_url
    }
  }, [userSettings])

  const { presenceUsers } = usePresence({
    settlementId: selectedSettlementId,
    currentUser
  })

  return (
    <header className="bg-background fixed top-0 left-0 right-0 z-50 flex w-full items-center justify-between border-b px-4 min-h-(--header-height)">
      <div className="flex h-(--header-height) items-center gap-2">
        <Button
          aria-label="Toggle Sidebar"
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}>
          <SidebarIcon />
        </Button>

        <Separator orientation="vertical" className="mr-0 h-4" />

        <ModeToggle />

        <div className="flex items-center gap-2 pl-1">
          <NotificationBell />
          <h1 className="text-xs sm:text-sm whitespace-nowrap leading-none">
            <span className="text-muted-foreground md:hidden">KD:M</span>
            <span className="text-muted-foreground hidden md:inline">
              Kingdom Death: Monster
            </span>
            <span className="mx-1 text-muted-foreground/60">/</span>
            <span className="ml-1 font-semibold">Archivist</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <PresenceStack
          users={presenceUsers}
          currentUserId={userSettings?.user_id ?? null}
        />

        <Link
          href="https://github.com/ncalteen/kdm-app"
          className="flex items-center gap-2 text-xs sm:text-sm hover:underline">
          <Image
            src="/github.svg"
            alt=""
            width={16}
            height={16}
            aria-hidden="true"
            className="dark:invert"
          />
          <span className="hidden sm:inline">ncalteen/kdm-app</span>
        </Link>
      </div>
    </header>
  )
}
