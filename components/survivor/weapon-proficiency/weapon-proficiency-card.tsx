'use client'

import { CustomWeaponTypeRulesIconButton } from '@/components/custom/custom-rules-sheet'
import { SafeMarkdownPreview } from '@/components/generic/safe-markdown-editor'
import { SelectWeaponType } from '@/components/menu/select-weapon-type'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { updateSurvivor } from '@/lib/dal/survivor'
import { ERROR_MESSAGE } from '@/lib/messages'
import {
  SurvivorDetail,
  SurvivorsStateSetter,
  WeaponTypeDetail
} from '@/lib/types'
import { cn } from '@/lib/utils'
import { ReactElement, useCallback, useState } from 'react'
import { toast } from 'sonner'

const SPECIALIST_PROFICIENCY_RANK = 3
const MASTER_PROFICIENCY_RANK = 8

const RULES_MARKDOWN_CLASS = cn(
  'bg-transparent !text-xs !leading-relaxed',
  '[&_p]:!text-xs [&_p]:!leading-relaxed [&_p]:!my-1',
  '[&_p:first-child]:!mt-0 [&_p:last-child]:!mb-0',
  '[&_strong]:!font-semibold [&_strong]:!text-foreground',
  '[&_ul]:!my-1 [&_ul]:!pl-4 [&_ul]:!list-disc',
  '[&_ol]:!my-1 [&_ol]:!pl-4 [&_ol]:!list-decimal',
  '[&_li]:!text-xs [&_li]:!leading-relaxed [&_li]:!my-0.5'
)

type SelectedWeaponType = Pick<
  WeaponTypeDetail,
  | 'id'
  | 'custom'
  | 'weapon_type_name'
  | 'specialist_proficiency_rules'
  | 'master_proficiency_rules'
> &
  Partial<
    Pick<
      NonNullable<SurvivorDetail['weapon_type']>,
      'author_user_id' | 'author_username' | 'author_avatar_url'
    >
  >

interface VisibleWeaponProficiencyRule {
  /** Rule Label */
  label: 'Specialist' | 'Master'
  /** Source Label */
  source: string
  /** Rule Markdown */
  rules: string
}

interface VisibleWeaponProficiencyRuleInput {
  /** Selected Survivor ID */
  selectedSurvivorId: string | null | undefined
  /** Settlement Survivors */
  survivors: SurvivorDetail[]
  /** Weapon Proficiency Rank */
  weaponProficiency: number
  /** Selected Weapon Type ID */
  weaponTypeId: string | null
  /** Selected Weapon Type */
  weaponType: SelectedWeaponType | null
}

function hasRules(rules: string | null | undefined): rules is string {
  return !!rules?.trim()
}

/**
 * Get Visible Weapon Proficiency Rules
 *
 * Determines which proficiency rules apply to the selected survivor. Specialist
 * rules are visible at rank III or when another settlement survivor has mastery
 * of the same weapon. Master rules are visible only at rank VIII.
 *
 * @param input Weapon proficiency state
 * @returns Visible proficiency rule blocks
 */
export function getVisibleWeaponProficiencyRules({
  selectedSurvivorId,
  survivors,
  weaponProficiency,
  weaponTypeId,
  weaponType
}: VisibleWeaponProficiencyRuleInput): VisibleWeaponProficiencyRule[] {
  if (!weaponTypeId || !weaponType || weaponType.id !== weaponTypeId) return []

  const rules: VisibleWeaponProficiencyRule[] = []
  const hasOwnSpecialist = weaponProficiency >= SPECIALIST_PROFICIENCY_RANK
  const hasOwnMastery = weaponProficiency >= MASTER_PROFICIENCY_RANK
  const hasSettlementMastery = survivors.some(
    (survivor) =>
      survivor.id !== selectedSurvivorId &&
      survivor.weapon_type_id === weaponTypeId &&
      survivor.weapon_proficiency >= MASTER_PROFICIENCY_RANK
  )

  if (
    hasRules(weaponType.specialist_proficiency_rules) &&
    (hasOwnSpecialist || hasSettlementMastery)
  ) {
    rules.push({
      label: 'Specialist',
      source: hasOwnSpecialist ? 'Rank III' : 'Settlement mastery',
      rules: weaponType.specialist_proficiency_rules
    })
  }

  if (hasRules(weaponType.master_proficiency_rules) && hasOwnMastery) {
    rules.push({
      label: 'Master',
      source: 'Rank VIII',
      rules: weaponType.master_proficiency_rules
    })
  }

  return rules
}

function WeaponProficiencyRulesBlock({
  rule
}: {
  rule: VisibleWeaponProficiencyRule
}): ReactElement {
  return (
    <section className="flex flex-col gap-1.5 rounded-md border border-border/60 bg-muted/30 px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground">
          {rule.label}
        </h4>
        <Badge variant="secondary" className="text-[10px] font-normal">
          {rule.source}
        </Badge>
      </div>
      <SafeMarkdownPreview
        source={rule.rules}
        className={RULES_MARKDOWN_CLASS}
        style={{ backgroundColor: 'transparent' }}
      />
    </section>
  )
}

