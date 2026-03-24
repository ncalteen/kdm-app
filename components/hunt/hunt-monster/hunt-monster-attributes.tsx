'use client'

import { NumericInput } from '@/components/menu/numeric-input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  MONSTER_ACCURACY_TOKENS_UPDATED_MESSAGE,
  MONSTER_DAMAGE_TOKENS_UPDATED_MESSAGE,
  MONSTER_EVASION_TOKENS_UPDATED_MESSAGE,
  MONSTER_LUCK_TOKENS_UPDATED_MESSAGE,
  MONSTER_MOVEMENT_TOKENS_UPDATED_MESSAGE,
  MONSTER_MOVEMENT_UPDATED_MESSAGE,
  MONSTER_SPEED_TOKENS_UPDATED_MESSAGE,
  MONSTER_SPEED_UPDATED_MESSAGE,
  MONSTER_STRENGTH_TOKENS_UPDATED_MESSAGE
} from '@/lib/messages'
import { HuntMonsterDetail } from '@/lib/types'
import { ReactElement } from 'react'

/**
 * Hunt Monster Attributes Component Properties
 */
interface HuntMonsterAttributesProps {
  /** Hunt Monster */
  monster: HuntMonsterDetail
  /** Save Monster Data */
  saveMonsterData: (
    updateData: Partial<HuntMonsterDetail>,
    successMsg?: string
  ) => void
}

/**
 * Hunt Monster Attributes Component
 *
 * Displays the monster attributes grid with base values, tokens, and totals
 * for Movement, Accuracy, Strength, Evasion, Luck, and Speed.
 *
 * @param props Hunt Monster Attributes Properties
 * @returns Hunt Monster Attributes Component
 */
