'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { removeHunt } from '@/lib/dal/hunt'
import { removeSettlement, updateSettlement } from '@/lib/dal/settlement'
import { removeShowdown } from '@/lib/dal/showdown'
import { updateUserSettings } from '@/lib/dal/user'
import {
  CAMPAIGN_UNLOCK_KILLENIUM_BUTCHER_UPDATED_MESSAGE,
  CAMPAIGN_UNLOCK_SCREAMING_NUKALOPE_UPDATED_MESSAGE,
  CAMPAIGN_UNLOCK_WHITE_GIGALION_UPDATED_MESSAGE,
  ERROR_MESSAGE,
  HUNT_DELETED_MESSAGE,
  SETTLEMENT_DELETED_MESSAGE,
  SETTLEMENT_USES_SCOUTS_SETTING_UPDATED_MESSAGE,
  SHOWDOWN_DELETED_MESSAGE
} from '@/lib/messages'
import { generateSeedData } from '@/lib/seed'
import {
  HuntDetail,
  SettlementDetail,
  ShowdownDetail,
  UserSettingsDetail
} from '@/lib/types'
import { DatabaseIcon, Loader2, Trash2Icon, XIcon } from 'lucide-react'
import { ReactElement, useCallback, useState, useTransition } from 'react'
import { toast } from 'sonner'

/**
 * Settings Card Properties
 */
interface SettingsCardProps {
  /** Selected Hunt */
  selectedHunt: HuntDetail | null
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Showdown */
  selectedShowdown: ShowdownDetail | null
  /** Set Selected Hunt */
  setSelectedHunt: (hunt: HuntDetail | null) => void
  /** Set Selected Hunt ID */
  setSelectedHuntId: (huntId: string | null) => void
  /** Set Selected Settlement */
  setSelectedSettlement: (settlement: SettlementDetail | null) => void
  /** Set Selected Settlement ID */
  setSelectedSettlementId: (settlementId: string | null) => void
  /** Set Selected Showdown */
  setSelectedShowdown: (showdown: ShowdownDetail | null) => void
  /** Set Selected Showdown ID */
  setSelectedShowdownId: (showdownId: string | null) => void
  /** Set Selected Survivor ID */
  setSelectedSurvivorId: (survivorId: string | null) => void
  /** Set User Settings */
  setUserSettings: (settings: UserSettingsDetail | null) => void
  /** User Settings */
  userSettings: UserSettingsDetail | null
}

/**
 * Settings Card Component
 *
 * Displays settlement settings, delete actions for the current hunt/showdown/
 * settlement, and development tools for generating seed data. All mutations
 * use optimistic updates with rollback on failure.
 *
 * @param props Settings Card Properties
 * @returns Settings Card Component
 */
