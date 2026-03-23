'use client'

import { NumericInput } from '@/components/menu/numeric-input'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { updateSurvivor } from '@/lib/dal/survivor'
import { COMBAT_BODY_UPDATED_MESSAGE } from '@/lib/messages'
import { SurvivorDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Shield, ShirtIcon } from 'lucide-react'
import { ReactElement, useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

/**
 * Body Card Properties
 */
interface BodyCardProps {
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Body Card Component
 *
 * This component displays the survivor's body status. It includes armor points,
 * severe injuries, and light/heavy damage.
 *
 * @param props Body Card Properties
 * @returns Body Card Component
 */
export function BodyCard({
  selectedSurvivor,
  setSurvivors,
  survivors
}: BodyCardProps): ReactElement {
  const survivorIdRef = useRef<string | undefined>(undefined)

  const [bodyArmor, setBodyArmor] = useState(selectedSurvivor?.body_armor ?? 0)
  const [bodyDestroyedBack, setBodyDestroyedBack] = useState(
    selectedSurvivor?.body_destroyed_back ?? false
  )
  const [bodyBrokenRib, setBodyBrokenRib] = useState(
    selectedSurvivor?.body_broken_rib ?? 0
  )
  const [bodyGapingChestWound, setBodyGapingChestWound] = useState(
    selectedSurvivor?.body_gaping_chest_wound ?? 0
  )
  const [bodyLightDamage, setBodyLightDamage] = useState(
    selectedSurvivor?.body_light_damage ?? false
  )
  const [bodyHeavyDamage, setBodyHeavyDamage] = useState(
    selectedSurvivor?.body_heavy_damage ?? false
  )

  if (survivorIdRef.current !== selectedSurvivor?.id) {
    survivorIdRef.current = selectedSurvivor?.id
    setBodyArmor(selectedSurvivor?.body_armor ?? 0)
    setBodyDestroyedBack(selectedSurvivor?.body_destroyed_back ?? false)
    setBodyBrokenRib(selectedSurvivor?.body_broken_rib ?? 0)
    setBodyGapingChestWound(selectedSurvivor?.body_gaping_chest_wound ?? 0)
    setBodyLightDamage(selectedSurvivor?.body_light_damage ?? false)
    setBodyHeavyDamage(selectedSurvivor?.body_heavy_damage ?? false)
  }

  /**
   * Handle Body Field Update
   *
   * Optimistically updates local state, syncs survivors array, and persists
   * the change to the database.
   *
   * @param field Database Column Name
   * @param value New Value
   * @param setter Local State Setter
   * @param oldValue Previous Value
   */
  const handleUpdate = useCallback(
    <T extends number | boolean>(
      field: string,
      value: T,
      setter: (v: T) => void,
      oldValue: T
    ) => {
      const oldSurvivors = [...survivors]

      setter(value)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, [field]: value } : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, { [field]: value })
        .then(() => toast.success(COMBAT_BODY_UPDATED_MESSAGE()))
        .catch((error) => {
          setter(oldValue)
          setSurvivors(oldSurvivors)
          console.error('Error Updating Body:', error)
        })
    },
    [selectedSurvivor?.id, setSurvivors, survivors]
  )

  return (
    <Card className="p-2 border-0">
      <CardContent className="p-0 h-19">
        <div className="flex flex-row">
          {/* Body Armor */}
          <div className="relative flex items-center">
            <Shield
              className="h-14 w-14 text-muted-foreground"
              strokeWidth={1}
            />
            <NumericInput
              label="Body Armor"
              value={bodyArmor}
              min={0}
              onChange={(value) =>
                handleUpdate('body_armor', value, setBodyArmor, bodyArmor)
              }
              className="absolute top-[50%] left-7 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-xl sm:text-xl md:text-xl text-center p-0 !bg-transparent border-none no-spinners focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="mx-2 w-px bg-border h-19" />

          <div className="flex flex-row items-start w-full">
            <div className="text-sm font-bold flex flex-row gap-1 w-18">
              <ShirtIcon className="h-5 w-5" /> Body
            </div>
            <div className="flex flex-col gap-1 ml-2">
              {/* Severe Injuries - Destroyed Back */}
              <div className="space-y-0 flex flex-row items-center gap-2">
                <Checkbox
                  className="h-4 w-4 rounded-sm"
                  checked={bodyDestroyedBack}
                  onCheckedChange={(checked) =>
                    handleUpdate(
                      'body_destroyed_back',
                      !!checked,
                      setBodyDestroyedBack,
                      bodyDestroyedBack
                    )
                  }
                />
                <Label className="text-xs">Destroyed Back</Label>
              </div>

              {/* Severe Injuries - Broken Rib */}
              <div className="space-y-0 flex flex-row items-center gap-2">
                <div className="flex flex-row gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Checkbox
                      key={value}
                      className="h-4 w-4 rounded-sm"
                      checked={bodyBrokenRib >= value}
                      onCheckedChange={(checked) => {
                        const newValue = checked ? value : value - 1
                        const safeValue = Math.max(0, Math.min(5, newValue))

                        handleUpdate(
                          'body_broken_rib',
                          safeValue,
                          setBodyBrokenRib,
                          bodyBrokenRib
                        )
                      }}
                    />
                  ))}
                </div>
                <Label className="text-xs">Broken Rib</Label>
              </div>

              {/* Severe Injuries - Gaping Chest Wound */}
              <div className="space-y-0 flex flex-row items-center gap-2">
                <div className="flex flex-row gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Checkbox
                      key={value}
                      className="h-4 w-4 rounded-sm"
                      checked={bodyGapingChestWound >= value}
                      onCheckedChange={(checked) => {
                        const newValue = checked ? value : value - 1
                        const safeValue = Math.max(0, Math.min(5, newValue))

                        handleUpdate(
                          'body_gaping_chest_wound',
                          safeValue,
                          setBodyGapingChestWound,
                          bodyGapingChestWound
                        )
                      }}
                    />
                  ))}
                </div>
                <Label className="text-xs">G. Chest Wound</Label>
              </div>
            </div>

            {/* Light and Heavy Damage */}
            <div className="flex flex-row gap-2 ml-auto">
              {/* Light Damage */}
              <div className="flex flex-col items-center">
                <Checkbox
                  className={cn(
                    'h-4 w-4 rounded-sm',
                    !bodyLightDamage && 'border-2 border-primary',
                    !bodyLightDamage && 'border-2 border-primary'
                  )}
                  checked={bodyLightDamage}
                  onCheckedChange={(checked) =>
                    handleUpdate(
                      'body_light_damage',
                      !!checked,
                      setBodyLightDamage,
                      bodyLightDamage
                    )
                  }
                />
                <Label className="text-xs mt-1">L</Label>
              </div>

              {/* Heavy Damage */}
              <div className="flex flex-col items-center">
                <Checkbox
                  className={cn(
                    'h-4 w-4 rounded-sm',
                    !bodyHeavyDamage && 'border-2 border-primary',
                    !bodyHeavyDamage && 'border-4 border-primary'
                  )}
                  checked={bodyHeavyDamage}
                  onCheckedChange={(checked) =>
                    handleUpdate(
                      'body_heavy_damage',
                      !!checked,
                      setBodyHeavyDamage,
                      bodyHeavyDamage
                    )
                  }
                />
                <Label className="text-xs mt-1">H</Label>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
