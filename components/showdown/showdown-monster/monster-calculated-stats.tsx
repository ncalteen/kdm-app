'use client'

import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  ShowdownDetail,
  ShowdownMonsterDetail,
  ShowdownSurvivorDetail,
  SurvivorDetail
} from '@/lib/types'
import { ReactElement, useMemo } from 'react'

/**
 * Calculated Stat Row Properties
 */
interface CalculatedStatRowProps {
  /** Stat Label */
  label: string
  /** Base Value */
  baseValue: number
  /** Token Value */
  tokens: number
  /** Tooltip Description */
  tooltip: string
  /** Modifier Label */
  modifierLabel?: string
  /** Modifier Base Value */
  modifierValue?: number
  /** Modifier Token Value */
  modifierTokens?: number
}

/**
 * Calculated Stat Row Component
 *
 * Displays a single row of calculated stats including base value, tokens,
 * modifiers, and final value.
 *
 * @param props Calculated Stat Row Properties
 * @returns Calculated Stat Row Component
 */
function CalculatedStatRow({
  label,
  baseValue,
  tokens,
  tooltip,
  modifierLabel,
  modifierValue,
  modifierTokens
}: CalculatedStatRowProps): ReactElement {
  const finalValue =
    baseValue +
    tokens -
    (modifierValue !== undefined && modifierTokens !== undefined
      ? modifierValue + modifierTokens
      : 0)

  return (
    <div className="flex items-center justify-between">
      <Tooltip>
        <TooltipTrigger className="text-sm">{label}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">
          ({baseValue}
          {tokens >= 0 ? ' + ' : ' - '}
          {Math.abs(tokens)})
        </span>
        {modifierLabel && (
          <>
            <span className="text-muted-foreground">-</span>
            <span className="text-muted-foreground">
              ({modifierValue}
              {modifierTokens! > 0 ? ' + ' : ' - '}
              {Math.abs(modifierTokens!)})
            </span>
          </>
        )}
        <span className="font-bold min-w-[2ch] text-right">=</span>
        <span
          className={`font-bold min-w-[3ch] text-right ${
            finalValue > 0
              ? 'text-green-500'
              : finalValue < 0
                ? 'text-red-500'
                : ''
          }`}>
          {finalValue < 0 ? ' - ' : ' + '}
          {Math.abs(finalValue)}
        </span>
      </div>
    </div>
  )
}

/**
 * Monster Calculated Stats Properties
 */
interface MonsterCalculatedStatsProps {
  /** Selected Showdown */
  selectedShowdown: ShowdownDetail | null
  /** Selected Showdown Monster Index */
  selectedShowdownMonsterIndex: number
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
}

/**
 * Monster Calculated Stats Component
 *
 * Displays calculated combat statistics for the monster during a showdown.
 *
 * @param props Monster Calculated Stats Properties
 * @returns Monster Calculated Stats Component
 */
export function MonsterCalculatedStats({
  selectedShowdown,
  selectedShowdownMonsterIndex,
  selectedSurvivor
}: MonsterCalculatedStatsProps): ReactElement {
  const monsterIds = useMemo(
    () => Object.keys(selectedShowdown?.showdown_monsters ?? {}),
    [selectedShowdown]
  )
  const monsterId = monsterIds[selectedShowdownMonsterIndex]
  const monster: ShowdownMonsterDetail | undefined = monsterId
    ? selectedShowdown?.showdown_monsters?.[monsterId]
    : undefined

  const survivorRecord: ShowdownSurvivorDetail | undefined = useMemo(() => {
    if (!selectedShowdown?.showdown_survivors || !selectedSurvivor?.id)
      return undefined
    return Object.values(selectedShowdown.showdown_survivors).find(
      (ss) => ss.survivor_id === selectedSurvivor.id
    )
  }, [selectedShowdown, selectedSurvivor])

  return (
    <>
      <CalculatedStatRow
        label="Damage"
        baseValue={monster?.damage ?? 0}
        tokens={monster?.damage_tokens ?? 0}
        tooltip="(Monster Damage + Tokens)"
      />
      <Separator />
      <CalculatedStatRow
        label="Movement"
        baseValue={monster?.movement ?? 0}
        tokens={monster?.movement_tokens ?? 0}
        tooltip="(Monster Movement + Tokens)"
      />
      <Separator />
      <CalculatedStatRow
        label="Accuracy"
        baseValue={monster?.accuracy ?? 0}
        tokens={monster?.accuracy_tokens ?? 0}
        modifierLabel="Survivor Evasion"
        modifierValue={selectedSurvivor?.evasion ?? 0}
        modifierTokens={survivorRecord?.evasion_tokens ?? 0}
        tooltip="(Monster Accuracy + Tokens) - (Survivor Evasion + Tokens)"
      />
      <Separator />
      <CalculatedStatRow
        label="Strength"
        baseValue={monster?.strength ?? 0}
        tokens={monster?.strength_tokens ?? 0}
        tooltip="(Monster Strength + Tokens)"
      />
      <Separator />
      <CalculatedStatRow
        label="Evasion"
        baseValue={monster?.evasion ?? 0}
        tokens={monster?.evasion_tokens ?? 0}
        modifierLabel="Survivor Accuracy"
        modifierValue={selectedSurvivor?.accuracy ?? 0}
        modifierTokens={survivorRecord?.accuracy_tokens ?? 0}
        tooltip="(Monster Evasion + Tokens) - (Survivor Accuracy + Tokens)"
      />
      <Separator />
      <CalculatedStatRow
        label="Luck"
        baseValue={monster?.luck ?? 0}
        tokens={monster?.luck_tokens ?? 0}
        modifierLabel="Survivor Luck"
        modifierValue={selectedSurvivor?.luck ?? 0}
        modifierTokens={survivorRecord?.luck_tokens ?? 0}
        tooltip="(Monster Luck + Tokens) - (Survivor Luck + Tokens)"
      />
      <Separator />
      <CalculatedStatRow
        label="Speed"
        baseValue={monster?.speed ?? 0}
        tokens={monster?.speed_tokens ?? 0}
        tooltip="(Monster Speed + Tokens)"
      />
    </>
  )
}
