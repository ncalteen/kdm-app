'use client'

import { LanternMark } from '@/components/generic/lantern-mark'
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
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { UpdatePasswordForm } from '@/components/update-password-form'
import { UpdateUsernameForm } from '@/components/update-username-form'
import { LocalStateType } from '@/contexts/local-context'
import { removeHunt } from '@/lib/dal/hunt'
import { removeSettlement, updateSettlement } from '@/lib/dal/settlement'
import { removeShowdown } from '@/lib/dal/showdown'
import {
  DISABLE_TOASTS_SETTING_UPDATED_MESSAGE,
  ERROR_MESSAGE,
  HUNT_DELETED_MESSAGE,
  SETTLEMENT_DELETED_MESSAGE,
  SETTLEMENT_USES_SCOUTS_SETTING_UPDATED_MESSAGE,
  SHOWDOWN_DELETED_MESSAGE
} from '@/lib/messages'
import { generateSeedData } from '@/lib/seed'
import {
  HuntDetail,
  HuntStateSetter,
  SettlementDetail,
  SettlementStateSetter,
  ShowdownDetail,
  ShowdownStateSetter,
  UserSettingsDetail
} from '@/lib/types'
import {
  DatabaseIcon,
  Loader2,
  SkullIcon,
  Trash2Icon,
  XIcon
} from 'lucide-react'
import { ReactElement, useCallback, useState, useTransition } from 'react'
import { toast } from 'sonner'

/**
 * Settings Card Properties
 */
interface SettingsCardProps {
  /** Local State */
  local: LocalStateType
  /** Selected Hunt */
  selectedHunt: HuntDetail | null
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Showdown */
  selectedShowdown: ShowdownDetail | null
  /** Set Selected Hunt */
  setSelectedHunt: HuntStateSetter
  /** Set Selected Hunt ID */
  setSelectedHuntId: (huntId: string | null) => void
  /** Set Selected Settlement */
  setSelectedSettlement: SettlementStateSetter
  /** Set Selected Settlement ID */
  setSelectedSettlementId: (settlementId: string | null) => void
  /** Set Selected Showdown */
  setSelectedShowdown: ShowdownStateSetter
  /** Set Selected Showdown ID */
  setSelectedShowdownId: (showdownId: string | null) => void
  /** Set Selected Survivor ID */
  setSelectedSurvivorId: (survivorId: string | null) => void
  /** Set User Settings */
  setUserSettings: (settings: UserSettingsDetail | null) => void
  /** Update Local State */
  updateLocal: (local: LocalStateType) => void
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
  local,
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
  updateLocal,
  userSettings
}: SettingsCardProps): ReactElement {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [isSeeding, startSeedTransition] = useTransition()
  const [disableToasts, setDisableToasts] = useState<boolean>(
    local.disableToasts ?? false
  )

  /**
   * Handle Disable Toasts Setting
   *
   * @param newDisableToasts New Value
   */
  const handleDisableToastsChange = (newDisableToasts: boolean) => {
    try {
      updateLocal({
        ...local,
        disableToasts: newDisableToasts
      })
      setDisableToasts(newDisableToasts)

      // Always show this toast so user knows the setting was changed
      toast.success(DISABLE_TOASTS_SETTING_UPDATED_MESSAGE(newDisableToasts))
    } catch (error) {
      console.error('Disable Toasts Update Error:', error)
      toast.error(ERROR_MESSAGE())
    }
  }

  /**
   * Handle Uses Scouts Setting Change
   *
   * Optimistically updates the settlement's uses_scouts flag, then persists to
   * the DB. Rolls back on failure.
   *
   * @param usesScouts New Value
   */
  const handleUsesScoutsChange = useCallback(
    (usesScouts: boolean) => {
      if (!selectedSettlement) return

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
          setSelectedSettlement((prev) =>
            prev ? { ...prev, uses_scouts: previousValue } : null
          )

          console.error('Uses Scouts Update Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement]
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
    <div className="flex flex-col gap-4 pt-12 px-2">
      {/* Account: Username + Password */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UpdateUsernameForm
          local={local}
          setUserSettings={setUserSettings}
          userSettings={userSettings}
          className="h-full"
        />
        <UpdatePasswordForm className="h-full" />
      </div>

      {/* Global Settings */}
      <Card className="p-0">
        <CardHeader className="px-4 pt-3 pb-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <LanternMark className="h-5 w-5 text-amber-400/90" />
            Global Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="disable-toasts" className="font-medium text-sm">
                Disable Notifications
              </Label>
              <div className="text-sm text-muted-foreground">
                Silences success messages. Errors will always be shown.
              </div>
            </div>
            <Switch
              id="disable-toasts"
              checked={disableToasts}
              onCheckedChange={handleDisableToastsChange}
              aria-label="Disable Notifications"
            />
          </div>
        </CardContent>
      </Card>

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
                      Generate Seed Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settlement Settings — owner only; collaborators are read-only on
          settlement.uses_scouts at the RLS layer. */}
      {selectedSettlement && selectedSettlement.role === 'owner' && (
        <Card className="p-0">
          <CardHeader className="px-4 pt-3 pb-0">
            <CardTitle className="text-lg">Settlement Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="uses-scouts" className="font-medium text-sm">
                  Uses Scouts
                </Label>
                <div className="text-sm text-muted-foreground">
                  Require a scout for hunts and showdowns.
                </div>
              </div>
              <Switch
                id="uses-scouts"
                checked={selectedSettlement.uses_scouts ?? false}
                onCheckedChange={handleUsesScoutsChange}
                aria-label="Uses Scouts"
              />
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Danger Zone — owner only; only the settlement owner may delete the
          settlement. RLS rejects DELETE for collaborators. */}
      {selectedSettlement && selectedSettlement.role === 'owner' && (
        <Card className="p-0 border-destructive">
          <CardHeader className="px-4 pt-3 pb-0">
            <CardTitle className="text-lg text-destructive flex items-center gap-2">
              <SkullIcon className="h-5 w-5" aria-hidden="true" />
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
