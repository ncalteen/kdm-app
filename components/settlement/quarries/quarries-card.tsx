'use client'

import { QuarryItem } from '@/components/settlement/quarries/quarry-item'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { LocalStateType } from '@/contexts/local-context'
import { useCatalogFetch } from '@/hooks/use-catalog-fetch'
import { useOptimisticMutation } from '@/hooks/use-optimistic-mutation'
import { useToast } from '@/hooks/use-toast'
import { getQuarries } from '@/lib/dal/quarry'
import { getQuarryCollectiveCognitionRewardIds } from '@/lib/dal/quarry-collective-cognition-reward'
import { getQuarryLocationIds } from '@/lib/dal/quarry-location'
import { getQuarryTimelineYears } from '@/lib/dal/quarry-timeline-year'
import { addSettlementCollectiveCognitionRewards } from '@/lib/dal/settlement-collective-cognition-reward'
import { addSettlementLocations } from '@/lib/dal/settlement-location'
import {
  addSettlementQuarries,
  removeSettlementQuarry,
  updateSettlementQuarry
} from '@/lib/dal/settlement-quarry'
import {
  addSettlementTimelineYear,
  saveSettlementTimelineYearEntry
} from '@/lib/dal/settlement-timeline-year'
import { CampaignType, MonsterNode } from '@/lib/enums'
import {
  ERROR_MESSAGE,
  QUARRY_ADDED_MESSAGE,
  QUARRY_REMOVED_MESSAGE,
  QUARRY_UNLOCKED_MESSAGE
} from '@/lib/messages'
import { sortQuarries } from '@/lib/settlement/quarries'
import {
  QuarryDetail,
  SettlementDetail,
  SettlementStateSetter
} from '@/lib/types'
import { PlusIcon, SwordIcon } from 'lucide-react'
import { ReactElement, useCallback, useMemo, useState } from 'react'

/**
 * Quarries Card Properties
 */
interface QuarriesCardProps {
  /** Local State */
  local: LocalStateType
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: SettlementStateSetter
}

/**
 * Quarries Card Component
 *
 * Displays the quarries linked to a settlement and allows users to add, remove,
 * and toggle the unlocked state of each quarry. All mutations are applied
 * optimistically so the UI updates before the database transaction completes.
 *
 * @param props Quarries Card Properties
 * @returns Quarries Card Component
 */
