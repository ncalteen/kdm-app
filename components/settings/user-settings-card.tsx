'use client'

import { UpdateAvatarForm } from '@/components/settings/update-avatar-form'
import { UpdatePasswordForm } from '@/components/update-password-form'
import { UpdateUsernameForm } from '@/components/update-username-form'
import { UserSettingsDetail } from '@/lib/types'
import { ReactElement } from 'react'

/**
 * User Settings Card Properties
 */
interface UserSettingsCardProps {
  /** Set User Settings */
  setUserSettings: (settings: UserSettingsDetail | null) => void
  /** User Settings */
  userSettings: UserSettingsDetail | null
}

/**
 * User Settings Card Component
 *
 * Hosts account-level settings for the signed-in user.
 *
 * @param props User Settings Card Properties
 * @returns User Settings Card Component
 */
export function UserSettingsCard({
  setUserSettings,
  userSettings
}: UserSettingsCardProps): ReactElement {
  return (
    <div className="grid grid-cols-1 gap-4 px-2 pt-12 md:grid-cols-3 md:items-stretch">
      <UpdateAvatarForm
        setUserSettings={setUserSettings}
        userSettings={userSettings}
        className="flex-1 h-full"
      />
      <UpdateUsernameForm
        setUserSettings={setUserSettings}
        userSettings={userSettings}
        className="flex-1 h-full"
      />
      <UpdatePasswordForm className="flex-1 h-full" />
    </div>
  )
}
