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
 * Survivor Calculated Stats Properties
 */
interface SurvivorCalculatedStatsProps {
  /** Selected Showdown */
  selectedShowdown: ShowdownDetail | null
  /** Selected Showdown Monster Index */
  selectedShowdownMonsterIndex: number
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
}

/**
 * Survivor Calculated Stats Component
 *
 * Displays calculated combat statistics for a survivor during a showdown.
 *
 * @param props Survivor Calculated Stats Properties
 * @returns Survivor Calculated Stats Component
 */
export function SurvivorCalculatedStats({
  selectedShowdown,
  selectedShowdownMonsterIndex,
  selectedSurvivor
}: SurvivorCalculatedStatsProps): ReactElement {
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
        label="Accuracy"
        baseValue={selectedSurvivor?.accuracy ?? 0}
        tokens={survivorRecord?.accuracy_tokens ?? 0}
        modifierLabel="Monster Evasion"
        modifierValue={monster?.evasion ?? 0}
        modifierTokens={monster?.evasion_tokens ?? 0}
        tooltip="(Survivor Accuracy + Tokens) - (Monster Evasion + Tokens)"
      />
      <Separator />
      <CalculatedStatRow
        label="Strength"
        baseValue={selectedSurvivor?.strength ?? 0}
        tokens={survivorRecord?.strength_tokens ?? 0}
        tooltip="(Survivor Strength + Tokens)"
      />
      <Separator />
      <CalculatedStatRow
        label="Evasion"
        baseValue={selectedSurvivor?.evasion ?? 0}
        tokens={survivorRecord?.evasion_tokens ?? 0}
        modifierLabel="Monster Accuracy"
        modifierValue={monster?.accuracy ?? 0}
        modifierTokens={monster?.accuracy_tokens ?? 0}
        tooltip="(Survivor Evasion + Tokens) - (Monster Accuracy + Tokens)"
      />
      <Separator />
      <CalculatedStatRow
        label="Luck"
        baseValue={selectedSurvivor?.luck ?? 0}
        tokens={survivorRecord?.luck_tokens ?? 0}
        modifierLabel="Monster Luck"
        modifierValue={monster?.luck ?? 0}
        modifierTokens={monster?.luck_tokens ?? 0}
        tooltip="(Survivor Luck + Tokens) - (Monster Luck + Tokens)"
      />
      <Separator />
      <CalculatedStatRow
        label="Speed"
        baseValue={selectedSurvivor?.speed ?? 0}
        tokens={survivorRecord?.speed_tokens ?? 0}
        tooltip="(Survivor Speed + Tokens)"
      />
    </>
  )
}
