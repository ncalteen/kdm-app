'use client'

import { CourageUnderstandingAbilities } from '@/components/survivor/courage-understanding/courage-understanding-abilities'
import { FacesInTheSky } from '@/components/survivor/courage-understanding/faces-in-the-sky'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { updateSurvivor } from '@/lib/dal/survivor'
import {
  ERROR_MESSAGE,
  SURVIVOR_COURAGE_UPDATED_MESSAGE,
  SURVIVOR_UNDERSTANDING_UPDATED_MESSAGE
} from '@/lib/messages'
import { SettlementDetail, SurvivorDetail } from '@/lib/types'
import { BookOpenIcon } from 'lucide-react'
import { ReactElement, useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

/**
 * Courage Understanding Card Properties
 */
interface CourageUnderstandingCardProps {
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Courage and Understanding Card Component
 *
 * This component displays the courage and understanding stats for a survivor.
 * It includes checkboxes to set the level of each stat from 0 to 9. The two
 * stats are displayed side by side, separated by a vertical divider.
 *
 * @param props Courage Understanding Card Properties
 * @returns Courage and Understanding Card Component
 */
export function CourageUnderstandingCard({
  selectedSettlement,
  selectedSurvivor,
  setSurvivors,
  survivors
}: CourageUnderstandingCardProps): ReactElement {
  const survivorIdRef = useRef<string | undefined>(undefined)

  const [courage, setCourage] = useState(selectedSurvivor?.courage ?? 0)
  const [understanding, setUnderstanding] = useState(
    selectedSurvivor?.understanding ?? 0
  )

  if (survivorIdRef.current !== selectedSurvivor?.id) {
    survivorIdRef.current = selectedSurvivor?.id
    setCourage(selectedSurvivor?.courage ?? 0)
    setUnderstanding(selectedSurvivor?.understanding ?? 0)
  }

  /**
   * Handle Update
   *
   * Updates the survivor's courage or understanding based on the field and
   * value provided. It also shows a success toast message and handles errors by
   * reverting the change and showing an error toast.
   *
   * @param field Field to Update ('courage' or 'understanding')
   * @param value Field Value
   * @param successMessage Success Message
   */
  const handleUpdate = useCallback(
    (
      field: 'courage' | 'understanding',
      value: number,
      successMessage: string
    ) => {
      const oldValue = field === 'courage' ? courage : understanding
      const setter = field === 'courage' ? setCourage : setUnderstanding

      setter(value)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, [field]: value } : s
        )
      )
      updateSurvivor(selectedSurvivor?.id, { [field]: value })
        .then(() => toast.success(successMessage))
        .catch((error) => {
          console.error(`${field} Update Error:`, error)
          setter(oldValue)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id ? { ...s, [field]: oldValue } : s
            )
          )
          toast.error(ERROR_MESSAGE())
        })
    },
    [courage, understanding, selectedSurvivor?.id, setSurvivors, survivors]
  )

  // Determine the label texts based on campaign type. Currently only People of
  // the Stars has different labels.
  const courageMilestoneText =
    selectedSettlement?.campaign_type === 'PEOPLE_OF_THE_STARS'
      ? 'Awake'
      : 'Bold'
  const understandingMilestoneText =
    selectedSettlement?.campaign_type === 'PEOPLE_OF_THE_STARS'
      ? 'Awake'
      : 'Insight'

  return (
    <Card className="p-2 border-0">
      <CardContent className="p-0">
        <div className="flex flex-row justify-between">
          {/* Courage */}
          <div className="flex flex-col w-[45%] gap-2">
            <Label className="font-bold text-left text-sm">Courage</Label>
            <div className="flex flex-row justify-between">
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className="w-4 h-4 flex items-center">
                  <Checkbox
                    checked={courage > i}
                    onCheckedChange={(checked) =>
                      handleUpdate(
                        'courage',
                        !!checked ? i + 1 : i,
                        SURVIVOR_COURAGE_UPDATED_MESSAGE()
                      )
                    }
                    className={
                      'h-4 w-4 rounded-sm' +
                      (i === 2 || i === 8 ? ' border-2 border-primary' : '')
                    }
                  />
                </div>
              ))}
            </div>

            <hr className="hidden lg:flex" />

            <div className="hidden lg:flex flex-row justify-between">
              {Array.from({ length: 2 }, (_, i) => (
                <div key={i} className="flex items-center gap-1">
                  {Array.from({ length: i + 1 }, (_, j) => (
                    <Checkbox
                      key={j}
                      disabled
                      className="!bg-white border border-gray-300 h-3 w-3"
                    />
                  ))}
                  {i === 0 ? (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <BookOpenIcon className="h-4 w-4" />{' '}
                      {courageMilestoneText}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <BookOpenIcon className="h-4 w-4" /> See the Truth
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Understanding Section */}
          <div className="flex flex-col w-[45%] gap-2">
            <Label className="font-bold text-left text-sm">Understanding</Label>
            <div className="flex flex-row justify-between">
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className="w-4 h-4 flex items-center">
                  <Checkbox
                    checked={understanding > i}
                    onCheckedChange={(checked) =>
                      handleUpdate(
                        'understanding',
                        !!checked ? i + 1 : i,
                        SURVIVOR_UNDERSTANDING_UPDATED_MESSAGE()
                      )
                    }
                    className={
                      'h-4 w-4 rounded-sm' +
                      (i === 2 || i === 8 ? ' border-2 border-primary' : '')
                    }
                  />
                </div>
              ))}
            </div>

            <hr className="hidden lg:flex" />

            <div className="hidden lg:flex flex-row justify-between">
              {Array.from({ length: 2 }, (_, i) => (
                <div key={i} className="flex items-center gap-1">
                  {Array.from({ length: i + 1 }, (_, j) => (
                    <Checkbox
                      key={j}
                      disabled
                      className="!bg-white border border-gray-300 h-3 w-3"
                    />
                  ))}
                  {i === 0 ? (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <BookOpenIcon className="h-4 w-4" />{' '}
                      {understandingMilestoneText}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <BookOpenIcon className="h-4 w-4" /> White Secret
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedSettlement?.campaign_type !== 'PEOPLE_OF_THE_STARS' ? (
          <CourageUnderstandingAbilities
            selectedSurvivor={selectedSurvivor}
            setSurvivors={setSurvivors}
            survivors={survivors}
          />
        ) : (
          <>
            <hr className="my-2 mx-1" />

            <FacesInTheSky
              selectedSurvivor={selectedSurvivor}
              setSurvivors={setSurvivors}
              survivors={survivors}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}
