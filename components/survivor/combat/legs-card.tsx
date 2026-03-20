import { NumericInput } from '@/components/menu/numeric-input'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { updateSurvivor } from '@/lib/dal/survivor'
import { COMBAT_LEGS_UPDATED_MESSAGE } from '@/lib/messages'
import { SurvivorDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { FootprintsIcon, Shield } from 'lucide-react'
import { ReactElement, useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

/**
 * Legs Card Properties
 */
interface LegsCardProps {
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Legs Card Component
 *
 * This component displays the survivor's legs status. It includes armor points,
 * severe injuries, and light/heavy damage.
 *
 * @param props Legs Card Properties
 * @returns Legs Card Component
 */
export function LegsCard({
  selectedSurvivor,
  setSurvivors,
  survivors
}: LegsCardProps): ReactElement {
  const survivorIdRef = useRef<string | undefined>(undefined)

  const [legArmor, setLegArmor] = useState(selectedSurvivor?.leg_armor ?? 0)
  const [legHamstrung, setLegHamstrung] = useState(
    selectedSurvivor?.leg_hamstrung ?? false
  )
  const [legBroken, setLegBroken] = useState(selectedSurvivor?.leg_broken ?? 0)
  const [legDismembered, setLegDismembered] = useState(
    selectedSurvivor?.leg_dismembered ?? 0
  )
  const [legLightDamage, setLegLightDamage] = useState(
    selectedSurvivor?.leg_light_damage ?? false
  )
  const [legHeavyDamage, setLegHeavyDamage] = useState(
    selectedSurvivor?.leg_heavy_damage ?? false
  )

  if (survivorIdRef.current !== selectedSurvivor?.id) {
    survivorIdRef.current = selectedSurvivor?.id
    setLegArmor(selectedSurvivor?.leg_armor ?? 0)
    setLegHamstrung(selectedSurvivor?.leg_hamstrung ?? false)
    setLegBroken(selectedSurvivor?.leg_broken ?? 0)
    setLegDismembered(selectedSurvivor?.leg_dismembered ?? 0)
    setLegLightDamage(selectedSurvivor?.leg_light_damage ?? false)
    setLegHeavyDamage(selectedSurvivor?.leg_heavy_damage ?? false)
  }

  /**
   * Handle Leg Field Update
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
        .then(() => toast.success(COMBAT_LEGS_UPDATED_MESSAGE()))
        .catch((error) => {
          setter(oldValue)
          setSurvivors(oldSurvivors)
          console.error('Error Updating Legs:', error)
        })
    },
    [selectedSurvivor?.id, setSurvivors, survivors]
  )

  return (
    <Card className="p-2 border-0">
      <CardContent className="p-0 h-19">
        <div className="flex flex-row">
          {/* Leg Armor */}
          <div className="relative flex items-center">
            <Shield
              className="h-14 w-14 text-muted-foreground"
              strokeWidth={1}
            />
            <NumericInput
              label="Leg Armor"
              value={legArmor}
              min={0}
              onChange={(value) =>
                handleUpdate('leg_armor', value, setLegArmor, legArmor)
              }
              className="absolute top-[50%] left-7 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-xl sm:text-xl md:text-xl text-center p-0 !bg-transparent border-none no-spinners focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="mx-2 w-px bg-border h-19" />

          <div className="flex flex-row items-start w-full">
            <div className="text-sm font-bold flex flex-row gap-1 w-18">
              <FootprintsIcon className="h-5 w-5" /> Legs
            </div>
            <div className="flex flex-col gap-1 ml-2">
              {/* Severe Injuries */}
              <div className="space-y-0 flex flex-row items-center gap-2">
                <Checkbox
                  className="h-4 w-4 rounded-sm"
                  checked={legHamstrung}
                  onCheckedChange={(checked) =>
                    handleUpdate(
                      'leg_hamstrung',
                      !!checked,
                      setLegHamstrung,
                      legHamstrung
                    )
                  }
                  name="leg-hamstrung"
                  id="leg-hamstrung"
                />
                <Label className="text-xs">Hamstrung</Label>
              </div>

              <div className="flex flex-row gap-2">
                <div className="flex gap-1 items-center">
                  {[...Array(2)].map((_, index) => (
                    <Checkbox
                      key={index}
                      checked={legBroken > index}
                      onCheckedChange={(checked) => {
                        let newValue = legBroken
                        if (checked) newValue = index + 1
                        else if (legBroken === index + 1) newValue = index

                        handleUpdate(
                          'leg_broken',
                          newValue,
                          setLegBroken,
                          legBroken
                        )
                      }}
                      name={`leg-broken-${index + 1}`}
                      id={`leg-broken-${index + 1}`}
                    />
                  ))}
                </div>
                <span className="text-xs">Broken Leg</span>
              </div>

              <div className="flex flex-row gap-2">
                <div className="flex gap-1 items-center">
                  {[...Array(2)].map((_, index) => (
                    <Checkbox
                      key={index}
                      checked={legDismembered > index}
                      onCheckedChange={(checked) => {
                        let newValue = legDismembered
                        if (checked) newValue = index + 1
                        else if (legDismembered === index + 1) newValue = index

                        handleUpdate(
                          'leg_dismembered',
                          newValue,
                          setLegDismembered,
                          legDismembered
                        )
                      }}
                      name={`leg-dismembered-${index + 1}`}
                      id={`leg-dismembered-${index + 1}`}
                    />
                  ))}
                </div>
                <span className="text-xs">Dismembered Leg</span>
              </div>
            </div>

            {/* Light and Heavy Damage */}
            <div className="flex flex-row gap-2 ml-auto">
              {/* Light Damage */}
              <div className="flex flex-col items-center">
                <Checkbox
                  className={cn(
                    'h-4 w-4 rounded-sm',
                    !legLightDamage && 'border-2 border-primary',
                    !legLightDamage && 'border-2 border-primary'
                  )}
                  checked={legLightDamage}
                  onCheckedChange={(checked) =>
                    handleUpdate(
                      'leg_light_damage',
                      !!checked,
                      setLegLightDamage,
                      legLightDamage
                    )
                  }
                  name="leg-light-damage"
                  id="leg-light-damage"
                />
                <Label className="text-xs mt-1">L</Label>
              </div>

              {/* Heavy Damage */}
              <div className="flex flex-col items-center">
                <Checkbox
                  className={cn(
                    'h-4 w-4 rounded-sm',
                    !legHeavyDamage && 'border-2 border-primary',
                    !legHeavyDamage && 'border-4 border-primary'
                  )}
                  checked={legHeavyDamage}
                  onCheckedChange={(checked) =>
                    handleUpdate(
                      'leg_heavy_damage',
                      !!checked,
                      setLegHeavyDamage,
                      legHeavyDamage
                    )
                  }
                  name="leg-heavy-damage"
                  id="leg-heavy-damage"
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