export function QuarriesCard({
  local,
  selectedSettlement,
  setSelectedSettlement
}: QuarriesCardProps): ReactElement {
  const { toast } = useToast(local)
  const mutate = useOptimisticMutation(local)

  const [addOpen, setAddOpen] = useState<boolean>(false)

  // Available quarries for the select dropdown (fetched once per settlement).
  const { data: availableQuarries, isLoaded: hasFetched } = useCatalogFetch<{
    [key: string]: QuarryDetail
  }>(
    selectedSettlement?.id,
    () =>
      // Don't include alternates or vignettes in the dropdown
      getQuarries(
        [MonsterNode.NQ1, MonsterNode.NQ2, MonsterNode.NQ3, MonsterNode.NQ4],
        false,
        false
      ),
    {
      initial: {},
      errorContext: 'Settlement Quarries Fetch Error',
      onReset: () => setAddOpen(false),
      onError: () => toast.error(ERROR_MESSAGE())
    }
  )

  /**
   * Available Quarries Not Yet Added
   *
   * Filters the full list of available quarries to only those not already
   * linked to the settlement, preventing duplicates in the add dropdown.
   */
  const selectableQuarries = useMemo(() => {
    const linkedIds = new Set(
      (selectedSettlement?.quarries ?? []).map((q) => q.quarry_id)
    )
    return Object.values(availableQuarries)
      .filter((q) => !linkedIds.has(q.id))
      .sort((a, b) => a.monster_name.localeCompare(b.monster_name))
  }, [availableQuarries, selectedSettlement?.quarries])

  /**
   * Handle Add Quarry
   *
   * Optimistically adds a quarry to the settlement, then persists to the DB.
   *
   * @param quarryId Quarry ID
   */
  const handleAdd = useCallback(
    (quarryId: string | undefined) => {
      if (!quarryId || !selectedSettlement) return

      const quarryInfo = Object.values(availableQuarries).find(
        (q) => q.id === quarryId
      )
      if (!quarryInfo) return

      setAddOpen(false)

      // Optimistic placeholder row (uses a temporary ID).
      const tempId = `temp-${crypto.randomUUID()}`
      const optimisticRow: SettlementDetail['quarries'][0] = {
        basic_action: quarryInfo.basic_action,
        blind_spot: quarryInfo.blind_spot,
        collective_cognition_level_1: false,
        collective_cognition_level_2: [false, false],
        collective_cognition_level_3: [false, false, false],
        collective_cognition_prologue: false,
        defeat_outcome: quarryInfo.defeat_outcome,
        deployment_rules: quarryInfo.deployment_rules,
        id: tempId,
        instinct: quarryInfo.instinct,
        monster_name: quarryInfo.monster_name,
        node: quarryInfo.node,
        prologue: quarryInfo.prologue,
        quarry_id: quarryId,
        unlocked: false,
        victory_outcome: quarryInfo.victory_outcome
      }

      // Capture the updated quarries list so async callbacks reference it
      // instead of the stale pre-update closure value.
      const updatedQuarries = sortQuarries([
        ...selectedSettlement.quarries,
        optimisticRow
      ])

      setSelectedSettlement({
        ...selectedSettlement,
        quarries: updatedQuarries
      })

      void mutate({
        context: 'Quarry Add',
        persist: () =>
          addSettlementQuarries([quarryId], selectedSettlement?.id),
        onSuccess: async (row) => {
          // Replace the placeholder with the real row from the DB.
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  quarries: sortQuarries(
                    prev.quarries.map((q) =>
                      q.id === tempId
                        ? {
                            ...q,
                            id: row[0].id,
                            node: quarryInfo.node,
                            prologue: quarryInfo.prologue
                          }
                        : q
                    )
                  )
                }
              : null
          )

          // Add related locations, timeline events, and CC rewards
          try {
            const campaignType =
              CampaignType[
                selectedSettlement.campaign_type as keyof typeof CampaignType
              ]

            const [locationIds, timelineYears, ccrIds] = await Promise.all([
              getQuarryLocationIds(quarryId),
              getQuarryTimelineYears(quarryId, campaignType),
              getQuarryCollectiveCognitionRewardIds(quarryId)
            ])

            // Collect new locations
            let newLocationRows: SettlementDetail['locations'] = []

            if (locationIds.length > 0) {
              const existingLocIds = new Set(
                selectedSettlement.locations.map((l) => l.location_id)
              )
              const newLocIds = locationIds.filter(
                (id) => !existingLocIds.has(id)
              )
              if (newLocIds.length > 0) {
                const inserted = await addSettlementLocations(
                  newLocIds,
                  selectedSettlement.id
                )
                newLocationRows = inserted.map((ins) => ({
                  id: ins.id,
                  location_id: ins.location_id,
                  location_name: ins.location_name,
                  rules: ins.rules,
                  unlocked: false
                }))
              }
            }

            // Collect timeline changes
            const timelineUpdates: {
              [year: number]: {
                completed: boolean
                entries: string[]
                id: string
              }
            } = {}

            if (timelineYears.length > 0) {
              for (const ty of timelineYears) {
                const existingYear = selectedSettlement.timeline[ty.year_number]
                if (existingYear) {
                  const existingEntries = new Set(existingYear.entries)
                  const newEntries = ty.entries.filter(
                    (e) => !existingEntries.has(e)
                  )
                  let updatedEntries = existingYear.entries
                  for (const entry of newEntries) {
                    updatedEntries = await saveSettlementTimelineYearEntry(
                      existingYear.id,
                      entry,
                      updatedEntries.length
                    )
                  }
                  timelineUpdates[ty.year_number] = {
                    ...existingYear,
                    entries: updatedEntries
                  }
                } else {
                  const yearId = await addSettlementTimelineYear(
                    selectedSettlement.id,
                    ty.year_number
                  )
                  let entries: string[] = []
                  for (let i = 0; i < ty.entries.length; i++) {
                    entries = await saveSettlementTimelineYearEntry(
                      yearId,
                      ty.entries[i],
                      i
                    )
                  }
                  timelineUpdates[ty.year_number] = {
                    id: yearId,
                    completed: false,
                    entries
                  }
                }
              }
            }

            // Collect CC rewards
            let newCcrRows: SettlementDetail['collective_cognition_rewards'] =
              []

            if (ccrIds.length > 0) {
              const existingCcrIds = new Set(
                selectedSettlement.collective_cognition_rewards.map(
                  (c) => c.collective_cognition_reward_id
                )
              )
              const newCcrIds = ccrIds.filter((id) => !existingCcrIds.has(id))
              if (newCcrIds.length > 0) {
                const inserted = await addSettlementCollectiveCognitionRewards(
                  newCcrIds,
                  selectedSettlement.id
                )
                newCcrRows = inserted.map((ins, i) => ({
                  id: ins.id,
                  collective_cognition_reward_id: newCcrIds[i],
                  reward_name: inserted[i].reward_name,
                  collective_cognition: inserted[i].collective_cognition,
                  rules: inserted[i].rules,
                  unlocked: false
                }))
              }
            }

            // Merge all collected changes with a functional update.
            setSelectedSettlement((prev) => {
              if (!prev) return null

              const existingLocIds = new Set(
                prev.locations.map((l) => l.location_id)
              )
              const existingCcrIds = new Set(
                prev.collective_cognition_rewards.map(
                  (c) => c.collective_cognition_reward_id
                )
              )

              return {
                ...prev,
                locations:
                  newLocationRows.length > 0
                    ? [
                        ...prev.locations,
                        ...newLocationRows.filter(
                          (nl) => !existingLocIds.has(nl.location_id)
                        )
                      ]
                    : prev.locations,
                timeline:
                  Object.keys(timelineUpdates).length > 0
                    ? { ...prev.timeline, ...timelineUpdates }
                    : prev.timeline,
                collective_cognition_rewards:
                  newCcrRows.length > 0
                    ? [
                        ...prev.collective_cognition_rewards,
                        ...newCcrRows.filter(
                          (nr) =>
                            !existingCcrIds.has(
                              nr.collective_cognition_reward_id
                            )
                        )
                      ]
                    : prev.collective_cognition_rewards
              }
            })
          } catch (relatedErr) {
            console.error('Quarry Related Data Add Error:', relatedErr)
          }
        },
        rollback: () => {
          // Remove the optimistic placeholder.
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  quarries: prev.quarries.filter((q) => q.id !== tempId)
                }
              : null
          )
        },
        successMessage: QUARRY_ADDED_MESSAGE()
      })
    },
    [selectedSettlement, availableQuarries, setSelectedSettlement, mutate]
  )

  /**
   * Handle Remove Quarry
   *
   * Optimistically removes a quarry from the settlement, then persists to the
   * DB.
   *
   * @param quarryId Settlement Quarry ID
   */
  const handleRemove = useCallback(
    (quarryId: string) => {
      if (!selectedSettlement) return

      const removed = selectedSettlement.quarries.find((q) => q.id === quarryId)
      if (!removed) return

      setSelectedSettlement({
        ...selectedSettlement,
        quarries: selectedSettlement.quarries.filter((n) => n.id !== quarryId)
      })

      void mutate({
        context: 'Quarry Remove',
        persist: () => removeSettlementQuarry(removed.id),
        rollback: () => {
          setSelectedSettlement((prev) => {
            if (!prev || prev.quarries.some((q) => q.id === removed.id))
              return prev
            return {
              ...prev,
              quarries: sortQuarries([...prev.quarries, removed])
            }
          })
        },
        successMessage: QUARRY_REMOVED_MESSAGE()
      })
    },
    [selectedSettlement, setSelectedSettlement, mutate]
  )

  /**
   * Handle Toggle Unlocked
   *
   * Optimistically toggles the unlocked state of a quarry, then persists to
   * the DB.
   *
   * @param quarryId Settlement Quarry ID
   * @param unlocked New Unlocked State
   */
  const handleToggleUnlocked = useCallback(
    (quarryId: string, unlocked: boolean) => {
      if (!selectedSettlement) return

      const target = selectedSettlement.quarries.find((q) => q.id === quarryId)
      if (!target) return

      setSelectedSettlement({
        ...selectedSettlement,
        quarries: selectedSettlement.quarries.map((n) =>
          n.id === quarryId ? { ...n, unlocked } : n
        )
      })

      void mutate({
        context: 'Quarry Toggle',
        persist: () => updateSettlementQuarry(target.id, { unlocked }),
        rollback: () => {
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  quarries: prev.quarries.map((n) =>
                    n.id === target.id ? { ...n, unlocked: !unlocked } : n
                  )
                }
              : null
          )
        },
        successMessage: QUARRY_UNLOCKED_MESSAGE(target.monster_name, unlocked)
      })
    },
    [selectedSettlement, setSelectedSettlement, mutate]
  )

  /**
   * Sorted Quarries
   *
   * Quarries sorted by node level then alphabetically by name for consistent
   * rendering order.
   */
  const sortedQuarries = useMemo(
    () => sortQuarries(selectedSettlement?.quarries ?? []),
    [selectedSettlement?.quarries]
  )

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <SwordIcon className="h-4 w-4" />
          Quarries
          <Popover open={addOpen} onOpenChange={setAddOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-0 h-8 w-8"
                disabled={selectableQuarries.length === 0}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Search quarries..." />
                <CommandList>
                  <CommandEmpty>No quarries found.</CommandEmpty>
                  <CommandGroup>
                    {selectableQuarries.map((quarry) => (
                      <CommandItem
                        key={quarry.id}
                        value={quarry.monster_name}
                        onSelect={() => handleAdd(quarry.id)}>
                        {quarry.monster_name}
                        {quarry.custom && (
                          <Badge variant="outline" className="ml-auto">
                            Custom
                          </Badge>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardTitle>
      </CardHeader>

      {/* Quarries List */}
      <CardContent className="p-1 pb-0">
        <div className="flex flex-col h-[240px]">
          <div className="flex-1 overflow-y-auto">
            {(!selectedSettlement?.quarries ||
              selectedSettlement.quarries.length === 0) &&
              hasFetched && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No quarries stalk the settlement.
                </p>
              )}

            {!hasFetched && selectedSettlement?.id && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Tracking quarries...
              </p>
            )}

            {hasFetched &&
              sortedQuarries.map((quarry) => (
                <QuarryItem
                  key={quarry.id}
                  id={quarry.id}
                  custom={availableQuarries[quarry.quarry_id]?.custom}
                  monsterName={quarry.monster_name}
                  node={quarry.node}
                  onRemove={handleRemove}
                  onToggleUnlocked={handleToggleUnlocked}
                  unlocked={quarry.unlocked}
                />
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
