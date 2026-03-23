'use client'

import { CustomMonstersCard } from '@/components/monster/custom-monsters-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { updateUserSettings } from '@/lib/dal/user'
import {
  CAMPAIGN_UNLOCK_KILLENIUM_BUTCHER_UPDATED_MESSAGE,
  CAMPAIGN_UNLOCK_SCREAMING_NUKALOPE_UPDATED_MESSAGE,
  CAMPAIGN_UNLOCK_WHITE_GIGALION_UPDATED_MESSAGE,
  ERROR_MESSAGE
} from '@/lib/messages'
import { UserSettingsDetail } from '@/lib/types'
import { ReactElement, useCallback } from 'react'
import { toast } from 'sonner'

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
  /**
   * Handle Killenium Butcher Unlock Change
   *
   * @param value New Value
   */
  const handleKilleniumButcherUnlockedChange = useCallback(
    (value: string) => {
      if (!userSettings) return

      const unlocked = value === 'true'
      const previousValue = userSettings.unlocked_killenium_butcher

      setUserSettings({
        ...userSettings,
        unlocked_killenium_butcher: unlocked
      })

      updateUserSettings(userSettings.id, {
        unlocked_killenium_butcher: unlocked
      })
        .then(() =>
          toast.success(
            CAMPAIGN_UNLOCK_KILLENIUM_BUTCHER_UPDATED_MESSAGE(unlocked)
          )
        )
        .catch((err: unknown) => {
          setUserSettings({
            ...userSettings,
            unlocked_killenium_butcher: previousValue
          })

          console.error('Killenium Butcher Unlock Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [userSettings, setUserSettings]
  )

  /**
   * Handle Screaming Nukalope Unlock Change
   *
   * @param value New Value
   */
  const handleScreamingNukalopeUnlockedChange = useCallback(
    (value: string) => {
      if (!userSettings) return

      const unlocked = value === 'true'
      const previousValue = userSettings.unlocked_screaming_nukalope

      setUserSettings({
        ...userSettings,
        unlocked_screaming_nukalope: unlocked
      })

      updateUserSettings(userSettings.id, {
        unlocked_screaming_nukalope: unlocked
      })
        .then(() =>
          toast.success(
            CAMPAIGN_UNLOCK_SCREAMING_NUKALOPE_UPDATED_MESSAGE(unlocked)
          )
        )
        .catch((err: unknown) => {
          setUserSettings({
            ...userSettings,
            unlocked_screaming_nukalope: previousValue
          })

          console.error('Screaming Nukalope Unlock Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [userSettings, setUserSettings]
  )

  /**
   * Handle White Gigalion Unlock Change
   *
   * @param value New Value
   */
  const handleWhiteGigalionUnlockedChange = useCallback(
    (value: string) => {
      if (!userSettings) return

      const unlocked = value === 'true'
      const previousValue = userSettings.unlocked_white_gigalion

      setUserSettings({
        ...userSettings,
        unlocked_white_gigalion: unlocked
      })

      updateUserSettings(userSettings.id, {
        unlocked_white_gigalion: unlocked
      })
        .then(() =>
          toast.success(
            CAMPAIGN_UNLOCK_WHITE_GIGALION_UPDATED_MESSAGE(unlocked)
          )
        )
        .catch((err: unknown) => {
          setUserSettings({
            ...userSettings,
            unlocked_white_gigalion: previousValue
          })

          console.error('White Gigalion Unlock Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [userSettings, setUserSettings]
  )

  return (
    <div className="flex flex-col gap-4 pt-2">
      {/* User Settings */}
      <Card className="p-0">
        <CardHeader className="px-4 pt-3 pb-0">
          <CardTitle className="text-lg">User Settings</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">
                Unlock Killenium Butcher
              </div>
              <div className="text-sm text-muted-foreground">
                Allows the Killenium Butcher nemesis to appear in showdowns.
              </div>
            </div>
            <Select
              value={
                userSettings?.unlocked_killenium_butcher !== undefined
                  ? userSettings.unlocked_killenium_butcher.toString()
                  : 'false'
              }
              onValueChange={handleKilleniumButcherUnlockedChange}
              name="unlock-killenium-butcher"
              aria-label="Unlock Killenium Butcher">
              <SelectTrigger className="w-24" id="unlock-killenium-butcher">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">No</SelectItem>
                <SelectItem value="true">Yes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="my-2" />

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">
                Unlock Screaming Nukalope
              </div>
              <div className="text-sm text-muted-foreground">
                Allows the Screaming Nukalope quarry to be hunted.
              </div>
            </div>
            <Select
              value={
                userSettings?.unlocked_screaming_nukalope !== undefined
                  ? userSettings.unlocked_screaming_nukalope.toString()
                  : 'false'
              }
              onValueChange={handleScreamingNukalopeUnlockedChange}
              name="unlock-screaming-nukalope"
              aria-label="Unlock Screaming Nukalope">
              <SelectTrigger className="w-24" id="unlock-screaming-nukalope">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">No</SelectItem>
                <SelectItem value="true">Yes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="my-2" />

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Unlock White Gigalion</div>
              <div className="text-sm text-muted-foreground">
                Allows the White Gigalion quarry to be hunted.
              </div>
            </div>
            <Select
              value={
                userSettings?.unlocked_white_gigalion !== undefined
                  ? userSettings.unlocked_white_gigalion.toString()
                  : 'false'
              }
              onValueChange={handleWhiteGigalionUnlockedChange}
              name="unlock-white-gigalion"
              aria-label="Unlock White Gigalion">
              <SelectTrigger className="w-24" id="unlock-white-gigalion">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">No</SelectItem>
                <SelectItem value="true">Yes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Custom Monsters */}
      <CustomMonstersCard />
    </div>
  )
}
