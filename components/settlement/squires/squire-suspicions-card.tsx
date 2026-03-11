'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { updateSurvivor } from '@/lib/dal/survivor'
import { Tables } from '@/lib/database.types'
import { ERROR_MESSAGE, SQUIRE_SUSPICION_UPDATED_MESSAGE } from '@/lib/messages'
import { EyeIcon } from 'lucide-react'
import { ReactElement } from 'react'
import { toast } from 'sonner'

/**
 * Squire Suspicions Card Properties
 */
interface SquireSuspicionsCardProps {
  /** Set Survivors */
  setSurvivors: (survivors: Tables<'survivor'>[]) => void
  /** Survivors */
  survivors: Tables<'survivor'>[]
}

/**
 * Squire Suspicions Card Component
 *
 * @param props Squire Suspicions Card Properties
 * @returns Squire Suspicions Card Component
 */
export function SquireSuspicionsCard({
  setSurvivors,
  survivors
}: SquireSuspicionsCardProps): ReactElement {
  // Calculate total suspicion level
  const totalSuspicion = survivors.reduce((total, survivor) => {
    let suspicionLevel = 0

    if (survivor.squire_suspicion_level_1) suspicionLevel += 1
    if (survivor.squire_suspicion_level_2) suspicionLevel += 1
    if (survivor.squire_suspicion_level_3) suspicionLevel += 1
    if (survivor.squire_suspicion_level_4) suspicionLevel += 1

    return total + suspicionLevel
  }, 0)

  /**
   * Compute Suspicion Levels
   *
   * Computes a consistent set of suspicion levels based on cascading rules:
   * checking a higher level also checks all lower levels, and unchecking a
   * lower level also unchecks all higher levels.
   *
   * @param survivor Survivor Record
   * @param level Suspicion Level Being Changed
   * @param checked New Checked State
   * @returns Updated Suspicion Levels
   */
  const computeSuspicionLevels = (
    survivor: Tables<'survivor'>,
    level: number,
    checked: boolean
  ) => {
    let level1 = survivor.squire_suspicion_level_1
    let level2 = survivor.squire_suspicion_level_2
    let level3 = survivor.squire_suspicion_level_3
    let level4 = survivor.squire_suspicion_level_4

    // Update the specified level
    if (level === 1) level1 = checked
    if (level === 2) level2 = checked
    if (level === 3) level3 = checked
    if (level === 4) level4 = checked

    // If checking a higher level, also check all lower levels
    if (checked) {
      if (level >= 2) level1 = true
      if (level >= 3) level2 = true
      if (level >= 4) level3 = true
    }

    // If unchecking a lower level, also uncheck all higher levels
    if (!checked) {
      if (level <= 1) level2 = false
      if (level <= 2) level3 = false
      if (level <= 3) level4 = false
    }

    return {
      squire_suspicion_level_1: level1,
      squire_suspicion_level_2: level2,
      squire_suspicion_level_3: level3,
      squire_suspicion_level_4: level4
    }
  }

  /**
   * Handle Suspicion Level Change
   *
   * Optimistically updates the UI and persists the change to the database.
   * Reverts to previous state on error.
   *
   * @param survivorId Survivor ID
   * @param level Suspicion Level
   * @param checked Checked State
   */
  const handleSuspicionChange = (
    survivorId: string,
    level: number,
    checked: boolean
  ) => {
    const survivor = survivors.find((s) => s.id === survivorId)
    if (!survivor) return

    const updatedLevels = computeSuspicionLevels(survivor, level, checked)

    // Snapshot previous state for rollback on error
    const previousSurvivors = survivors

    // Optimistically update local state
    setSurvivors(
      survivors.map((s) =>
        s.id === survivorId ? { ...s, ...updatedLevels } : s
      )
    )

    updateSurvivor(survivorId, updatedLevels)
      .then(() => {
        toast.success(
          SQUIRE_SUSPICION_UPDATED_MESSAGE(survivor.survivor_name || 'Squire')
        )
      })
      .catch((error) => {
        // Revert to previous state on error
        setSurvivors(previousSurvivors)

        console.error('Suspicion Update Error:', error)
        toast.error(ERROR_MESSAGE())
      })
  }

  return (
    <Card className="p-0 border-0 gap-1">
      <CardHeader className="px-2 py-0">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-md flex items-center gap-1">
              <EyeIcon className="h-4 w-4" /> Suspicions
            </CardTitle>
            <CardDescription className="text-xs">
              Fill these milestone boxes as the squires observe suspicious
              behavior. Each checked box increases the suspicion level.
            </CardDescription>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Input
              type="number"
              className={`w-12 h-12 text-center no-spinners focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
                totalSuspicion >= 8
                  ? 'text-red-500 font-bold border-red-500'
                  : ''
              }`}
              value={totalSuspicion}
              readOnly
              disabled={false}
            />
            <Label className="text-center text-xs">Suspicion Level</Label>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex flex-col">
          <Table>
            <TableBody>
              <TableRow className="border-b">
                <TableCell className="font-medium text-left pl-5">
                  Squire
                </TableCell>
                <TableCell className="text-center" />
                <TableCell className="text-center" />
                <TableCell className="text-center" />
                <TableCell className="text-center" />
              </TableRow>
              {survivors.map((survivor, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-left pl-5">
                    {survivor.survivor_name}&apos;s Suspicion
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={survivor.squire_suspicion_level_1}
                      onCheckedChange={(checked) =>
                        handleSuspicionChange(survivor.id, 1, !!checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={survivor.squire_suspicion_level_2}
                      onCheckedChange={(checked) =>
                        handleSuspicionChange(survivor.id, 2, !!checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={survivor.squire_suspicion_level_3}
                      onCheckedChange={(checked) =>
                        handleSuspicionChange(survivor.id, 3, !!checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={survivor.squire_suspicion_level_4}
                      onCheckedChange={(checked) =>
                        handleSuspicionChange(survivor.id, 4, !!checked)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-2">
        <CardDescription className="text-xs">
          On <strong>Arrival</strong>, if the total suspicion is 8+, all
          survivors gain +3 insanity.
        </CardDescription>
      </CardFooter>
    </Card>
  )
}
