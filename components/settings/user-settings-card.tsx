'use client'

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
    <div className="flex flex-col gap-4 pt-12 px-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UpdateUsernameForm
          setUserSettings={setUserSettings}
          userSettings={userSettings}
          className="h-full"
        />
        <UpdatePasswordForm className="h-full" />
      </div>
    </div>
  )
}
