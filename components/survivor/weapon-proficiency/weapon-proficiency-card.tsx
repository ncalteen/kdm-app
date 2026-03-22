'use client'

import { SelectWeaponType } from '@/components/menu/select-weapon-type'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { updateSurvivor } from '@/lib/dal/survivor'
import {
  ERROR_MESSAGE,
  SURVIVOR_WEAPON_PROFICIENCY_MASTER_ACHIEVED_MESSAGE,
  SURVIVOR_WEAPON_PROFICIENCY_SPECIALIST_ACHIEVED_MESSAGE,
  SURVIVOR_WEAPON_PROFICIENCY_UPDATED_MESSAGE,
  SURVIVOR_WEAPON_TYPE_UPDATED_MESSAGE
} from '@/lib/messages'
import { SurvivorDetail } from '@/lib/types'
import { ReactElement, useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

/**
 * Weapon Proficiency Card Properties
 */
interface WeaponProficiencyCardProps {
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Weapon Proficiency Card Component
 *
 * This component displays the weapon proficiency options for a survivor. It
 * includes a dropdown to select the weapon type and checkboxes to set the
 * proficiency level. The proficiency level can be set from 0 to 8, with
 * special notes for levels 3 and 8.
 *
 * @param form Form
 * @returns Weapon Proficiency Card Component
 */
export function WeaponProficiencyCard({
  selectedSurvivor,
  setSurvivors,
  survivors
}: WeaponProficiencyCardProps): ReactElement {
  const survivorIdRef = useRef<string | undefined>(undefined)

  const [weaponProficiency, setWeaponProficiency] = useState<number>(
    selectedSurvivor?.weapon_proficiency ?? 0
  )
  const [weaponTypeId, setWeaponTypeId] = useState<string | null>(
    selectedSurvivor?.weapon_type_id ?? null
  )

  if (survivorIdRef.current !== selectedSurvivor?.id) {
    survivorIdRef.current = selectedSurvivor?.id ?? undefined
    setWeaponProficiency(selectedSurvivor?.weapon_proficiency ?? 0)
    setWeaponTypeId(selectedSurvivor?.weapon_type_id ?? null)
  }

  /**
   * Handle Weapon Proficiency Level Checkbox Change
   *
   * @param index Checkbox index (0-7)
   * @param checked Whether the checkbox is checked
   */
  const handleProficiencyChange = useCallback(
    (index: number, checked: boolean) => {
      const updatedProficiency = checked ? index + 1 : index
      const currentProficiency = weaponProficiency

      if (updatedProficiency === currentProficiency) return

      const oldProficiency = weaponProficiency
      setWeaponProficiency(updatedProficiency)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id
            ? { ...s, weapon_proficiency: updatedProficiency }
            : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, {
        weapon_proficiency: updatedProficiency
      })
        .then(() => {
          if (updatedProficiency === 3)
            toast.success(
              SURVIVOR_WEAPON_PROFICIENCY_SPECIALIST_ACHIEVED_MESSAGE()
            )
          else if (updatedProficiency === 8)
            toast.success(SURVIVOR_WEAPON_PROFICIENCY_MASTER_ACHIEVED_MESSAGE())
          else toast.success(SURVIVOR_WEAPON_PROFICIENCY_UPDATED_MESSAGE())
        })
        .catch((error) => {
          setWeaponProficiency(oldProficiency)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id
                ? { ...s, weapon_proficiency: oldProficiency }
                : s
            )
          )

          console.error('Weapon Proficiency Update Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [weaponProficiency, selectedSurvivor?.id, setSurvivors, survivors]
  )

  /**
   * Handle Weapon Type Selection Change
   *
   * @param type Selected weapon type
   */
  const handleWeaponTypeChange = useCallback(
    (type: string) => {
      const oldWeaponTypeId = weaponTypeId

      setWeaponTypeId(type || null)

      updateSurvivor(selectedSurvivor?.id, {
        weapon_type_id: type as unknown as SurvivorDetail['weapon_type_id']
      })
        .then(() => toast.success(SURVIVOR_WEAPON_TYPE_UPDATED_MESSAGE()))
        .catch((error) => {
          setWeaponTypeId(oldWeaponTypeId)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id
                ? { ...s, weapon_type_id: oldWeaponTypeId }
                : s
            )
          )

          console.error('Weapon Type Update Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [weaponTypeId, selectedSurvivor?.id, setSurvivors, survivors]
  )

  return (
    <Card className="p-2 border-0">
      <CardContent className="p-0">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col justify-between gap-2">
            <CardTitle className="text-sm flex flex-row items-center gap-1">
              Weapon Proficiency
            </CardTitle>
            <SelectWeaponType
              value={weaponTypeId}
              onChange={handleWeaponTypeChange}
            />
          </div>
          <div className="flex flex-col justify-between">
            <div className="flex flex-row gap-2">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="w-4 h-4 flex">
                  <Checkbox
                    checked={weaponProficiency > i}
                    onCheckedChange={(checked) =>
                      handleProficiencyChange(i, !!checked)
                    }
                    className={
                      'h-4 w-4 rounded-sm' +
                      (i === 2 || i === 7 ? ' border-2 border-primary' : '')
                    }
                  />
                </div>
              ))}
            </div>

            <hr />

            <div className="flex flex-row justify-between gap-2">
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
                    <span className="text-xs text-muted-foreground">
                      Specialist
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Master
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