/**
 * Weapon Proficiency Card Properties
 */
interface WeaponProficiencyCardProps {
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Survivors */
  setSurvivors: SurvivorsStateSetter
  /** Settlement Survivors */
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
  const [prevSurvivor, setPrevSurvivor] = useState(selectedSurvivor)

  const [weaponProficiency, setWeaponProficiency] = useState<number>(
    selectedSurvivor?.weapon_proficiency ?? 0
  )
  const [weaponTypeId, setWeaponTypeId] = useState<string | null>(
    selectedSurvivor?.weapon_type_id ?? null
  )
  const [weaponType, setWeaponType] = useState<SelectedWeaponType | null>(
    selectedSurvivor?.weapon_type ?? null
  )

  if (prevSurvivor !== selectedSurvivor) {
    setPrevSurvivor(selectedSurvivor)
    setWeaponProficiency(selectedSurvivor?.weapon_proficiency ?? 0)
    setWeaponTypeId(selectedSurvivor?.weapon_type_id ?? null)
    setWeaponType(selectedSurvivor?.weapon_type ?? null)
  }

  const visibleRules = getVisibleWeaponProficiencyRules({
    selectedSurvivorId: selectedSurvivor?.id,
    survivors,
    weaponProficiency,
    weaponTypeId,
    weaponType
  })

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
      setSurvivors((prev) =>
        prev.map((s) =>
          s.id === selectedSurvivor?.id
            ? { ...s, weapon_proficiency: updatedProficiency }
            : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, {
        weapon_proficiency: updatedProficiency
      }).catch((error) => {
        setWeaponProficiency(oldProficiency)
        setSurvivors((prev) =>
          prev.map((s) =>
            s.id === selectedSurvivor?.id
              ? { ...s, weapon_proficiency: oldProficiency }
              : s
          )
        )

        console.error('Weapon Proficiency Update Error:', error)
        toast.error(ERROR_MESSAGE())
      })
    },
    [weaponProficiency, selectedSurvivor?.id, setSurvivors]
  )

  /**
   * Handle Weapon Type Selection Change
   *
   * @param type Selected weapon type
   */
  const handleWeaponTypeChange = useCallback(
    (type: string, selectedWeaponType?: WeaponTypeDetail | null) => {
      const oldWeaponTypeId = weaponTypeId
      const oldProficiency = weaponProficiency
      const oldWeaponType = weaponType

      setWeaponTypeId(type || null)
      setWeaponType(selectedWeaponType ?? null)
      setWeaponProficiency(0)

      setSurvivors((prev) =>
        prev.map((s) =>
          s.id === selectedSurvivor?.id
            ? {
                ...s,
                weapon_type_id: (type ||
                  null) as SurvivorDetail['weapon_type_id'],
                weapon_proficiency: 0
              }
            : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, {
        weapon_type_id: type || null,
        weapon_proficiency: 0
      }).catch((error) => {
        setWeaponTypeId(oldWeaponTypeId)
        setWeaponType(oldWeaponType)
        setWeaponProficiency(oldProficiency)
        setSurvivors((prev) =>
          prev.map((s) =>
            s.id === selectedSurvivor?.id
              ? {
                  ...s,
                  weapon_type_id: oldWeaponTypeId,
                  weapon_proficiency: oldProficiency
                }
              : s
          )
        )

        console.error('Weapon Type Update Error:', error)
        toast.error(ERROR_MESSAGE())
      })
    },
    [
      weaponProficiency,
      weaponType,
      weaponTypeId,
      selectedSurvivor?.id,
      setSurvivors
    ]
  )

  return (
    <Card className="p-2 border-0">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row justify-between gap-2">
          <div className="flex flex-col gap-2">
            <CardTitle className="text-sm flex flex-row items-center gap-1">
              Weapon Proficiency
            </CardTitle>
            <div className="flex flex-row items-center gap-1">
              <SelectWeaponType
                value={weaponTypeId}
                onChange={handleWeaponTypeChange}
              />
              <CustomWeaponTypeRulesIconButton weaponTypeId={weaponTypeId} />
            </div>
          </div>
          <div className="flex flex-col justify-between items-center lg:items-end gap-2">
            <div className="flex flex-row gap-2">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="w-4 h-4 flex">
                  <Checkbox
                    disabled={!weaponTypeId}
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

            <hr className="hidden lg:block w-full" />

            <div className="flex flex-row justify-between gap-2">
              {Array.from({ length: 2 }, (_, i) => (
                <div key={i} className="flex items-center gap-1">
                  {Array.from({ length: i + 1 }, (_, j) => (
                    <Checkbox
                      key={j}
                      disabled
                      className="bg-white! border border-gray-300 h-3 w-3"
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

        {visibleRules.length > 0 && (
          <div className="mt-3 grid gap-2">
            {visibleRules.map((rule) => (
              <WeaponProficiencyRulesBlock
                key={`${rule.label}-${rule.source}`}
                rule={rule}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
