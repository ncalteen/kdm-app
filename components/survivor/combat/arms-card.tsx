'use client'

import { NumericInput } from '@/components/menu/numeric-input'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { updateSurvivor } from '@/lib/dal/survivor'
import { COMBAT_ARMS_UPDATED_MESSAGE } from '@/lib/messages'
import { SurvivorDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { HandMetalIcon, Shield } from 'lucide-react'
import { ReactElement, useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

/**
 * Arms Card Properties
 */
interface ArmsCardProps {
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Arms Card Component
 *
 * This component displays the survivor's arms status. It includes armor points,
 * severe injuries, and light/heavy damage.
 *
 * @param props Arms Card Properties
 * @returns Arms Card Component
 */
export function ArmsCard({
  selectedSurvivor,
  setSurvivors,
  survivors
}: ArmsCardProps): ReactElement {
  const survivorIdRef = useRef<string | undefined>(undefined)

  const [armArmor, setArmArmor] = useState(selectedSurvivor?.arm_armor ?? 0)
  const [armBroken, setArmBroken] = useState(selectedSurvivor?.arm_broken ?? 0)
  const [armRupturedMuscle, setArmRupturedMuscle] = useState(
    selectedSurvivor?.arm_ruptured_muscle ?? false
  )
  const [armDismembered, setArmDismembered] = useState(
    selectedSurvivor?.arm_dismembered ?? 0
  )
  const [armContracture, setArmContracture] = useState(
    selectedSurvivor?.arm_contracture ?? 0
  )
  const [armLightDamage, setArmLightDamage] = useState(
    selectedSurvivor?.arm_light_damage ?? false
  )
  const [armHeavyDamage, setArmHeavyDamage] = useState(
    selectedSurvivor?.arm_heavy_damage ?? false
  )

  if (survivorIdRef.current !== selectedSurvivor?.id) {
    survivorIdRef.current = selectedSurvivor?.id
    setArmArmor(selectedSurvivor?.arm_armor ?? 0)
    setArmBroken(selectedSurvivor?.arm_broken ?? 0)
    setArmRupturedMuscle(selectedSurvivor?.arm_ruptured_muscle ?? false)
    setArmDismembered(selectedSurvivor?.arm_dismembered ?? 0)
    setArmContracture(selectedSurvivor?.arm_contracture ?? 0)
    setArmLightDamage(selectedSurvivor?.arm_light_damage ?? false)
    setArmHeavyDamage(selectedSurvivor?.arm_heavy_damage ?? false)
  }

  /**
   * Handle Arm Field Update
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
        .then(() => toast.success(COMBAT_ARMS_UPDATED_MESSAGE()))
        .catch((error) => {
          setter(oldValue)
          setSurvivors(oldSurvivors)
          console.error('Error Updating Arms:', error)
        })
    },
    [selectedSurvivor?.id, setSurvivors, survivors]
  )

  return (
    <Card className="p-2 border-0">
      <CardContent className="p-0 h-19">
        <div className="flex flex-row">
          {/* Arm Armor */}
          <div className="relative flex items-center">
            <Shield
              className="h-14 w-14 text-muted-foreground"
              strokeWidth={1}
            />
            <NumericInput
              label="Arm Armor"
              value={armArmor}
              min={0}
              onChange={(value) =>
                handleUpdate('arm_armor', value, setArmArmor, armArmor)
              }
              className="absolute top-[50%] left-7 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-xl sm:text-xl md:text-xl text-center p-0 !bg-transparent border-none no-spinners focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="mx-2 w-px bg-border h-19" />

          <div className="flex flex-row items-start w-full">
            <div className="text-sm font-bold flex flex-row gap-1 w-18">
              <HandMetalIcon className="h-5 w-5" /> Arms
            </div>
            <div className="flex flex-col items-start gap-1 ml-2">
              {/* Severe Injuries - Broken Arm */}
              <div className="flex flex-row gap-2">
                <div className="flex gap-1 items-center">
                  {[...Array(2)].map((_, index) => (
                    <Checkbox
                      key={index}
                      checked={armBroken > index}
                      onCheckedChange={(checked) => {
                        let newValue = armBroken
                        if (checked) newValue = index + 1
                        else if (armBroken === index + 1) newValue = index

                        handleUpdate(
                          'arm_broken',
                          newValue,
                          setArmBroken,
                          armBroken
                        )
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs">Broken Arm</span>
              </div>

              {/* Severe Injuries - Ruptured Muscle */}
              <div className="space-y-0 flex flex-row items-center gap-2">
                <Checkbox
                  className="h-4 w-4 rounded-sm"
                  checked={armRupturedMuscle}
                  onCheckedChange={(checked) =>
                    handleUpdate(
                      'arm_ruptured_muscle',
                      !!checked,
                      setArmRupturedMuscle,
                      armRupturedMuscle
                    )
                  }
                />
                <Label className="text-xs">Ruptured Muscle</Label>
              </div>

              {/* Severe Injuries - Dismembered Arm */}
              <div className="flex flex-row gap-2">
                <div className="flex gap-1 items-center">
                  {[...Array(2)].map((_, index) => (
                    <Checkbox
                      key={index}
                      checked={armDismembered > index}
                      onCheckedChange={(checked) => {
                        let newValue = armDismembered
                        if (checked) newValue = index + 1
                        else if (armDismembered === index + 1) newValue = index

                        handleUpdate(
                          'arm_dismembered',
                          newValue,
                          setArmDismembered,
                          armDismembered
                        )
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs">Dismembered Arm</span>
              </div>

              {/* Severe Injuries - Contracture */}
              <div className="space-y-0 flex flex-row items-center gap-2">
                <div className="flex flex-row gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Checkbox
                      key={value}
                      className="h-4 w-4 rounded-sm"
                      checked={armContracture >= value}
                      onCheckedChange={(checked) => {
                        const newValue = checked ? value : value - 1
                        const safeValue = Math.max(0, Math.min(5, newValue))

                        handleUpdate(
                          'arm_contracture',
                          safeValue,
                          setArmContracture,
                          armContracture
                        )
                      }}
                    />
                  ))}
                </div>
                <Label className="text-xs">Contracture</Label>
              </div>
            </div>

            {/* Light and Heavy Damage */}
            <div className="flex flex-row gap-2 ml-auto">
              {/* Light Damage */}
              <div className="flex flex-col items-center">
                <Checkbox
                  className={cn(
                    'h-4 w-4 rounded-sm',
                    !armLightDamage && 'border-2 border-primary',
                    !armLightDamage && 'border-2 border-primary'
                  )}
                  checked={armLightDamage}
                  onCheckedChange={(checked) =>
                    handleUpdate(
                      'arm_light_damage',
                      !!checked,
                      setArmLightDamage,
                      armLightDamage
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
                    !armHeavyDamage && 'border-2 border-primary',
                    !armHeavyDamage && 'border-4 border-primary'
                  )}
                  checked={armHeavyDamage}
                  onCheckedChange={(checked) =>
                    handleUpdate(
                      'arm_heavy_damage',
                      !!checked,
                      setArmHeavyDamage,
                      armHeavyDamage
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
