'use client'

import { CustomMonstersCard } from '@/components/monster/custom-monsters-card'
import { UserSettingsDetail } from '@/lib/types'
import { ReactElement } from 'react'

/**
 * User Card Properties
 */
interface UserCardProps {
  /** Set User Settings */
  setUserSettings: (settings: UserSettingsDetail | null) => void
  /** User Settings */
  userSettings: UserSettingsDetail | null
}

/**
 * User Card Component
 *
 * Displays user-specific management functionality including custom monsters,
 * user settings, and other user-scoped items.
 *
 * @param props User Card Properties
 * @returns User Card Component
 */
export function UserCard({
  setUserSettings,
  userSettings
}: UserCardProps): ReactElement {
  return (
    <div className="flex flex-col gap-4 pt-2">
      <CustomMonstersCard />
    </div>
  )
}
