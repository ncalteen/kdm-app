'use client'

import { NumericInput } from '@/components/menu/numeric-input'
import {
  MONSTER_AI_DECK_UPDATED_MESSAGE,
  MONSTER_TOUGHNESS_UPDATED_MESSAGE,
  MONSTER_WOUND_DECK_UPDATED_MESSAGE
} from '@/lib/messages'
import { ShowdownMonsterDetail } from '@/lib/types'
import { ReactElement } from 'react'

/**
 * Showdown Monster Base Stats Component Properties
 */
interface ShowdownMonsterBaseStatsProps {
  /** Showdown Monster */
  monster: ShowdownMonsterDetail
  /** Save Monster Data */
  saveMonsterData: (
    updateData: Partial<ShowdownMonsterDetail>,
    successMsg?: string
  ) => void
}

/**
 * Showdown Monster Base Stats Component
 *
 * Displays the base stats (AI Deck, Wounds, Toughness) for a showdown monster.
 *
 * @param props Base Showdown Monster Stats Properties
 * @returns Base Showdown Monster Stats Component
 */
export function ShowdownMonsterBaseStats({
  monster,
  saveMonsterData
}: ShowdownMonsterBaseStatsProps): ReactElement {
  return (
    <div className="grid grid-cols-3">
      <div className="bg-background/40 rounded-lg p-2 text-center">
        <div className="text-xs text-muted-foreground pb-1">AI Deck</div>
        <NumericInput
          label="AI Deck Remaining"
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
      <div className="bg-background/40 rounded-lg p-2 text-center">
        <div className="text-xs text-muted-foreground pb-1">Wounds</div>
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
      <div className="bg-background/40 rounded-lg p-2 text-center">
        <div className="text-xs text-muted-foreground pb-1">Toughness</div>
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
