import { NumericInput } from '@/components/menu/numeric-input'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { updateSurvivor } from '@/lib/dal/survivor'
import { COMBAT_HEAD_UPDATED_MESSAGE } from '@/lib/messages'
import { SurvivorDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { HardHatIcon, Shield } from 'lucide-react'
import { ReactElement, useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

/**
 * Head Card Properties
 */
interface HeadCardProps {
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Head Card Component
 *
 * This component displays the survivor's head status. It includes armor points,
 * severe injuries, and light/heavy damage.
 *
 * @param props Head Card Properties
 * @returns Head Card Component
 */
export function HeadCard({
  selectedSurvivor,
  setSurvivors,
  survivors
}: HeadCardProps): ReactElement {
  const survivorIdRef = useRef<string | undefined>(undefined)

  const [headArmor, setHeadArmor] = useState(selectedSurvivor?.head_armor ?? 0)
  const [headDeaf, setHeadDeaf] = useState(selectedSurvivor?.head_deaf ?? false)
  const [headBlind, setHeadBlind] = useState(selectedSurvivor?.head_blind ?? 0)
  const [headShatteredJaw, setHeadShatteredJaw] = useState(
    selectedSurvivor?.head_shattered_jaw ?? false
  )
  const [headIntracranialHemorrhage, setHeadIntracranialHemorrhage] = useState(
    selectedSurvivor?.head_intracranial_hemorrhage ?? false
  )
  const [headHeavyDamage, setHeadHeavyDamage] = useState(
    selectedSurvivor?.head_heavy_damage ?? false
  )

  if (survivorIdRef.current !== selectedSurvivor?.id) {
    survivorIdRef.current = selectedSurvivor?.id
    setHeadArmor(selectedSurvivor?.head_armor ?? 0)
    setHeadDeaf(selectedSurvivor?.head_deaf ?? false)
    setHeadBlind(selectedSurvivor?.head_blind ?? 0)
    setHeadShatteredJaw(selectedSurvivor?.head_shattered_jaw ?? false)
    setHeadIntracranialHemorrhage(
      selectedSurvivor?.head_intracranial_hemorrhage ?? false
    )
    setHeadHeavyDamage(selectedSurvivor?.head_heavy_damage ?? false)
  }

  /**
   * Handle Head Field Update
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
        .then(() => toast.success(COMBAT_HEAD_UPDATED_MESSAGE()))
        .catch((error) => {
          setter(oldValue)
          setSurvivors(oldSurvivors)
          console.error('Error Updating Head:', error)
        })
    },
    [selectedSurvivor?.id, setSurvivors, survivors]
  )

  return (
    <Card className="p-2 border-0">
      <CardContent className="p-0 h-19">
        <div className="flex flex-row">
          {/* Head Armor */}
          <div className="relative flex items-center">
            <Shield
              className="h-14 w-14 text-muted-foreground"
              strokeWidth={1}
            />
            <NumericInput
              label="Head Armor"
              value={headArmor}
              min={0}
              onChange={(value) =>
                handleUpdate('head_armor', value, setHeadArmor, headArmor)
              }
              className="absolute top-[50%] left-7 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-xl sm:text-xl md:text-xl text-center p-0 !bg-transparent border-none no-spinners focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="mx-2 w-px bg-border h-19" />

          <div className="flex flex-row items-start w-full">
            <div className="text-sm font-bold flex flex-row gap-1 w-18">
              <HardHatIcon className="h-5 w-5" /> Head
            </div>
            <div className="flex flex-col gap-1 ml-2">
              {/* Severe Injuries - Deaf */}
              <div className="space-y-0 flex flex-row items-center gap-2">
                <Checkbox
                  className="h-4 w-4 rounded-sm"
                  checked={headDeaf}
                  onCheckedChange={(checked) =>
                    handleUpdate('head_deaf', !!checked, setHeadDeaf, headDeaf)
                  }
                />
                <Label className="text-xs">Deaf</Label>
              </div>

              {/* Severe Injuries - Blind */}
              <div className="flex flex-row gap-2">
                <div className="flex gap-1 items-center">
                  {[...Array(2)].map((_, index) => (
                    <Checkbox
                      key={index}
                      checked={headBlind > index}
                      onCheckedChange={(checked) => {
                        let newValue = headBlind
                        if (checked) newValue = index + 1
                        else if (headBlind === index + 1) newValue = index

                        handleUpdate(
                          'head_blind',
                          newValue,
                          setHeadBlind,
                          headBlind
                        )
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs">Blind</span>
              </div>

              {/* Severe Injuries - Shattered Jaw */}
              <div className="space-y-0 flex flex-row items-center gap-2">
                <Checkbox
                  className="h-4 w-4 rounded-sm"
                  checked={headShatteredJaw}
                  onCheckedChange={(checked) =>
                    handleUpdate(
                      'head_shattered_jaw',
                      !!checked,
                      setHeadShatteredJaw,
                      headShatteredJaw
                    )
                  }
                />
                <Label className="text-xs">Shattered Jaw</Label>
              </div>

              {/* Severe Injuries - Intracranial Hemorrhage */}
              <div className="space-y-0 flex flex-row items-center gap-2">
                <Checkbox
                  className="h-4 w-4 rounded-sm"
                  checked={headIntracranialHemorrhage}
                  onCheckedChange={(checked) =>
                    handleUpdate(
                      'head_intracranial_hemorrhage',
                      !!checked,
                      setHeadIntracranialHemorrhage,
                      headIntracranialHemorrhage
                    )
                  }
                />
                <Label className="text-xs">Intracranial Hemorrhage</Label>
              </div>
            </div>

            {/* Heavy Head Damage */}
            <div className="flex flex-col items-center ml-auto">
              <div className="flex flex-col items-center">
                <Checkbox
                  className={cn(
                    'h-4 w-4 rounded-sm',
                    !headHeavyDamage && 'border-2 border-primary',
                    !headHeavyDamage && 'border-4 border-primary'
                  )}
                  checked={headHeavyDamage}
                  onCheckedChange={(checked) =>
                    handleUpdate(
                      'head_heavy_damage',
                      !!checked,
                      setHeadHeavyDamage,
                      headHeavyDamage
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
