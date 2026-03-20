import { NumericInput } from '@/components/menu/numeric-input'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { updateSurvivor } from '@/lib/dal/survivor'
import { COMBAT_WAIST_UPDATED_MESSAGE } from '@/lib/messages'
import { SurvivorDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { RibbonIcon, Shield } from 'lucide-react'
import { ReactElement, useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

/**
 * Waist Card Properties
 */
interface WaistCardProps {
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Waist Card Component
 *
 * This component displays the survivor's waist status. It includes armor
 * points, severe injuries, and light/heavy damage.
 *
 * @param props Waist Card Properties
 * @returns Waist Card Component
 */
export function WaistCard({
  selectedSurvivor,
  setSurvivors,
  survivors
}: WaistCardProps): ReactElement {
  const survivorIdRef = useRef<string | undefined>(undefined)

  const [waistArmor, setWaistArmor] = useState(
    selectedSurvivor?.waist_armor ?? 0
  )
  const [waistBrokenHip, setWaistBrokenHip] = useState(
    selectedSurvivor?.waist_broken_hip ?? false
  )
  const [waistIntestinalProlapse, setWaistIntestinalProlapse] = useState(
    selectedSurvivor?.waist_intestinal_prolapse ?? false
  )
  const [waistDestroyedGenitals, setWaistDestroyedGenitals] = useState(
    selectedSurvivor?.waist_destroyed_genitals ?? false
  )
  const [waistWarpedPelvis, setWaistWarpedPelvis] = useState(
    selectedSurvivor?.waist_warped_pelvis ?? 0
  )
  const [waistLightDamage, setWaistLightDamage] = useState(
    selectedSurvivor?.waist_light_damage ?? false
  )
  const [waistHeavyDamage, setWaistHeavyDamage] = useState(
    selectedSurvivor?.waist_heavy_damage ?? false
  )

  if (survivorIdRef.current !== selectedSurvivor?.id) {
    survivorIdRef.current = selectedSurvivor?.id
    setWaistArmor(selectedSurvivor?.waist_armor ?? 0)
    setWaistBrokenHip(selectedSurvivor?.waist_broken_hip ?? false)
    setWaistIntestinalProlapse(
      selectedSurvivor?.waist_intestinal_prolapse ?? false
    )
    setWaistDestroyedGenitals(
      selectedSurvivor?.waist_destroyed_genitals ?? false
    )
    setWaistWarpedPelvis(selectedSurvivor?.waist_warped_pelvis ?? 0)
    setWaistLightDamage(selectedSurvivor?.waist_light_damage ?? false)
    setWaistHeavyDamage(selectedSurvivor?.waist_heavy_damage ?? false)
  }

  /**
   * Handle Waist Field Update
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
        .then(() => toast.success(COMBAT_WAIST_UPDATED_MESSAGE()))
        .catch((error) => {
          setter(oldValue)
          setSurvivors(oldSurvivors)
          console.error('Error Updating Waist:', error)
        })
    },
    [selectedSurvivor?.id, setSurvivors, survivors]
  )

  return (
    <Card className="p-2 border-0">
      <CardContent className="p-0 h-19">
        <div className="flex flex-row">
          {/* Waist Armor */}
          <div className="relative flex items-center">
            <Shield
              className="h-14 w-14 text-muted-foreground"
              strokeWidth={1}
            />
            <NumericInput
              label="Waist Armor"
              value={waistArmor}
              min={0}
              onChange={(value) =>
                handleUpdate('waist_armor', value, setWaistArmor, waistArmor)
              }
              className="absolute top-[50%] left-7 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-xl sm:text-xl md:text-xl text-center p-0 !bg-transparent border-none no-spinners focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="mx-2 w-px bg-border h-19" />

          <div className="flex flex-row items-start w-full">
            <div className="text-sm font-bold flex flex-row gap-1 w-18">
              <RibbonIcon className="h-5 w-5" /> Waist
            </div>
            <div className="flex flex-col gap-1 ml-2">
              {/* Severe Injuries */}
              <div className="space-y-0 flex flex-row items-center gap-2">
                <Checkbox
                  className="h-4 w-4 rounded-sm"
                  checked={waistBrokenHip}
                  onCheckedChange={(checked) =>
                    handleUpdate(
                      'waist_broken_hip',
                      !!checked,
                      setWaistBrokenHip,
                      waistBrokenHip
                    )
                  }
                  name="waist-broken-hip"
                  id="waist-broken-hip"
                />
                <Label className="text-xs">Broken Hip</Label>
              </div>

              <div className="space-y-0 flex flex-row items-center gap-2">
                <Checkbox
                  className="h-4 w-4 rounded-sm"
                  checked={waistIntestinalProlapse}
                  onCheckedChange={(checked) =>
                    handleUpdate(
                      'waist_intestinal_prolapse',
                      !!checked,
                      setWaistIntestinalProlapse,
                      waistIntestinalProlapse
                    )
                  }
                  name="waist-intestinal-prolapse"
                  id="waist-intestinal-prolapse"
                />
                <Label className="text-xs">Intestinal Prolapse</Label>
              </div>

              <div className="space-y-0 flex flex-row items-center gap-2">
                <Checkbox
                  className="h-4 w-4 rounded-sm"
                  checked={waistDestroyedGenitals}
                  onCheckedChange={(checked) =>
                    handleUpdate(
                      'waist_destroyed_genitals',
                      !!checked,
                      setWaistDestroyedGenitals,
                      waistDestroyedGenitals
                    )
                  }
                  name="waist-destroyed-genitals"
                  id="waist-destroyed-genitals"
                />
                <Label className="text-xs">Destroyed Genitals</Label>
              </div>

              <div className="space-y-0 flex flex-row items-center gap-2">
                <div className="flex flex-row gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Checkbox
                      key={value}
                      className="h-4 w-4 rounded-sm"
                      checked={waistWarpedPelvis >= value}
                      onCheckedChange={(checked) => {
                        const newValue = checked ? value : value - 1
                        const safeValue = Math.max(0, Math.min(5, newValue))

                        handleUpdate(
                          'waist_warped_pelvis',
                          safeValue,
                          setWaistWarpedPelvis,
                          waistWarpedPelvis
                        )
                      }}
                      name={`waist-warped-pelvis-${value}`}
                      id={`waist-warped-pelvis-${value}`}
                    />
                  ))}
                </div>
                <Label className="text-xs">W. Pelvis</Label>
              </div>
            </div>

            {/* Light and Heavy Damage */}
            <div className="flex flex-row gap-2 ml-auto">
              {/* Light Damage */}
              <div className="flex flex-col items-center">
                <Checkbox
                  className={cn(
                    'h-4 w-4 rounded-sm',
                    !waistLightDamage && 'border-2 border-primary',
                    !waistLightDamage && 'border-2 border-primary'
                  )}
                  checked={waistLightDamage}
                  onCheckedChange={(checked) =>
                    handleUpdate(
                      'waist_light_damage',
                      !!checked,
                      setWaistLightDamage,
                      waistLightDamage
                    )
                  }
                  name="waist-light-damage"
                  id="waist-light-damage"
                />
                <Label className="text-xs mt-1">L</Label>
              </div>

              {/* Heavy Damage */}
              <div className="flex flex-col items-center">
                <Checkbox
                  className={cn(
                    'h-4 w-4 rounded-sm',
                    !waistHeavyDamage && 'border-2 border-primary',
                    !waistHeavyDamage && 'border-4 border-primary'
                  )}
                  checked={waistHeavyDamage}
                  onCheckedChange={(checked) =>
                    handleUpdate(
                      'waist_heavy_damage',
                      !!checked,
                      setWaistHeavyDamage,
                      waistHeavyDamage
                    )
                  }
                  name="waist-heavy-damage"
                  id="waist-heavy-damage"
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
