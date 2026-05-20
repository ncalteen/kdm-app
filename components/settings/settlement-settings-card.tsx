'use client'

import { OwnerOnly } from '@/components/generic/owner-only'
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
import { removeHunt } from '@/lib/dal/hunt'
import { removeSettlement, updateSettlement } from '@/lib/dal/settlement'
import { removeSettlementPhase } from '@/lib/dal/settlement-phase'
import { removeShowdown } from '@/lib/dal/showdown'
import {
  ERROR_MESSAGE,
  SETTLEMENT_DELETED_MESSAGE,
  SETTLEMENT_USES_SCOUTS_SETTING_UPDATED_MESSAGE
} from '@/lib/messages'
import {
  HuntDetail,
  HuntStateSetter,
  SettlementDetail,
  SettlementPhaseDetail,
  SettlementStateSetter,
  ShowdownDetail,
  ShowdownStateSetter
} from '@/lib/types'
import { SkullIcon, Trash2Icon, XIcon } from 'lucide-react'
import { ReactElement, useCallback, useState } from 'react'
import { toast } from 'sonner'

/**
 * Settlement Settings Card Properties
 */
interface SettlementSettingsCardProps {
  /** Selected Hunt */
  selectedHunt: HuntDetail | null
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Settlement Phase */
  selectedSettlementPhase: SettlementPhaseDetail | null
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
  /** Set Selected Settlement Phase */
  setSelectedSettlementPhase: (
    settlementPhase: SettlementPhaseDetail | null
  ) => void
  /** Set Selected Settlement Phase ID */
  setSelectedSettlementPhaseId: (settlementPhaseId: string | null) => void
  /** Set Selected Showdown */
  setSelectedShowdown: ShowdownStateSetter
  /** Set Selected Showdown ID */
  setSelectedShowdownId: (showdownId: string | null) => void
  /** Set Selected Survivor ID */
  setSelectedSurvivorId: (survivorId: string | null) => void
}

/**
 * Settlement Settings Card Component
 *
 * Hosts settlement-level settings and destructive actions for the active
 * settlement, hunt, and showdown.
 *
 * @param props Settlement Settings Card Properties
 * @returns Settlement Settings Card Component
 */
export function SettlementSettingsCard({
  selectedHunt,
  selectedSettlement,
  selectedSettlementPhase,
  selectedShowdown,
  setSelectedHunt,
  setSelectedHuntId,
  setSelectedSettlement,
  setSelectedSettlementId,
  setSelectedSettlementPhase,
  setSelectedSettlementPhaseId,
  setSelectedShowdown,
  setSelectedShowdownId,
  setSelectedSurvivorId
}: SettlementSettingsCardProps): ReactElement {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)

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
      })
      .catch((err: unknown) => {
        console.error('Delete Showdown Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [selectedShowdown, setSelectedShowdown, setSelectedShowdownId])

  /**
   * Delete the Selected Settlement Phase
   *
   * Removes the current settlement phase from the DB and clears the selected
   * settlement phase state.
   */
  const handleDeleteSettlementPhase = useCallback(() => {
    if (!selectedSettlementPhase?.id) return

    removeSettlementPhase(selectedSettlementPhase.id)
      .then(() => {
        setSelectedSettlementPhase(null)
        setSelectedSettlementPhaseId(null)
      })
      .catch((err: unknown) => {
        console.error('Delete Settlement Phase Error:', err)
        toast.error(ERROR_MESSAGE())
      })
  }, [
    selectedSettlementPhase,
    setSelectedSettlementPhase,
    setSelectedSettlementPhaseId
  ])

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
        setSelectedSettlementPhase(null)
        setSelectedSettlementPhaseId(null)
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
    setSelectedSettlementPhase,
    setSelectedSettlementPhaseId,
    setSelectedShowdown,
    setSelectedShowdownId,
    setSelectedSurvivorId
  ])

  const hasAnySettings =
    selectedSettlement ||
    selectedHunt ||
    selectedSettlementPhase ||
    selectedShowdown

  return (
    <div className="flex flex-col gap-4 pt-12 px-2">
      {!hasAnySettings && (
        <Card className="p-0">
          <CardHeader className="px-4 pt-3 pb-0">
            <CardTitle className="text-lg">No Settlement Selected</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-sm text-muted-foreground">
              Select a settlement before tending its lantern.
            </p>
          </CardContent>
        </Card>
      )}

      <OwnerOnly>
        {selectedSettlement && (
          <Card className="p-0">
            <CardHeader className="px-4 pt-3 pb-0">
              <CardTitle className="text-lg">Settlement Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center justify-between gap-4">
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
      </OwnerOnly>

      {selectedHunt && (
        <Card className="p-0 border-yellow-500">
          <CardHeader className="px-4 pt-3 pb-0">
            <CardTitle className="text-lg text-yellow-600">
              Active Hunt
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between gap-4">
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

      {selectedShowdown && (
        <Card className="p-0 border-yellow-500">
          <CardHeader className="px-4 pt-3 pb-0">
            <CardTitle className="text-lg text-yellow-600">
              Active Showdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between gap-4">
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

      {selectedSettlementPhase && (
        <Card className="p-0 border-yellow-500">
          <CardHeader className="px-4 pt-3 pb-0">
            <CardTitle className="text-lg text-yellow-600">
              Active Settlement Phase
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-medium text-sm">
                  Delete Current Settlement Phase
                </div>
                <div className="text-sm text-muted-foreground">
                  End the settlement phase and return survivors to the
                  settlement.
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteSettlementPhase}>
                <XIcon className="h-4 w-4 mr-2" />
                Delete Settlement Phase
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <OwnerOnly>
        {selectedSettlement && (
          <Card className="p-0 border-destructive">
            <CardHeader className="px-4 pt-3 pb-0">
              <CardTitle className="text-lg text-destructive flex items-center gap-2">
                <SkullIcon className="h-5 w-5" aria-hidden="true" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-sm">
                    Permanently delete this settlement
                  </div>
                  <div className="text-sm text-muted-foreground">
                    This action cannot be undone. All survivors will be
                    forgotten.
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
                      Delete{' '}
                      {selectedSettlement.settlement_name ?? 'Settlement'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Settlement</AlertDialogTitle>
                      <AlertDialogDescription>
                        The darkness hungers for{' '}
                        {selectedSettlement.settlement_name}.{' '}
                        <strong>
                          Once consumed, all who dwelled within will be
                          forgotten.
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
      </OwnerOnly>
    </div>
  )
}
