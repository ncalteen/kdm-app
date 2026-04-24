'use client'

import {
  MonsterForm,
  MonsterFormPayload
} from '@/components/monster/monster-form'
import { LocalStateType } from '@/contexts/local-context'
import { useToast } from '@/hooks/use-toast'
import {
  syncMonsterMoods,
  syncMonsterSurvivorStatuses,
  syncMonsterTraits
} from '@/lib/dal/monster-trait-mood'
import { addNemesis } from '@/lib/dal/nemesis'
import { addNemesisLevel } from '@/lib/dal/nemesis-level'
import { addNemesisLocation } from '@/lib/dal/nemesis-location'
import { addNemesisTimelineYear } from '@/lib/dal/nemesis-timeline-year'
import { addQuarry } from '@/lib/dal/quarry'
import { addQuarryCollectiveCognitionReward } from '@/lib/dal/quarry-collective-cognition-reward'
import { addQuarryHuntBoard } from '@/lib/dal/quarry-hunt-board'
import { upsertQuarryHuntBoardPosition } from '@/lib/dal/quarry-hunt-board-position'
import { addQuarryLevel } from '@/lib/dal/quarry-level'
import { addQuarryLocation } from '@/lib/dal/quarry-location'
import { addQuarryTimelineYear } from '@/lib/dal/quarry-timeline-year'
import { MonsterType } from '@/lib/enums'
import { CUSTOM_MONSTER_CREATED_MESSAGE, ERROR_MESSAGE } from '@/lib/messages'
import { ReactElement, useCallback, useState } from 'react'

/**
 * Create Monster Card Properties
 */
interface CreateMonsterCardProps {
  /** Local State */
  local: LocalStateType
  /** Cancel Callback */
  onCancel: () => void
  /** Monster Created Callback */
  onMonsterCreated: () => void
}

/**
 * Create Monster Card Component
 *
 * Thin wrapper around `MonsterForm` that owns the create-side persistence
 * pipeline: insert the monster, hunt board (quarry only), levels + per-level
 * hunt positions, locations, timeline years, and CC rewards (quarry only).
 *
 * @param props Create Monster Card Properties
 * @returns Create Monster Card Component
 */
export function CreateMonsterCard({
  local,
  onCancel,
  onMonsterCreated
}: CreateMonsterCardProps): ReactElement {
  const { toast } = useToast(local)
  const [isCreating, setIsCreating] = useState(false)

  /**
   * Persist the monster and all related rows.
   *
   * @param payload Monster Form Payload
   */
  const handleCreate = useCallback(
    async (payload: MonsterFormPayload) => {
      setIsCreating(true)

      try {
        const isQuarry = payload.monsterType === MonsterType.QUARRY
        const levelEntries = Object.entries(payload.levels)

        // 1. Create the monster record
        const addMonster = isQuarry ? addQuarry : addNemesis
        const monster = await addMonster({
          custom: true,
          monster_name: payload.name,
          multi_monster: levelEntries.some(
            ([, subMonsters]) => subMonsters.length > 1
          ),
          node: payload.node,
          instinct: payload.instinct.trim() || null,
          basic_action: payload.basicAction.trim() || null,
          blind_spot: payload.blindSpot.trim() || null,
          defeat_outcome: payload.defeatOutcome.trim() || null,
          deployment_rules: payload.deploymentRules.trim() || null,
          victory_outcome: payload.victoryOutcome.trim() || null,
          ...(isQuarry ? { prologue: payload.prologue } : {})
        })

        // 2. Create hunt board (quarry only)
        if (isQuarry)
          await addQuarryHuntBoard({
            quarry_id: monster.id,
            ...payload.huntBoard
          })

        // 3. Create levels + per-level hunt positions
        const addLevel = isQuarry ? addQuarryLevel : addNemesisLevel
        const idKey = isQuarry ? 'quarry_id' : 'nemesis_id'
        const traitTable = isQuarry
          ? 'quarry_level_trait'
          : 'nemesis_level_trait'
        const moodTable = isQuarry ? 'quarry_level_mood' : 'nemesis_level_mood'
        const survivorStatusTable = isQuarry
          ? 'quarry_level_survivor_status'
          : 'nemesis_level_survivor_status'

        for (const [levelStr, subMonsters] of levelEntries) {
          const levelNum = parseInt(levelStr, 10)

          for (const sub of subMonsters) {
            const { life, traits, moods, survivor_statuses, ...rest } = sub
            const insertData: Record<string, unknown> = {
              [idKey]: monster.id,
              ...rest,
              sub_monster_name: sub.sub_monster_name || null,
              level_number: levelNum,
              ai_deck_remaining:
                sub.basic_cards +
                sub.advanced_cards +
                sub.legendary_cards +
                sub.overtone_cards
            }

            // Quarry levels don't have a `life` column.
            if (!isQuarry) insertData.life = life || null

            const levelId = await (
              addLevel as (data: Record<string, unknown>) => Promise<string>
            )(insertData)

            if (traits.length > 0)
              await syncMonsterTraits(
                traitTable,
                levelId,
                traits.map((t) => t.trait_name)
              )
            if (moods.length > 0)
              await syncMonsterMoods(
                moodTable,
                levelId,
                moods.map((m) => m.mood_name)
              )
            if (survivor_statuses.length > 0)
              await syncMonsterSurvivorStatuses(
                survivorStatusTable,
                levelId,
                survivor_statuses.map((s) => s.survivor_status_name)
              )
          }

          if (isQuarry) {
            await upsertQuarryHuntBoardPosition({
              quarry_id: monster.id,
              level_number: levelNum,
              monster_hunt_pos:
                payload.levelHuntPositions[levelNum]?.huntPos ?? 12,
              survivor_hunt_pos:
                payload.levelHuntPositions[levelNum]?.survivorHuntPos ?? 0
            })
          }
        }

        // 4. Link locations
        for (const loc of payload.locations) {
          if (isQuarry)
            await addQuarryLocation({
              quarry_id: monster.id,
              location_id: loc.id
            })
          else
            await addNemesisLocation({
              nemesis_id: monster.id,
              location_id: loc.id
            })
        }

        // 5. Create timeline events
        for (const te of payload.timelineEvents) {
          const validEntries = te.entries.filter((e) => e.trim())
          if (validEntries.length === 0) continue

          if (isQuarry)
            await addQuarryTimelineYear({
              quarry_id: monster.id,
              year_number: te.year_number,
              entries: validEntries,
              campaign_types: []
            })
          else
            await addNemesisTimelineYear({
              nemesis_id: monster.id,
              year_number: te.year_number,
              entries: validEntries,
              campaign_types: []
            })
        }

        // 6. Link CC rewards (quarry only)
        if (isQuarry) {
          for (const ccr of payload.ccRewards) {
            await addQuarryCollectiveCognitionReward({
              quarry_id: monster.id,
              collective_cognition_reward_id: ccr.id
            })
          }
        }

        toast.success(CUSTOM_MONSTER_CREATED_MESSAGE(payload.monsterType))
        onMonsterCreated()
      } catch (error) {
        console.error('Create Monster Error:', error)
        toast.error(ERROR_MESSAGE())
      } finally {
        setIsCreating(false)
      }
    },
    [onMonsterCreated, toast]
  )

  return (
    <MonsterForm
      local={local}
      mode="create"
      title="Create Custom Monster"
      submitLabel="Create Monster"
      submittingLabel="Creating..."
      isSubmitting={isCreating}
      onCancel={onCancel}
      onSubmit={handleCreate}
    />
  )
}
