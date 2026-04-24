'use client'

import {
  HuntBoardDraft,
  MonsterForm,
  MonsterFormInitialData,
  MonsterFormPayload,
  MonsterLevelDraft,
  TimelineEventDraft
} from '@/components/monster/monster-form'
import { Card } from '@/components/ui/card'
import { LocalStateType } from '@/contexts/local-context'
import { useToast } from '@/hooks/use-toast'
import {
  syncMonsterMoods,
  syncMonsterTraits
} from '@/lib/dal/monster-trait-mood'
import { getNemesis, updateNemesis } from '@/lib/dal/nemesis'
import {
  addNemesisLevel,
  getNemesisLevels,
  removeNemesisLevel,
  updateNemesisLevel
} from '@/lib/dal/nemesis-level'
import {
  addNemesisLocation,
  getNemesisLocationJunctionIds,
  getNemesisLocations,
  removeNemesisLocation
} from '@/lib/dal/nemesis-location'
import {
  addNemesisTimelineYear,
  getNemesisTimelineYears,
  removeNemesisTimelineYear,
  updateNemesisTimelineYear
} from '@/lib/dal/nemesis-timeline-year'
import { getQuarry, updateQuarry } from '@/lib/dal/quarry'
import {
  addQuarryCollectiveCognitionReward,
  getQuarryCollectiveCognitionRewardJunctionIds,
  getQuarryCollectiveCognitionRewards,
  removeQuarryCollectiveCognitionReward
} from '@/lib/dal/quarry-collective-cognition-reward'
import {
  addQuarryHuntBoard,
  getQuarryHuntBoard,
  updateQuarryHuntBoard
} from '@/lib/dal/quarry-hunt-board'
import {
  getQuarryHuntBoardPositions,
  removeQuarryHuntBoardPosition,
  upsertQuarryHuntBoardPosition
} from '@/lib/dal/quarry-hunt-board-position'
import {
  addQuarryLevel,
  getQuarryLevels,
  removeQuarryLevel,
  updateQuarryLevel
} from '@/lib/dal/quarry-level'
import {
  addQuarryLocation,
  getQuarryLocationJunctionIds,
  getQuarryLocations,
  removeQuarryLocations
} from '@/lib/dal/quarry-location'
import {
  addQuarryTimelineYear,
  getQuarryTimelineYears,
  removeQuarryTimelineYear,
  updateQuarryTimelineYear
} from '@/lib/dal/quarry-timeline-year'
import { HuntEventType, MonsterNode, MonsterType } from '@/lib/enums'
import { CUSTOM_MONSTER_UPDATED_MESSAGE, ERROR_MESSAGE } from '@/lib/messages'
import { QuarryDetail, QuarryHuntBoardDetail } from '@/lib/types'
import { ReactElement, useCallback, useEffect, useState } from 'react'

/**
 * Edit Monster Card Properties
 */
interface EditMonsterCardProps {
  /** Local State */
  local: LocalStateType
  /** Monster ID */
  monsterId: string
  /** Monster Type */
  monsterType: MonsterType
  /** Cancel Callback */
  onCancel: () => void
  /** Monster Updated Callback */
  onMonsterUpdated: () => void
}

/**
 * Convert a quarry hunt board row to the form's `HuntBoardDraft` shape (drops
 * the row id + foreign key).
 *
 * @param board Quarry Hunt Board Row
 * @returns Hunt Board Draft
 */
function toHuntBoardDraft(board: QuarryHuntBoardDetail): HuntBoardDraft {
  return {
    pos_1: board.pos_1 as HuntEventType,
    pos_2: board.pos_2 as HuntEventType,
    pos_3: board.pos_3 as HuntEventType,
    pos_4: board.pos_4 as HuntEventType,
    pos_5: board.pos_5 as HuntEventType,
    pos_7: board.pos_7 as HuntEventType,
    pos_8: board.pos_8 as HuntEventType,
    pos_9: board.pos_9 as HuntEventType,
    pos_10: board.pos_10 as HuntEventType,
    pos_11: board.pos_11 as HuntEventType
  }
}

