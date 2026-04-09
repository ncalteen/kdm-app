'use client'

import { CustomCharactersCard } from '@/components/custom/custom-characters-card'
import { CustomCollectiveCognitionRewardsCard } from '@/components/custom/custom-collective-cognition-rewards-card'
import { CustomDisordersCard } from '@/components/custom/custom-disorders-card'
import { CustomFightingArtsCard } from '@/components/custom/custom-fighting-arts-card'
import { CustomGearCard } from '@/components/custom/custom-gear-card'
import { CustomInnovationsCard } from '@/components/custom/custom-innovations-card'
import { CustomKnowledgeCard } from '@/components/custom/custom-knowledge-card'
import { CustomLocationsCard } from '@/components/custom/custom-locations-card'
import { CustomMilestonesCard } from '@/components/custom/custom-milestones-card'
import { CustomNeurosesCard } from '@/components/custom/custom-neuroses-card'
import { CustomPatternsCard } from '@/components/custom/custom-patterns-card'
import { CustomPhilosophiesCard } from '@/components/custom/custom-philosophies-card'
import { CustomPrinciplesCard } from '@/components/custom/custom-principles-card'
import { CustomResourcesCard } from '@/components/custom/custom-resources-card'
import { CustomSecretFightingArtsCard } from '@/components/custom/custom-secret-fighting-arts-card'
import { CustomSeedPatternsCard } from '@/components/custom/custom-seed-patterns-card'
import { CustomStrainMilestonesCard } from '@/components/custom/custom-strain-milestones-card'
import { CustomWanderersCard } from '@/components/custom/custom-wanderers-card'
import { CustomWeaponTypesCard } from '@/components/custom/custom-weapon-types-card'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UpdatePasswordForm } from '@/components/update-password-form'
import { LocalStateType } from '@/contexts/local-context'
import { useToast } from '@/hooks/use-toast'
import { updateUserSettings } from '@/lib/dal/user'
import {
  CAMPAIGN_UNLOCK_KILLENIUM_BUTCHER_UPDATED_MESSAGE,
  CAMPAIGN_UNLOCK_SCREAMING_NUKALOPE_UPDATED_MESSAGE,
  CAMPAIGN_UNLOCK_WHITE_GIGALION_UPDATED_MESSAGE,
  ERROR_MESSAGE
} from '@/lib/messages'
import { UserSettingsDetail } from '@/lib/types'
import { ReactElement, useCallback, useState } from 'react'

/**
 * User Card Properties
 */
interface UserCardProps {
  /** Local State */
  local: LocalStateType
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
  local,
  setUserSettings,
  userSettings
}: UserCardProps): ReactElement {
  const { toast } = useToast(local)
  const [activeTab, setActiveTab] = useState('society')
  const [philosophyVersion, setPhilosophyVersion] = useState(0)

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
    [userSettings, setUserSettings, toast]
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
    [userSettings, setUserSettings, toast]
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
    [userSettings, setUserSettings, toast]
  )

  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UpdatePasswordForm className="h-full" />
        {/* Unlocked Vignette Monsters */}
        <Card className="p-0">
          <CardHeader className="flex flex-row items-center justify-between px-4 pt-3 pb-0">
            <CardTitle className="text-lg">
              Unlocked Vignette Monsters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Killenium Butcher</div>
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
                aria-label="Killenium Butcher">
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
                <div className="font-medium text-sm">Screaming Nukalope</div>
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
                aria-label="Screaming Nukalope">
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
                <div className="font-medium text-sm">White Gigalion</div>
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
                aria-label="White Gigalion">
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
      </div>

      {/* Custom Content */}
      <h4 className="text-lg font-semibold">Custom Content</h4>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Mobile: dropdown selector */}
        <div className="lg:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="society">Society</SelectItem>
              <SelectItem value="crafting">Crafting</SelectItem>
              <SelectItem value="arc">Arc</SelectItem>
              <SelectItem value="survivors">Survivors</SelectItem>
              <SelectItem value="monsters">Monsters</SelectItem>
              <SelectItem value="wanderers">Wanderers</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: tab row */}
        <TabsList className="hidden lg:flex">
          <TabsTrigger value="society">Society</TabsTrigger>
          <TabsTrigger value="crafting">Crafting</TabsTrigger>
          <TabsTrigger value="arc">Arc</TabsTrigger>
          <TabsTrigger value="survivors">Survivors</TabsTrigger>
          <TabsTrigger value="monsters">Monsters</TabsTrigger>
          <TabsTrigger value="wanderers">Wanderers</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>
        <TabsContent value="society">
          <div className="grid grid-cols-1 gap-4">
            <CustomMilestonesCard local={local} />
            <CustomPrinciplesCard local={local} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomInnovationsCard local={local} />
              <CustomLocationsCard local={local} />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="crafting">
          <div className="grid grid-cols-1 gap-4">
            <CustomGearCard local={local} />
            <CustomResourcesCard local={local} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomPatternsCard local={local} />
              <CustomSeedPatternsCard local={local} />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="arc">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomCollectiveCognitionRewardsCard local={local} />
            <CustomPhilosophiesCard
              local={local}
              onPhilosophiesChange={() => setPhilosophyVersion((v) => v + 1)}
            />
            <CustomKnowledgeCard
              local={local}
              philosophyVersion={philosophyVersion}
            />
            <CustomNeurosesCard
              local={local}
              philosophyVersion={philosophyVersion}
            />
          </div>
        </TabsContent>
        <TabsContent value="survivors">
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomFightingArtsCard local={local} />
              <CustomSecretFightingArtsCard local={local} />
            </div>
            <CustomDisordersCard local={local} />
          </div>
        </TabsContent>
        <TabsContent value="monsters">
          <CustomMonstersCard local={local} />
        </TabsContent>
        <TabsContent value="wanderers">
          <CustomWanderersCard local={local} />
        </TabsContent>
        <TabsContent value="other">
          <div className="grid grid-cols-1 gap-4">
            <CustomCharactersCard local={local} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomStrainMilestonesCard local={local} />
              <CustomWeaponTypesCard local={local} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