export function HuntMonsterAttributes({
  monster,
  saveMonsterData
}: HuntMonsterAttributesProps): ReactElement {
  return (
    <div className="p-2">
      <div className="flex flex-col gap-1">
        {/* Header */}
        <div className="flex flex-row items-center gap-2">
          <div className="w-20"></div>
          <Label className="text-xs w-24 justify-center">Base</Label>
          <Label className="text-xs w-24 justify-center">Tokens</Label>
          <Label className="text-xs w-24 justify-center">Total</Label>
        </div>

        {/* Damage */}
        <div className="flex flex-row items-center gap-2">
          <Label className="text-xs w-20">Damage</Label>
          <NumericInput
            label="Damage"
            value={monster.damage}
            className="w-24 h-12 text-xl"
            disabled={true}
          />
          <NumericInput
            label="Damage Tokens"
            value={monster.damage_tokens}
            onChange={(value) =>
              saveMonsterData(
                { damage_tokens: value },
                MONSTER_DAMAGE_TOKENS_UPDATED_MESSAGE(
                  monster.damage_tokens,
                  value
                )
              )
            }
            className="w-24 h-12 text-xl bg-muted!"
          />
          <NumericInput
            label="Damage Total"
            value={monster.damage + monster.damage_tokens}
            className="w-24 h-12 text-xl"
            disabled={true}
          />
        </div>

        <Separator className="my-1" />

        {/* Movement */}
        <div className="flex flex-row items-center gap-2">
          <Label className="text-xs w-20">Movement</Label>
          <NumericInput
            label="Movement"
            value={monster.movement ?? 1}
            onChange={(value) =>
              saveMonsterData(
                { movement: value },
                MONSTER_MOVEMENT_UPDATED_MESSAGE(monster.movement, value)
              )
            }
            min={1}
            className="w-24 h-12 text-xl"
          />
          <NumericInput
            label="Movement Tokens"
            value={monster.movement_tokens}
            onChange={(value) =>
              saveMonsterData(
                { movement_tokens: value },
                MONSTER_MOVEMENT_TOKENS_UPDATED_MESSAGE(
                  monster.movement_tokens,
                  value
                )
              )
            }
            className="w-24 h-12 text-xl bg-muted!"
          />
          <NumericInput
            label="Movement Total"
            value={monster.movement + monster.movement_tokens}
            className="w-24 h-12 text-xl"
            disabled={true}
          />
        </div>

        {/* Accuracy */}
        <div className="flex flex-row items-center gap-2">
          <Label className="text-xs w-20">Accuracy</Label>
          <NumericInput
            label="Accuracy"
            value={monster.accuracy}
            className="w-24 h-12 text-xl"
            disabled={true}
          />
          <NumericInput
            label="Accuracy Tokens"
            value={monster.accuracy_tokens}
            onChange={(value) =>
              saveMonsterData(
                { accuracy_tokens: value },
                MONSTER_ACCURACY_TOKENS_UPDATED_MESSAGE(
                  monster.accuracy_tokens,
                  value
                )
              )
            }
            className="w-24 h-12 text-xl bg-muted!"
          />
          <NumericInput
            label="Accuracy Total"
            value={monster.accuracy + monster.accuracy_tokens}
            className="w-24 h-12 text-xl"
            disabled={true}
          />
        </div>

        {/* Strength */}
        <div className="flex flex-row items-center gap-2">
          <Label className="text-xs w-20">Strength</Label>
          <NumericInput
            label="Strength"
            value={monster.strength}
            className="w-24 h-12 text-xl"
            disabled={true}
          />
          <NumericInput
            label="Strength Tokens"
            value={monster.strength_tokens}
            onChange={(value) =>
              saveMonsterData(
                { strength_tokens: value },
                MONSTER_STRENGTH_TOKENS_UPDATED_MESSAGE(
                  monster.strength_tokens,
                  value
                )
              )
            }
            className="w-24 h-12 text-xl bg-muted!"
          />
          <NumericInput
            label="Strength Total"
            value={monster.strength + monster.strength_tokens}
            className="w-24 h-12 text-xl"
            disabled={true}
          />
        </div>

        {/* Evasion */}
        <div className="flex flex-row items-center gap-2">
          <Label className="text-xs w-20">Evasion</Label>
          <NumericInput
            label="Evasion"
            value={monster.evasion}
            className="w-24 h-12 text-xl"
            disabled={true}
          />
          <NumericInput
            label="Evasion Tokens"
            value={monster.evasion_tokens}
            onChange={(value) =>
              saveMonsterData(
                { evasion_tokens: value },
                MONSTER_EVASION_TOKENS_UPDATED_MESSAGE(
                  monster.evasion_tokens,
                  value
                )
              )
            }
            className="w-24 h-12 text-xl bg-muted!"
          />
          <NumericInput
            label="Evasion Total"
            value={monster.evasion + monster.evasion_tokens}
            className="w-24 h-12 text-xl"
            disabled={true}
          />
        </div>

        {/* Luck */}
        <div className="flex flex-row items-center gap-2">
          <Label className="text-xs w-20">Luck</Label>
          <NumericInput
            label="Luck"
            value={monster.luck}
            className="w-24 h-12 text-xl"
            disabled={true}
          />
          <NumericInput
            label="Luck Tokens"
            value={monster.luck_tokens}
            onChange={(value) =>
              saveMonsterData(
                { luck_tokens: value },
                MONSTER_LUCK_TOKENS_UPDATED_MESSAGE(monster.luck_tokens, value)
              )
            }
            className="w-24 h-12 text-xl bg-muted!"
          />
          <NumericInput
            label="Luck Total"
            value={monster.luck + monster.luck_tokens}
            className="w-24 h-12 text-xl"
            disabled={true}
          />
        </div>

        {/* Speed */}
        <div className="flex flex-row items-center gap-2">
          <Label className="text-xs w-20">Speed</Label>
          <NumericInput
            label="Speed"
            value={monster.speed}
            onChange={(value) =>
              saveMonsterData(
                { speed: value },
                MONSTER_SPEED_UPDATED_MESSAGE(monster.speed, value)
              )
            }
            min={1}
            className="w-24 h-12 text-xl"
          />
          <NumericInput
            label="Speed Tokens"
            value={monster.speed_tokens}
            onChange={(value) =>
              saveMonsterData(
                { speed_tokens: value },
                MONSTER_SPEED_TOKENS_UPDATED_MESSAGE(
                  monster.speed_tokens,
                  value
                )
              )
            }
            className="w-24 h-12 text-xl bg-muted!"
          />
          <NumericInput
            label="Speed Total"
            value={monster.speed + monster.speed_tokens}
            className="w-24 h-12 text-xl"
            disabled={true}
          />
        </div>
      </div>
    </div>
  )
}
