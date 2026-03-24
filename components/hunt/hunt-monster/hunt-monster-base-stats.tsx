'use client'

import { NumericInput } from '@/components/menu/numeric-input'
import {
  MONSTER_AI_DECK_UPDATED_MESSAGE,
  MONSTER_TOUGHNESS_UPDATED_MESSAGE,
  MONSTER_WOUND_DECK_UPDATED_MESSAGE
} from '@/lib/messages'
import { HuntMonsterDetail } from '@/lib/types'
import { ReactElement } from 'react'

/**
 * Hunt Monster Base Stats Component Properties
 */
interface HuntMonsterBaseStatsProps {
  /** Hunt Monster */
  monster: HuntMonsterDetail
  /** Save Monster Data */
  saveMonsterData: (
    updateData: Partial<HuntMonsterDetail>,
    successMsg?: string
  ) => void
}

/**
 * Hunt Monster Base Stats Component
 *
 * Displays the base stats (AI Deck, Wounds, Toughness) for a hunt monster.
 *
 * @param props Base Hunt Monster Stats Properties
 * @returns Base Hunt Monster Stats Component
 */
export function HuntMonsterBaseStats({
  monster,
  saveMonsterData
}: HuntMonsterBaseStatsProps): ReactElement {
  return (
    <div className="grid grid-cols-3">
      {/* AI Deck */}
      <div className="bg-background/40 rounded-lg p-2 text-center">
        <div className="text-xs text-muted-foreground pb-1">AI Deck</div>

        <NumericInput
          label="AI Deck Size"
          value={monster.ai_deck_remaining}
          onChange={(value) =>
            saveMonsterData(
              { ai_deck_remaining: value },
              MONSTER_AI_DECK_UPDATED_MESSAGE(monster.ai_deck_remaining, value)
            )
          }
          min={0}
          className="border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      {/* Wounds */}
      <div className="bg-background/40 rounded-lg p-2 text-center">
        <div className="text-xs text-muted-foreground pb-1 flex items-center justify-center gap-1">
          Wounds
        </div>

        <NumericInput
          label="Wounds"
          value={monster.wounds}
          onChange={(value) =>
            saveMonsterData(
              { wounds: value },
              MONSTER_WOUND_DECK_UPDATED_MESSAGE(monster.wounds, value)
            )
          }
          min={0}
          className="border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      {/* Toughness */}
      <div className="bg-background/40 rounded-lg p-2 text-center">
        <div className="text-xs text-muted-foreground pb-1 flex items-center justify-center gap-1">
          Toughness
        </div>

        <NumericInput
          label="Toughness"
          value={monster.toughness}
          onChange={(value) =>
            saveMonsterData(
              { toughness: value },
              MONSTER_TOUGHNESS_UPDATED_MESSAGE(monster.toughness, value)
            )
          }
          min={0}
          className="border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
    </div>
  )
}
