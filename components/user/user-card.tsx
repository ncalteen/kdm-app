'use client'

import { CustomAbilityImpairmentsCard } from '@/components/custom/custom-ability-impairments-card'
import { CustomCharactersCard } from '@/components/custom/custom-characters-card'
import { CustomCollectiveCognitionRewardsCard } from '@/components/custom/custom-collective-cognition-rewards-card'
import { CustomDisordersCard } from '@/components/custom/custom-disorders-card'
import { CustomFightingArtsCard } from '@/components/custom/custom-fighting-arts-card'
import { CustomGearCard } from '@/components/custom/custom-gear-card'
import { CustomInnovationsCard } from '@/components/custom/custom-innovations-card'
import { CustomKnowledgeCard } from '@/components/custom/custom-knowledge-card'
import { CustomLocationsCard } from '@/components/custom/custom-locations-card'
import { CustomMilestonesCard } from '@/components/custom/custom-milestones-card'
import { CustomMoodsCard } from '@/components/custom/custom-moods-card'
import { CustomNeurosesCard } from '@/components/custom/custom-neuroses-card'
import { CustomPatternsCard } from '@/components/custom/custom-patterns-card'
import { CustomPhilosophiesCard } from '@/components/custom/custom-philosophies-card'
import { CustomPrinciplesCard } from '@/components/custom/custom-principles-card'
import { CustomResourcesCard } from '@/components/custom/custom-resources-card'
import { CustomSecretFightingArtsCard } from '@/components/custom/custom-secret-fighting-arts-card'
import { CustomSeedPatternsCard } from '@/components/custom/custom-seed-patterns-card'
import { CustomStrainMilestonesCard } from '@/components/custom/custom-strain-milestones-card'
import { CustomSurvivorStatusesCard } from '@/components/custom/custom-survivor-statuses-card'
import { CustomTraitsCard } from '@/components/custom/custom-traits-card'
import { CustomWanderersCard } from '@/components/custom/custom-wanderers-card'
import { CustomWeaponTypesCard } from '@/components/custom/custom-weapon-types-card'
import { CustomMonstersCard } from '@/components/monster/custom-monsters-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
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
   * @param unlocked New Value
   */
  const handleKilleniumButcherUnlockedChange = useCallback(
    (unlocked: boolean) => {
      if (!userSettings) return

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
   * @param unlocked New Value
   */
  const handleScreamingNukalopeUnlockedChange = useCallback(
    (unlocked: boolean) => {
      if (!userSettings) return

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
   * @param unlocked New Value
   */
  const handleWhiteGigalionUnlockedChange = useCallback(
    (unlocked: boolean) => {
      if (!userSettings) return

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
    <div className="flex flex-col gap-4 pt-12 px-2">
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
                <Label
                  htmlFor="unlock-killenium-butcher"
                  className="font-medium text-sm">
                  Killenium Butcher
                </Label>
                <div className="text-sm text-muted-foreground">
                  Allows the Killenium Butcher nemesis to appear in showdowns.
                </div>
              </div>
              <Switch
                id="unlock-killenium-butcher"
                checked={userSettings?.unlocked_killenium_butcher ?? false}
                onCheckedChange={handleKilleniumButcherUnlockedChange}
                aria-label="Killenium Butcher"
              />
            </div>

            <Separator className="my-2" />

            <div className="flex items-center justify-between">
              <div>
                <Label
                  htmlFor="unlock-screaming-nukalope"
                  className="font-medium text-sm">
                  Screaming Nukalope
                </Label>
                <div className="text-sm text-muted-foreground">
                  Allows the Screaming Nukalope quarry to be hunted.
                </div>
              </div>
              <Switch
                id="unlock-screaming-nukalope"
                checked={userSettings?.unlocked_screaming_nukalope ?? false}
                onCheckedChange={handleScreamingNukalopeUnlockedChange}
                aria-label="Screaming Nukalope"
              />
            </div>

            <Separator className="my-2" />

            <div className="flex items-center justify-between">
              <div>
                <Label
                  htmlFor="unlock-white-gigalion"
                  className="font-medium text-sm">
                  White Gigalion
                </Label>
                <div className="text-sm text-muted-foreground">
                  Allows the White Gigalion quarry to be hunted.
                </div>
              </div>
              <Switch
                id="unlock-white-gigalion"
                checked={userSettings?.unlocked_white_gigalion ?? false}
                onCheckedChange={handleWhiteGigalionUnlockedChange}
                aria-label="White Gigalion"
              />
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
        <TabsList className="hidden lg:flex w-full">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomMilestonesCard local={local} />
              <CustomPrinciplesCard local={local} />
            </div>
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
            <CustomNeurosesCard local={local} />
          </div>
        </TabsContent>
        <TabsContent value="survivors">
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomFightingArtsCard local={local} />
              <CustomSecretFightingArtsCard local={local} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomDisordersCard local={local} />
              <CustomAbilityImpairmentsCard local={local} />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="monsters">
          <div className="grid grid-cols-1 gap-4">
            <CustomMonstersCard local={local} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomMoodsCard local={local} />
              <CustomTraitsCard local={local} />
            </div>
            <CustomSurvivorStatusesCard local={local} />
          </div>
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