/**
 * Edit Monster Card Component
 *
 * Loads the existing monster (and all related rows) from the database, then
 * delegates rendering to `MonsterForm`. On submit, reconciles all related
 * rows: levels (insert new, update existing, delete removed); locations
 * (delete-all + re-insert); timeline years (insert new, update existing,
 * delete removed or emptied); hunt board + per-level positions; and CC
 * rewards (delete-all + re-insert).
 *
 * @param props Edit Monster Card Properties
 * @returns Edit Monster Card Component
 */
export function EditMonsterCard({
  local,
  monsterId,
  monsterType,
  onCancel,
  onMonsterUpdated
}: EditMonsterCardProps): ReactElement {
  const { toast } = useToast(local)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [initialData, setInitialData] = useState<MonsterFormInitialData | null>(
    null
  )

  // Captures the per-level hunt position row ids so we can delete positions
  // for levels that were removed during the edit. The form doesn't need this.
  const [levelPositionIds, setLevelPositionIds] = useState<{
    [key: number]: string
  }>({})

  // Captures the loaded hunt board id so we can update it in place rather than
  // creating a duplicate row.
  const [huntBoardId, setHuntBoardId] = useState<string>('')

  /**
   * Load monster data from the database.
   */
  useEffect(() => {
    const load = async () => {
      setIsLoading(true)

      try {
        const isQuarry = monsterType === MonsterType.QUARRY

        const fns = {
          getMonster: isQuarry ? getQuarry : getNemesis,
          getMonsterLevels: isQuarry ? getQuarryLevels : getNemesisLevels,
          getMonsterLocations: isQuarry
            ? getQuarryLocations
            : getNemesisLocations,
          getMonsterTimeline: isQuarry
            ? getQuarryTimelineYears
            : getNemesisTimelineYears
        }

        const [monsterData, monsterLevels, monsterLocations, timelineYears] =
          await Promise.all([
            fns.getMonster(monsterId),
            fns.getMonsterLevels(monsterId),
            fns.getMonsterLocations(monsterId),
            fns.getMonsterTimeline(monsterId)
          ])

        // Group levels by level number
        const groupedLevels: { [key: number]: MonsterLevelDraft[] } = {}
        for (const lvl of monsterLevels) {
          if (!groupedLevels[lvl.level_number])
            groupedLevels[lvl.level_number] = []
          groupedLevels[lvl.level_number].push(
            lvl as unknown as MonsterLevelDraft
          )
        }

        let huntBoard: HuntBoardDraft | undefined
        let levelHuntPositions:
          | {
              [key: number]: { huntPos: number; survivorHuntPos: number }
            }
          | undefined
        let ccRewards: MonsterFormInitialData['ccRewards']

        if (isQuarry) {
          const board = await getQuarryHuntBoard(monsterId)
          if (board) {
            setHuntBoardId(board.id)
            huntBoard = toHuntBoardDraft(board)
          }

          const positions = await getQuarryHuntBoardPositions(monsterId)
          const huntPositions: {
            [key: number]: { huntPos: number; survivorHuntPos: number }
          } = {}
          const positionIds: { [key: number]: string } = {}

          for (const pos of positions) {
            huntPositions[pos.level_number] = {
              huntPos: pos.monster_hunt_pos,
              survivorHuntPos: pos.survivor_hunt_pos
            }
            positionIds[pos.level_number] = pos.id
          }

          // Initialize defaults for any level missing a position row.
          for (const lvl of monsterLevels) {
            if (!huntPositions[lvl.level_number])
              huntPositions[lvl.level_number] = {
                huntPos: 12,
                survivorHuntPos: 0
              }
          }

          setLevelPositionIds(positionIds)
          levelHuntPositions = huntPositions

          ccRewards = await getQuarryCollectiveCognitionRewards(monsterId)
        }

        setInitialData({
          monsterType,
          name: monsterData?.monster_name ?? '',
          node: (monsterData?.node as MonsterNode) ?? MonsterNode.NQ1,
          prologue:
            isQuarry && monsterData
              ? (monsterData as QuarryDetail).prologue
              : false,
          instinct: monsterData?.instinct ?? '',
          basicAction: monsterData?.basic_action ?? '',
          blindSpot: monsterData?.blind_spot ?? '',
          defeatOutcome: monsterData?.defeat_outcome ?? '',
          deploymentRules: monsterData?.deployment_rules ?? '',
          victoryOutcome: monsterData?.victory_outcome ?? '',
          levels: groupedLevels,
          levelHuntPositions,
          huntBoard,
          locations: monsterLocations,
          timelineEvents: timelineYears as TimelineEventDraft[],
          ccRewards
        })
      } catch (err: unknown) {
        console.error('Load Monster Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [monsterId, monsterType, toast])

  /**
   * Persist edits and reconcile every related table.
   *
   * @param payload Monster Form Payload
   */
  const handleSave = useCallback(
    async (payload: MonsterFormPayload) => {
      setIsSaving(true)

      const isQuarry = payload.monsterType === MonsterType.QUARRY

      const fns = {
        updateMonster: isQuarry ? updateQuarry : updateNemesis,
        addLevel: isQuarry ? addQuarryLevel : addNemesisLevel,
        updateLevel: isQuarry ? updateQuarryLevel : updateNemesisLevel,
        removeLevel: isQuarry ? removeQuarryLevel : removeNemesisLevel,
        addLocation: isQuarry
          ? (locId: string) =>
              addQuarryLocation({ quarry_id: monsterId, location_id: locId })
          : (locId: string) =>
              addNemesisLocation({ nemesis_id: monsterId, location_id: locId }),
        getLocationJunctionIds: isQuarry
          ? () => getQuarryLocationJunctionIds(monsterId)
          : () => getNemesisLocationJunctionIds(monsterId),
        removeLocationJunction: isQuarry
          ? (ids: string[]) => removeQuarryLocations(ids)
          : async (ids: string[]) => {
              for (const id of ids) await removeNemesisLocation(id)
            },
        addTimelineYear: isQuarry
          ? (data: { year_number: number; entries: string[] }) =>
              addQuarryTimelineYear({
                quarry_id: monsterId,
                ...data,
                campaign_types: []
              })
          : (data: { year_number: number; entries: string[] }) =>
              addNemesisTimelineYear({
                nemesis_id: monsterId,
                ...data,
                campaign_types: []
              }),
        updateTimelineYear: isQuarry
          ? updateQuarryTimelineYear
          : updateNemesisTimelineYear,
        removeTimelineYear: isQuarry
          ? removeQuarryTimelineYear
          : removeNemesisTimelineYear
      }

      try {
        // 1. Update the monster record
        await fns.updateMonster(monsterId, {
          monster_name: payload.name,
          multi_monster: Object.values(payload.levels).some(
            (l) => l.length > 1
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

        // 2. Delete removed levels
        for (const id of payload.deletedLevelIds) await fns.removeLevel(id)

        // 3. Insert new levels / update existing
        const traitTable = isQuarry
          ? 'quarry_level_trait'
          : 'nemesis_level_trait'
        const moodTable = isQuarry ? 'quarry_level_mood' : 'nemesis_level_mood'

        for (const [levelNumStr, subMonsters] of Object.entries(
          payload.levels
        )) {
          const levelNum = parseInt(levelNumStr, 10)

          for (const sub of subMonsters) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, level_number: _ln, traits, moods, ...rest } = sub

            const levelData: Record<string, unknown> = {
              ...rest,
              level_number: levelNum,
              ai_deck_remaining:
                sub.basic_cards +
                sub.advanced_cards +
                sub.legendary_cards +
                sub.overtone_cards
            }

            // Quarry levels don't have a `life` column.
            if (isQuarry) delete levelData.life

            let levelId: string
            if (id && !id.startsWith('temp-')) {
              await fns.updateLevel(id, levelData as never)
              levelId = id
            } else {
              const idKey = isQuarry ? 'quarry_id' : 'nemesis_id'
              levelId = await (
                fns.addLevel as (
                  data: Record<string, unknown>
                ) => Promise<string>
              )({ ...levelData, [idKey]: monsterId })
            }

            await syncMonsterTraits(traitTable, levelId, traits)
            await syncMonsterMoods(moodTable, levelId, moods)
          }
        }

        // 4. Quarry: per-level hunt positions (upsert active, delete stale)
        if (isQuarry) {
          const currentLevelNumbers = Object.entries(payload.levels)
            .filter(([, subMonsters]) => subMonsters.length > 0)
            .map(([levelNum]) => parseInt(levelNum, 10))

          for (const levelNum of currentLevelNumbers) {
            await upsertQuarryHuntBoardPosition({
              quarry_id: monsterId,
              level_number: levelNum,
              monster_hunt_pos:
                payload.levelHuntPositions[levelNum]?.huntPos ?? 12,
              survivor_hunt_pos:
                payload.levelHuntPositions[levelNum]?.survivorHuntPos ?? 0
            })
          }

          for (const [levelNum, positionId] of Object.entries(
            levelPositionIds
          )) {
            if (!currentLevelNumbers.includes(parseInt(levelNum, 10)))
              await removeQuarryHuntBoardPosition(positionId)
          }
        }

        // 5. Reconcile locations: delete all existing junctions, re-add
        const existingLocJunctionIds = await fns.getLocationJunctionIds()
        if (existingLocJunctionIds.length > 0)
          await fns.removeLocationJunction(existingLocJunctionIds)

        for (const location of payload.locations)
          await fns.addLocation(location.id)

        // 6. Reconcile timeline events
        for (const id of payload.deletedTimelineIds)
          await fns.removeTimelineYear(id)

        for (const te of payload.timelineEvents) {
          const validEntries = te.entries.filter((e) => e.trim())

          if (te.id && !te.id.startsWith('temp-')) {
            if (validEntries.length === 0) await fns.removeTimelineYear(te.id)
            else
              await fns.updateTimelineYear(te.id, {
                year_number: te.year_number,
                entries: validEntries
              })
          } else if (validEntries.length > 0) {
            await fns.addTimelineYear({
              year_number: te.year_number,
              entries: validEntries
            })
          }
        }

        // 7. Quarry: hunt board + CC rewards
        if (isQuarry) {
          if (huntBoardId) {
            await updateQuarryHuntBoard(huntBoardId, payload.huntBoard)
          } else {
            await addQuarryHuntBoard({
              quarry_id: monsterId,
              ...payload.huntBoard
            })
          }

          // Reconcile CC rewards: delete all junctions, re-add
          const existingCCRJunctionIds =
            await getQuarryCollectiveCognitionRewardJunctionIds(monsterId)

          for (const jId of existingCCRJunctionIds)
            await removeQuarryCollectiveCognitionReward(jId)

          for (const ccr of payload.ccRewards) {
            await addQuarryCollectiveCognitionReward({
              quarry_id: monsterId,
              collective_cognition_reward_id: ccr.id
            })
          }
        }

        toast.success(CUSTOM_MONSTER_UPDATED_MESSAGE(payload.monsterType))
        onMonsterUpdated()
      } catch (error) {
        console.error('Update Monster Error:', error)
        toast.error(ERROR_MESSAGE())
      } finally {
        setIsSaving(false)
      }
    },
    [huntBoardId, levelPositionIds, monsterId, onMonsterUpdated, toast]
  )

  if (isLoading || !initialData)
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">Loading monster data...</p>
      </Card>
    )

  return (
    <MonsterForm
      local={local}
      mode="edit"
      title="Edit Monster"
      submitLabel="Save Changes"
      submittingLabel="Saving..."
      initialData={initialData}
      isSubmitting={isSaving}
      onCancel={onCancel}
      onSubmit={handleSave}
    />
  )
}
