'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { updateSettlementNemesis } from '@/lib/dal/settlement-nemesis'
import { updateSettlementQuarry } from '@/lib/dal/settlement-quarry'
import {
  COLLECTIVE_COGNITION_VICTORY_SAVED_MESSAGE,
  ERROR_MESSAGE
} from '@/lib/messages'
import { SettlementDetail } from '@/lib/types'
import { TrophyIcon } from 'lucide-react'
import { ReactElement, useCallback } from 'react'
import { toast } from 'sonner'

/**
 * Collective Cognition Victories Card Properties
 */
interface CollectiveCognitionVictoriesCardProps {
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: (settlement: SettlementDetail | null) => void
}

/**
 * Collective Cognition Victories Card Component
 *
 * Displays and manages the collective cognition victories tracking table.
 * Allows checking off victories with optimistic updates and rollback on error.
 *
 * @param props Collective Cognition Victories Card Properties
 * @returns Collective Cognition Victories Card Component
 */
export function CollectiveCognitionVictoriesCard({
  selectedSettlement,
  setSelectedSettlement
}: CollectiveCognitionVictoriesCardProps): ReactElement {
  /**
   * Handle Quarry CC Toggle
   *
   * Optimistically updates a quarry's collective cognition checkbox, persists
   * to the DB, and rolls back on failure.
   *
   * @param quarryIndex Quarry Index
   * @param field CC Field Name
   * @param checked New Checked State
   * @param subIndex Sub-index for array fields (level 2/3)
   */
  const handleQuarryCCToggle = useCallback(
    (
      quarryIndex: number,
      field:
        | 'collective_cognition_prologue'
        | 'collective_cognition_level_1'
        | 'collective_cognition_level_2'
        | 'collective_cognition_level_3',
      checked: boolean,
      subIndex?: number
    ) => {
      if (!selectedSettlement) return

      const quarry = selectedSettlement.quarries[quarryIndex]
      if (!quarry) return

      // Build the updated field value.
      let updatedValue: boolean | [boolean, boolean] | [boolean, boolean, boolean]

      if (field === 'collective_cognition_level_2' && subIndex !== undefined) {
        const arr: [boolean, boolean] = [...quarry.collective_cognition_level_2]
        arr[subIndex] = checked
        updatedValue = arr
      } else if (
        field === 'collective_cognition_level_3' &&
        subIndex !== undefined
      ) {
        const arr: [boolean, boolean, boolean] = [
          ...quarry.collective_cognition_level_3
        ]
        arr[subIndex] = checked
        updatedValue = arr
      } else {
        updatedValue = checked
      }

      // Optimistic update.
      const updatedQuarries = selectedSettlement.quarries.map((q, i) =>
        i === quarryIndex ? { ...q, [field]: updatedValue } : q
      )

      setSelectedSettlement({
        ...selectedSettlement,
        quarries: updatedQuarries
      })

      updateSettlementQuarry(quarry.id, { [field]: updatedValue })
        .then(() =>
          toast.success(COLLECTIVE_COGNITION_VICTORY_SAVED_MESSAGE(checked))
        )
        .catch((err: unknown) => {
          // Revert the optimistic update.
          setSelectedSettlement({
            ...selectedSettlement,
            quarries: selectedSettlement.quarries
          })

          console.error('Quarry CC Toggle Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement]
  )

  /**
   * Handle Nemesis CC Toggle
   *
   * Optimistically updates a nemesis' collective cognition checkbox, persists
   * to the DB, and rolls back on failure.
   *
   * @param nemesisIndex Nemesis Index
   * @param field CC Field Name
   * @param checked New Checked State
   */
  const handleNemesisCCToggle = useCallback(
    (
      nemesisIndex: number,
      field:
        | 'collective_cognition_level_1'
        | 'collective_cognition_level_2'
        | 'collective_cognition_level_3',
      checked: boolean
    ) => {
      if (!selectedSettlement) return

      const nemesis = selectedSettlement.nemeses[nemesisIndex]
      if (!nemesis) return

      // Optimistic update.
      const updatedNemeses = selectedSettlement.nemeses.map((n, i) =>
        i === nemesisIndex ? { ...n, [field]: checked } : n
      )

      setSelectedSettlement({
        ...selectedSettlement,
        nemeses: updatedNemeses
      })

      updateSettlementNemesis(nemesis.id, { [field]: checked })
        .then(() =>
          toast.success(COLLECTIVE_COGNITION_VICTORY_SAVED_MESSAGE(checked))
        )
        .catch((err: unknown) => {
          // Revert the optimistic update.
          setSelectedSettlement({
            ...selectedSettlement,
            nemeses: selectedSettlement.nemeses
          })

          console.error('Nemesis CC Toggle Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement]
  )

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <TrophyIcon className="h-4 w-4" /> Settlement Victories
        </CardTitle>
      </CardHeader>

      <CardContent className="p-1 pb-2 pt-0">
        <div className="flex flex-col">
          {/* Quarries Table */}
          <div>
            <Table showVerticalBorders>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-sm font-bold">Quarry</TableHead>
                  <TableHead className="text-center text-xs">
                    Prologue
                    <br />1 CC
                  </TableHead>
                  <TableHead className="text-center text-xs">
                    Lvl 1<br />1 CC
                  </TableHead>
                  <TableHead className="text-center text-xs" colSpan={2}>
                    Lvl 2<br />2 CC
                  </TableHead>
                  <TableHead className="text-center text-xs" colSpan={3}>
                    Lvl 3+
                    <br />3 CC
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(selectedSettlement?.quarries ?? []).length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-sm text-muted-foreground py-4">
                      No quarries yet
                    </TableCell>
                  </TableRow>
                )}
                {(selectedSettlement?.quarries ?? []).map((quarry, index) => (
                  <TableRow key={quarry.id}>
                    <TableCell className="text-sm text-left pl-4">
                      {quarry.monster_name}
                    </TableCell>

                    {/* Prologue (only if the quarry has a prologue hunt) */}
                    <TableCell className="text-center p-0">
                      <div className="flex items-center justify-center gap-1">
                        {quarry.prologue && (
                          <Checkbox
                            checked={quarry.collective_cognition_prologue}
                            onCheckedChange={(checked) => {
                              if (checked !== 'indeterminate')
                                handleQuarryCCToggle(
                                  index,
                                  'collective_cognition_prologue',
                                  checked
                                )
                            }}
                            id={`quarries-${index}-cc-prologue`}
                            name={`quarries.${index}.cc-prologue`}
                          />
                        )}
                      </div>
                    </TableCell>

                    {/* Level 1 */}
                    <TableCell className="text-center p-0">
                      <div className="flex items-center justify-center gap-1">
                        <Checkbox
                          checked={quarry.collective_cognition_level_1}
                          onCheckedChange={(checked) => {
                            if (checked !== 'indeterminate')
                              handleQuarryCCToggle(
                                index,
                                'collective_cognition_level_1',
                                checked
                              )
                          }}
                          id={`quarries-${index}-cc-level-1`}
                          name={`quarries.${index}.cc-level-1`}
                        />
                      </div>
                    </TableCell>

                    {/* Level 2 (2 checkboxes) */}
                    <TableCell className="text-center p-0" colSpan={2}>
                      <div className="flex flex-row items-center justify-center gap-1">
                        {quarry.collective_cognition_level_2.map(
                          (checked, lvl2Index) => (
                            <div
                              className="flex items-center justify-center"
                              key={`cc-level-2-${lvl2Index}`}>
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(value) => {
                                  if (value !== 'indeterminate')
                                    handleQuarryCCToggle(
                                      index,
                                      'collective_cognition_level_2',
                                      value,
                                      lvl2Index
                                    )
                                }}
                                id={`quarries-${index}-cc-level-2-${lvl2Index}`}
                                name={`quarries.${index}.cc-level-2.${lvl2Index}`}
                              />
                            </div>
                          )
                        )}
                      </div>
                    </TableCell>

                    {/* Level 3 (3 checkboxes) */}
                    <TableCell className="text-center p-0" colSpan={3}>
                      <div className="flex flex-row items-center justify-center gap-1">
                        {quarry.collective_cognition_level_3.map(
                          (checked, lvl3Index) => (
                            <div
                              key={`cc-level-3-${lvl3Index}`}
                              className="flex items-center justify-center">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(value) => {
                                  if (value !== 'indeterminate')
                                    handleQuarryCCToggle(
                                      index,
                                      'collective_cognition_level_3',
                                      value,
                                      lvl3Index
                                    )
                                }}
                                id={`quarries-${index}-cc-level-3-${lvl3Index}`}
                                name={`quarries.${index}.cc-level-3.${lvl3Index}`}
                              />
                            </div>
                          )
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Nemeses Table */}
          <div className="pt-1">
            <Table showVerticalBorders>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-sm font-bold">Nemesis</TableHead>
                  <TableHead className="text-center text-xs">
                    Lvl 1<br />3 CC
                  </TableHead>
                  <TableHead className="text-center text-xs">
                    Lvl 2<br />3 CC
                  </TableHead>
                  <TableHead className="text-center text-xs">
                    Lvl 3+
                    <br />3 CC
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(selectedSettlement?.nemeses ?? []).length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-sm text-muted-foreground py-4">
                      No nemeses yet
                    </TableCell>
                  </TableRow>
                )}
                {(selectedSettlement?.nemeses ?? []).map((nemesis, index) => (
                  <TableRow key={nemesis.id}>
                    <TableCell className="text-sm text-left pl-4">
                      {nemesis.monster_name}
                    </TableCell>

                    {/* Level 1 */}
                    <TableCell className="text-center p-0">
                      <div className="flex items-center justify-center gap-1">
                        <Checkbox
                          checked={nemesis.collective_cognition_level_1}
                          onCheckedChange={(checked) => {
                            if (checked !== 'indeterminate')
                              handleNemesisCCToggle(
                                index,
                                'collective_cognition_level_1',
                                checked
                              )
                          }}
                          id={`nemesis-${index}-cc-level-1`}
                          name={`nemeses.${index}.cc-level-1`}
                        />
                      </div>
                    </TableCell>

                    {/* Level 2 */}
                    <TableCell className="text-center p-0">
                      <div className="flex items-center justify-center gap-1">
                        <Checkbox
                          checked={nemesis.collective_cognition_level_2}
                          onCheckedChange={(checked) => {
                            if (checked !== 'indeterminate')
                              handleNemesisCCToggle(
                                index,
                                'collective_cognition_level_2',
                                checked
                              )
                          }}
                          id={`nemesis-${index}-cc-level-2`}
                          name={`nemeses.${index}.cc-level-2`}
                        />
                      </div>
                    </TableCell>

                    {/* Level 3 */}
                    <TableCell className="text-center p-0">
                      <div className="flex items-center justify-center gap-1">
                        <Checkbox
                          checked={nemesis.collective_cognition_level_3}
                          onCheckedChange={(checked) => {
                            if (checked !== 'indeterminate')
                              handleNemesisCCToggle(
                                index,
                                'collective_cognition_level_3',
                                checked
                              )
                          }}
                          id={`nemesis-${index}-cc-level-3`}
                          name={`nemeses.${index}.cc-level-3`}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