export function SettingsCard({
  selectedHunt,
  selectedSettlement,
  selectedShowdown,
  setSelectedHunt,
  setSelectedHuntId,
  setSelectedSettlement,
  setSelectedSettlementId,
  setSelectedShowdown,
  setSelectedShowdownId,
  setSelectedSurvivorId,
  setUserSettings,
  userSettings
}: SettingsCardProps): ReactElement {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [isSeeding, startSeedTransition] = useTransition()

  /**
   * Handle Uses Scouts Setting Change
   *
   * Optimistically updates the settlement's uses_scouts flag, then persists to
   * the DB. Rolls back on failure.
   *
   * @param value New Value
   */
  const handleUsesScoutsChange = useCallback(
    (value: string) => {
      if (!selectedSettlement) return

      const usesScouts = value === 'true'
      const previousValue = selectedSettlement.uses_scouts

      // Optimistic update.
      setSelectedSettlement({
        ...selectedSettlement,
        uses_scouts: usesScouts
      })

      updateSettlement(selectedSettlement.id, { uses_scouts: usesScouts })
        .then(() =>
          toast.success(
            SETTLEMENT_USES_SCOUTS_SETTING_UPDATED_MESSAGE(usesScouts)
          )
        )
        .catch((err: unknown) => {
          // Revert the optimistic update.
          setSelectedSettlement({
            ...selectedSettlement,
            uses_scouts: previousValue
          })

          console.error('Uses Scouts Update Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement]
  )

  /**
   * Handle Killenium Butcher Unlock Change
   *
   * Optimistically updates the user's unlocked_killenium_butcher flag, then
   * persists to the DB. Rolls back on failure.
   *
   * @param value New Value
   */
  const handleKilleniumButcherUnlockedChange = useCallback(
    (value: string) => {
      if (!userSettings) return

      const unlocked = value === 'true'
      const previousValue = userSettings.unlocked_killenium_butcher

      // Optimistic update.
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
          // Revert the optimistic update.
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
   * Optimistically updates the user's unlocked_screaming_nukalope flag, then
   * persists to the DB. Rolls back on failure.
   *
   * @param value New Value
   */
  const handleScreamingNukalopeUnlockedChange = useCallback(
    (value: string) => {
      if (!userSettings) return

      const unlocked = value === 'true'
      const previousValue = userSettings.unlocked_screaming_nukalope

      // Optimistic update.
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
          // Revert the optimistic update.
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
   * Optimistically updates the user's unlocked_white_gigalion flag, then
   * persists to the DB. Rolls back on failure.
   *
   * @param value New Value
   */
  const handleWhiteGigalionUnlockedChange = useCallback(
    (value: string) => {
      if (!userSettings) return

      const unlocked = value === 'true'
      const previousValue = userSettings.unlocked_white_gigalion

      // Optimistic update.
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
          // Revert the optimistic update.
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

  /**
   * Delete the Selected Hunt
   *
   * Removes the current hunt from the DB and clears the selected hunt state.
   */
  const handleDeleteHunt = useCallback(() => {
    if (!selectedHunt?.id) return

    removeHunt(selectedHunt.id)
      .then(() => {
        setSelectedHunt(null)
        setSelectedHuntId(null)
        toast.success(HUNT_DELETED_MESSAGE())
      })
      .catch((err: unknown) => {
        console.error('Delete Hunt Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [selectedHunt, setSelectedHunt, setSelectedHuntId])

  /**
   * Delete the Selected Showdown
   *
   * Removes the current showdown from the DB and clears the selected showdown
   * state.
   */
  const handleDeleteShowdown = useCallback(() => {
    if (!selectedShowdown?.id) return

    removeShowdown(selectedShowdown.id)
      .then(() => {
        setSelectedShowdown(null)
        setSelectedShowdownId(null)
        toast.success(SHOWDOWN_DELETED_MESSAGE())
      })
      .catch((err: unknown) => {
        console.error('Delete Showdown Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [selectedShowdown, setSelectedShowdown, setSelectedShowdownId])

  /**
   * Delete the Settlement
   *
   * Removes the settlement from the DB and clears all related state.
   */
  const handleDeleteSettlement = useCallback(() => {
    if (!selectedSettlement?.id) return

    const settlementName =
      selectedSettlement.settlement_name ?? 'this settlement'

    removeSettlement(selectedSettlement.id)
      .then(() => {
        setSelectedHunt(null)
        setSelectedHuntId(null)
        setSelectedSettlement(null)
        setSelectedSettlementId(null)
        setSelectedShowdown(null)
        setSelectedShowdownId(null)
        setSelectedSurvivorId(null)

        setIsDeleteDialogOpen(false)

        toast.success(SETTLEMENT_DELETED_MESSAGE(settlementName))
      })
      .catch((err: unknown) => {
        console.error('Settlement Delete Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [
    selectedSettlement,
    setSelectedHunt,
    setSelectedHuntId,
    setSelectedSettlement,
    setSelectedSettlementId,
    setSelectedShowdown,
    setSelectedShowdownId,
    setSelectedSurvivorId
  ])

  /**
   * Handle Generating Seed Data
   *
   * Only available in development mode. Deletes all existing data for the
   * user and creates comprehensive test settlements.
   */
  const handleGenerateSeedData = () => {
    startSeedTransition(async () => {
      try {
        await generateSeedData()
      } catch (err) {
        console.error('Seed Data Error:', err)
        toast.error(ERROR_MESSAGE())
      }
    })
  }

  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="flex flex-col gap-4">
      {/* Development Tools */}
      {isDevelopment && (
        <Card className="p-0 border-blue-500">
          <CardHeader className="px-4 pt-3 pb-0">
            <CardTitle className="text-lg text-blue-600">
              Development Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Generate Seed Data</div>
                <div className="text-sm text-muted-foreground">
                  Creates multiple test settlements with survivors, hunts, and
                  showdowns. This will replace all existing data.
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isSeeding}>
                    {isSeeding ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <DatabaseIcon className="h-4 w-4 mr-2" />
                    )}
                    {isSeeding ? 'Generating...' : 'Seed Data'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Generate Seed Data</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will replace all existing settlements, survivors,
                      hunts, and showdowns with comprehensive test data. This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleGenerateSeedData}
                      className="bg-blue-600 text-white hover:bg-blue-700">
                      Generate Test Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settlement Settings */}
      {selectedSettlement && (
        <Card className="p-0">
          <CardHeader className="px-4 pt-3 pb-0">
            <CardTitle className="text-lg">Settlement Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Uses Scouts</div>
                <div className="text-sm text-muted-foreground">
                  Determines if scouts are required for hunts and showdowns.
                </div>
              </div>
              <Select
                value={
                  selectedSettlement.uses_scouts !== undefined
                    ? selectedSettlement.uses_scouts.toString()
                    : 'false'
                }
                onValueChange={handleUsesScoutsChange}
                name="uses-scouts"
                aria-label="Uses Scouts">
                <SelectTrigger className="w-24" id="uses-scouts">
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
      )}

      {/* Global Settings */}
      <Card className="p-0">
        <CardHeader className="px-4 pt-3 pb-0">
          <CardTitle className="text-lg">Global Settings</CardTitle>
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

      {/* Custom Monster Settings */}

      {/* Delete Selected Hunt */}
      {selectedHunt && (
        <Card className="p-0 border-yellow-500">
          <CardHeader className="px-4 pt-3 pb-0">
            <CardTitle className="text-lg text-yellow-600">
              Active Hunt
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Delete Current Hunt</div>
                <div className="text-sm text-muted-foreground">
                  End the hunt and return survivors to the settlement.
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleDeleteHunt}>
                <XIcon className="h-4 w-4 mr-2" />
                Delete Hunt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Selected Showdown */}
      {selectedShowdown && (
        <Card className="p-0 border-yellow-500">
          <CardHeader className="px-4 pt-3 pb-0">
            <CardTitle className="text-lg text-yellow-600">
              Active Showdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">
                  Delete Current Showdown
                </div>
                <div className="text-sm text-muted-foreground">
                  End the showdown and return survivors to the settlement.
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteShowdown}>
                <XIcon className="h-4 w-4 mr-2" />
                Delete Showdown
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      {selectedSettlement && (
        <Card className="p-0 border-destructive">
          <CardHeader className="px-4 pt-3 pb-0">
            <CardTitle className="text-lg text-destructive">
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">
                  Permanently delete this settlement
                </div>
                <div className="text-sm text-muted-foreground">
                  This action cannot be undone. All survivors will be forgotten.
                </div>
              </div>
              <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash2Icon className="h-4 w-4 mr-2" />
                    Delete {selectedSettlement.settlement_name ?? 'Settlement'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Settlement</AlertDialogTitle>
                    <AlertDialogDescription>
                      The darkness hungers for{' '}
                      {selectedSettlement.settlement_name}.{' '}
                      <strong>
                        Once consumed, all who dwelled within will be forgotten.
                      </strong>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteSettlement}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete{' '}
                      {selectedSettlement.settlement_name ?? 'Settlement'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
